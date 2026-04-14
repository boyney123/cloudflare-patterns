import { DurableObject } from 'cloudflare:workers';

type ScheduleBody = {
	runAt: number;
	payload?: unknown;
};

// One instance of this class exists per user. Each instance has its own
// private storage and its own alarm clock — that's what makes per-user
// scheduling possible without a global job table.
export class UserScheduler extends DurableObject<Env> {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'POST' && url.pathname === '/schedule') {
			const body = (await request.json()) as ScheduleBody;
			if (typeof body.runAt !== 'number') {
				return Response.json({ error: 'runAt (ms since epoch) is required' }, { status: 400 });
			}

			// Persist whatever data the alarm() handler will need when it fires.
			// Storage survives DO eviction — it'll still be here when we wake up.
			await this.ctx.storage.put('payload', body.payload ?? null);

			// The magic line: Cloudflare will wake this DO at exactly runAt
			// and invoke alarm(). Only one alarm per DO — setting a new one
			// replaces the old one.
			await this.ctx.storage.setAlarm(body.runAt);

			return Response.json({
				scheduled: true,
				runAt: new Date(body.runAt).toISOString(),
			});
		}

		if (request.method === 'GET' && url.pathname === '/status') {
			const [alarm, payload, lastRun] = await Promise.all([
				this.ctx.storage.getAlarm(),
				this.ctx.storage.get<unknown>('payload'),
				this.ctx.storage.get<string>('lastRun'),
			]);
			return Response.json({
				nextRun: alarm ? new Date(alarm).toISOString() : null,
				lastRun: lastRun ?? null,
				payload: payload ?? null,
			});
		}

		if (request.method === 'DELETE' && url.pathname === '/schedule') {
			await this.ctx.storage.deleteAlarm();
			await this.ctx.storage.delete('payload');
			return Response.json({ cancelled: true });
		}

		return new Response('Not found', { status: 404 });
	}

	// Called by the Cloudflare runtime when the scheduled time arrives.
	// No HTTP request triggered this — the platform wakes the DO for us.
	async alarm() {
		const payload = await this.ctx.storage.get<unknown>('payload');
		const userId = this.ctx.id.name ?? this.ctx.id.toString();

		// This is where you'd do the real work: send an email, charge a card,
		// post to a queue, hit a webhook, etc. For the pattern we just log.
		console.log(`[per-user-cron] fired for user=${userId}`, payload);

		await this.ctx.storage.put('lastRun', new Date().toISOString());
		await this.ctx.storage.delete('payload');
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const userId = url.searchParams.get('user');

		if (!userId) {
			return new Response(
				[
					'per-user-cron — one Durable Object alarm per user.',
					'',
					'  POST   /schedule?user=alice  { "runAt": <ms>, "payload": {...} }',
					'  GET    /status?user=alice',
					'  DELETE /schedule?user=alice',
				].join('\n'),
				{ headers: { 'content-type': 'text/plain' } },
			);
		}

		// idFromName is deterministic: the same userId always maps to the
		// same DO instance, anywhere in the world. That's how "per-user"
		// state works — every request for alice lands on alice's DO.
		const id = env.USER_SCHEDULER.idFromName(userId);
		const stub = env.USER_SCHEDULER.get(id);

		// Forward to the DO. The host "https://do/" is a throwaway — DO
		// fetch never hits the network, but Request still needs an absolute
		// URL. We rewrite to just the pathname so the DO doesn't see the
		// ?user= query param the Worker used for routing.
		return stub.fetch(new Request(new URL(url.pathname, 'https://do/'), request));
	},
} satisfies ExportedHandler<Env>;
