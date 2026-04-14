/**
 * Claim Check pattern for Cloudflare Queues.
 *
 * Cloudflare Queues cap each message at 128 KB. To enqueue a payload of any
 * size, the producer writes the body to R2 and sends only a small reference
 * ("claim check") through the queue. The consumer reads the reference,
 * fetches the object from R2, processes it, then deletes it.
 *
 * This worker also serves a small UI at `/` that visualises the flow.
 * Events are appended to a KV namespace so the UI can poll them back.
 */

import { ui } from './ui';

// The "claim check" — what we actually put on the queue. It's tiny (~150 B)
// regardless of how big the underlying payload is.
interface ClaimCheck {
	id: string;
	key: string;
	contentType: string;
	size: number;
	receivedAt: number;
}

type EventKind = 'producer.received' | 'producer.r2.put' | 'producer.queue.sent' | 'consumer.r2.got' | 'consumer.processed' | 'consumer.r2.deleted' | 'consumer.failed';

interface Event {
	kind: EventKind;
	id: string;
	key: string;
	at: number;
	detail?: string;
}

const EVENTS_KEY = 'log';
const MAX_EVENTS = 200;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'GET' && url.pathname === '/') {
			return new Response(ui, { headers: { 'content-type': 'text/html; charset=utf-8' } });
		}

		if (request.method === 'GET' && url.pathname === '/events') {
			const events = await readEvents(env);
			return Response.json(events);
		}

		if (request.method === 'POST' && url.pathname === '/reset') {
			await env.EVENTS.delete(EVENTS_KEY);
			return Response.json({ ok: true });
		}

		// PRODUCER — receives a payload of any size and enqueues a claim check.
		if (request.method === 'POST' && url.pathname === '/enqueue') {
			const body = await request.arrayBuffer();
			const id = crypto.randomUUID();
			const key = `inbox/${Date.now()}-${id}`;
			const contentType = request.headers.get('content-type') ?? 'application/octet-stream';

			await appendEvent(env, { kind: 'producer.received', id, key, at: Date.now(), detail: `${body.byteLength} bytes` });

			// 1. Stash the payload in R2 — this is the "coat" being checked in.
			//    R2 has no practical size limit (5 TB per object) so the body can be huge.
			await env.PAYLOADS.put(key, body, { httpMetadata: { contentType } });
			await appendEvent(env, { kind: 'producer.r2.put', id, key, at: Date.now() });

			// 2. Send only the reference through the queue — the "ticket".
			//    This stays well under the 128 KB queue message limit even though
			//    the actual payload can be many megabytes.
			const claim: ClaimCheck = { id, key, contentType, size: body.byteLength, receivedAt: Date.now() };
			await env.JOBS.send(claim);
			await appendEvent(env, { kind: 'producer.queue.sent', id, key, at: Date.now(), detail: `claim check ~${JSON.stringify(claim).length} bytes` });

			return Response.json({ enqueued: true, ...claim });
		}

		return new Response('Not found', { status: 404 });
	},

	// CONSUMER — invoked by the queue when messages are ready.
	async queue(batch, env): Promise<void> {
		for (const message of batch.messages) {
			const claim = message.body;
			try {
				// 3. Use the ticket to fetch the actual payload from R2.
				const object = await env.PAYLOADS.get(claim.key);
				if (!object) {
					// The R2 object is gone — nothing to retry, ack and move on.
					await appendEvent(env, { kind: 'consumer.failed', id: claim.id, key: claim.key, at: Date.now(), detail: 'R2 object missing' });
					message.ack();
					continue;
				}

				await appendEvent(env, { kind: 'consumer.r2.got', id: claim.id, key: claim.key, at: Date.now(), detail: `${claim.size} bytes` });

				// 4. Do the actual work with the payload.
				await processPayload(claim, object);
				await appendEvent(env, { kind: 'consumer.processed', id: claim.id, key: claim.key, at: Date.now() });

				// 5. Clean up R2 so the bucket doesn't grow forever.
				//    Alternative: leave it and use an R2 lifecycle rule to expire after N days.
				await env.PAYLOADS.delete(claim.key);
				await appendEvent(env, { kind: 'consumer.r2.deleted', id: claim.id, key: claim.key, at: Date.now() });

				message.ack();
			} catch (err) {
				// Don't ack — the queue will redeliver. After max_retries (see wrangler.jsonc)
				// the message lands in the DLQ but the R2 object is left in place for inspection.
				await appendEvent(env, { kind: 'consumer.failed', id: claim.id, key: claim.key, at: Date.now(), detail: String(err) });
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env, ClaimCheck>;

async function processPayload(claim: ClaimCheck, object: R2ObjectBody): Promise<void> {
	const bytes = await object.arrayBuffer();
	console.log(`processed key=${claim.key} contentType=${claim.contentType} size=${bytes.byteLength}`);
}

async function readEvents(env: Env): Promise<Event[]> {
	const raw = await env.EVENTS.get(EVENTS_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as Event[];
	} catch {
		return [];
	}
}

async function appendEvent(env: Env, event: Event): Promise<void> {
	const current = await readEvents(env);
	current.push(event);
	const trimmed = current.slice(-MAX_EVENTS);
	await env.EVENTS.put(EVENTS_KEY, JSON.stringify(trimmed));
}
