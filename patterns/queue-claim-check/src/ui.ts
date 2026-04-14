export const ui = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>The Claim Check Pattern</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
	* { box-sizing: border-box; }
	html, body { margin: 0; height: 100%; }
	body {
		font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		background: #000;
		color: #e5e5e5;
		-webkit-font-smoothing: antialiased;
	}

	a { color: #fb923c; text-decoration: none; font-weight: 500; }
	a:hover { text-decoration: underline; }

	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100vh;
	}
	@media (max-width: 900px) {
		.split { grid-template-columns: 1fr; height: auto; }
	}

	.pane {
		overflow-y: auto;
		padding: 36px 40px;
	}
	.pane.left {
		border-right: 1px solid #1a1a1a;
		background: #0a0a0a;
	}
	.pane.right {
		background: #000;
	}
	.pane::-webkit-scrollbar { width: 8px; }
	.pane::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
	.pane::-webkit-scrollbar-thumb:hover { background: #404040; }

	.label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #525252;
		margin-bottom: 12px;
	}

	h1 {
		font-size: 26px;
		font-weight: 700;
		margin: 0 0 8px;
		letter-spacing: -0.02em;
		color: #fafafa;
	}
	.lede { color: #a3a3a3; font-size: 15px; margin: 0 0 32px; }

	.explain h2 {
		font-size: 11px;
		margin: 0 0 10px;
		color: #525252;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
	}
	.explain p { margin: 0 0 12px; color: #d4d4d4; }
	.explain b { color: #fb923c; font-weight: 600; }
	.explain i { color: #e5e5e5; font-style: italic; }
	.explain .block { margin-bottom: 28px; }

	code.inline {
		background: #1a1a1a;
		color: #fbbf24;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 12px;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
		border: 1px solid #262626;
	}

	/* Diagram */
	.scene-wrap {
		position: relative;
		background: #0a0a0a;
		border: 1px solid #1f1f1f;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 12px;
	}
	.scene { display: block; width: 100%; height: auto; }

	.scene .node rect {
		fill: #111;
		stroke: #262626;
		stroke-width: 1.5;
		transition: all 0.3s ease;
	}
	.scene .node.active rect {
		stroke: #fb923c;
		fill: #1a0f08;
	}
	.scene .node-label { font-size: 13px; font-weight: 600; fill: #fafafa; }
	.scene .node-sub { font-size: 10px; fill: #737373; }

	.scene .queue-pipe {
		fill: #0a0a0a;
		stroke: #262626;
		stroke-width: 1.5;
		stroke-dasharray: 4 3;
		transition: all 0.3s ease;
	}
	.scene .queue-pipe.active {
		fill: #1a0f08;
		stroke: #fb923c;
		stroke-dasharray: none;
	}
	.scene .queue-label { font-size: 11px; font-weight: 600; fill: #d4d4d4; }
	.scene .queue-sub { font-size: 9px; fill: #525252; }

	.scene .guide {
		fill: none;
		stroke: #262626;
		stroke-width: 1.5;
	}
	.scene .arrow-head { fill: #525252; }
	.scene .path-label {
		font-size: 10px;
		fill: #737373;
		font-weight: 500;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
	}
	.scene .step-num {
		font-size: 9px;
		font-weight: 700;
		fill: #fb923c;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
	}

	.scene .particle { font-size: 14px; }

	.counter {
		position: absolute;
		background: #fb923c;
		color: #000;
		border-radius: 10px;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.2s;
		pointer-events: none;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
	}
	.counter.show { opacity: 1; }

	/* Sandbox */
	.send-card {
		background: #0a0a0a;
		border: 1px solid #1f1f1f;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 16px;
	}
	.send-card h3 { font-size: 14px; margin: 0 0 4px; color: #fafafa; font-weight: 600; }
	.send-card .hint { color: #737373; font-size: 12px; margin: 0 0 14px; }
	textarea {
		width: 100%;
		min-height: 70px;
		padding: 10px 12px;
		background: #050505;
		border: 1px solid #262626;
		border-radius: 8px;
		font: inherit;
		font-size: 13px;
		color: #fafafa;
		resize: vertical;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
	}
	textarea:focus { outline: none; border-color: #fb923c; }
	textarea::placeholder { color: #525252; }

	.buttons { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
	button {
		background: #fafafa;
		color: #000;
		border: 0;
		border-radius: 8px;
		padding: 9px 16px;
		font: inherit;
		font-weight: 600;
		font-size: 13px;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	button:hover { background: #e5e5e5; }
	button.ghost {
		background: transparent;
		color: #d4d4d4;
		border: 1px solid #262626;
	}
	button.ghost:hover { background: #111; border-color: #404040; }

	/* Logs */
	.log-card {
		background: #050505;
		border: 1px solid #1f1f1f;
		border-radius: 12px;
		overflow: hidden;
		font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
	}
	.log-card .head {
		font-size: 12px;
		padding: 12px 16px;
		border-bottom: 1px solid #1f1f1f;
		background: #0a0a0a;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #e5e5e5;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}
	.log-card .head .title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}
	.log-card .head .title::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
	}
	.log-card .head .live {
		font-size: 11px;
		color: #737373;
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
	}
	.log-card .head .live::before {
		content: '';
		width: 6px; height: 6px; border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
		animation: pulse 1.4s infinite;
	}
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

	.event {
		display: grid;
		grid-template-columns: 86px 56px 1fr auto;
		gap: 12px;
		align-items: baseline;
		padding: 7px 16px;
		font-size: 12px;
		line-height: 1.5;
		color: #d4d4d4;
		border-left: 2px solid transparent;
		transition: background 0.12s ease;
	}
	.event:hover { background: #0f0f0f; border-left-color: #2a2a2a; }
	.event.kind-producer:hover { border-left-color: #f59e0b; }
	.event.kind-storage:hover { border-left-color: #eab308; }
	.event.kind-queue:hover { border-left-color: #3b82f6; }
	.event.kind-consumer:hover { border-left-color: #22c55e; }
	.event.kind-error:hover { border-left-color: #ef4444; }

	.event .time {
		color: #525252;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}
	.event .badge {
		display: inline-block;
		padding: 1px 7px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
	}
	.event.kind-producer .badge { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
	.event.kind-storage .badge { background: rgba(234, 179, 8, 0.12); color: #facc15; }
	.event.kind-queue .badge { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
	.event.kind-consumer .badge { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
	.event.kind-error .badge { background: rgba(239, 68, 68, 0.12); color: #f87171; }

	.event .msg { color: #e5e5e5; }
	.event .msg .arrow { color: #525252; margin: 0 4px; }
	.event .msg .ref { color: #737373; }
	.event .meta { color: #737373; font-size: 11px; }

	.empty {
		padding: 56px 20px;
		text-align: center;
		color: #525252;
		font-family: ui-monospace, "SF Mono", Menlo, monospace;
		font-size: 12px;
	}
	.empty .big { font-size: 28px; margin-bottom: 8px; opacity: 0.4; }

	#timeline { max-height: calc(100vh - 380px); min-height: 280px; overflow-y: auto; padding: 4px 0; }
	#timeline::-webkit-scrollbar { width: 8px; }
	#timeline::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
	#timeline::-webkit-scrollbar-thumb:hover { background: #404040; }

	.footer {
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid #1f1f1f;
		color: #525252;
		font-size: 12px;
	}
</style>
</head>
<body>
<div class="split">
	<div class="pane left">
		<div class="label">Pattern</div>
		<h1>The Claim Check Pattern</h1>
		<p class="lede">Send large files through a message queue — even when they're bigger than the queue allows.</p>

		<div class="explain">
			<div class="block">
				<h2>The problem</h2>
				<p>A <b>queue</b> is like a to-do list for your app: a <b>producer</b> puts jobs on it, a <b>consumer</b> picks them up and does the work. Cloudflare Queues have a limit though — each message can only be <code class="inline">128 KB</code> (about the size of a short email).</p>
				<p>So how do you send a 5 MB photo through it?</p>
			</div>

			<div class="block">
				<h2>The trick</h2>
				<p>Instead of putting the photo on the queue, save the photo to <b>storage</b> first. Then just put a little note on the queue that says <i>"the photo is over there"</i>. The consumer picks up the note, goes and fetches the photo itself.</p>
				<p>It's the same idea as a coat check: you don't carry the coat around, you carry a little ticket. <a href="https://eda-visuals.boyney.io/visuals/claim-check-pattern" target="_blank" rel="noopener">See the visual explanation →</a></p>
			</div>

			<div class="block">
				<h2>Architecture</h2>
				<div class="scene-wrap">
					<svg class="scene" viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<!-- Storage: branch above the main flow -->
						<g id="node-storage" class="node">
							<rect x="210" y="20" width="100" height="56" rx="10" />
							<text x="260" y="46" class="node-label" text-anchor="middle">Storage</text>
							<text x="260" y="62" class="node-sub" text-anchor="middle">R2 bucket</text>
						</g>

						<!-- Producer (left) -->
						<g id="node-producer" class="node">
							<rect x="20" y="130" width="120" height="56" rx="10" />
							<text x="80" y="156" class="node-label" text-anchor="middle">Producer</text>
							<text x="80" y="172" class="node-sub" text-anchor="middle">writes ticket</text>
						</g>

						<!-- Consumer (right) -->
						<g id="node-consumer" class="node">
							<rect x="380" y="130" width="120" height="56" rx="10" />
							<text x="440" y="156" class="node-label" text-anchor="middle">Consumer</text>
							<text x="440" y="172" class="node-sub" text-anchor="middle">reads ticket</text>
						</g>

						<!-- Queue: pipe between producer and consumer -->
						<g id="node-queue">
							<rect x="160" y="146" width="200" height="24" rx="12" class="queue-pipe" />
							<text x="260" y="160" class="queue-label" text-anchor="middle">Queue</text>
							<text x="260" y="170" class="queue-sub" text-anchor="middle">128 KB max per message</text>
						</g>

						<!-- Animation paths (invisible tracks) -->
						<path id="path-p-to-storage" d="M 80 130 L 80 80 Q 80 48 130 48 L 210 48" fill="none" stroke="none" />
						<path id="path-p-to-queue" d="M 140 158 L 160 158" fill="none" stroke="none" />
						<path id="path-queue-to-c" d="M 360 158 L 380 158" fill="none" stroke="none" />
						<path id="path-storage-to-c" d="M 310 48 L 390 48 Q 440 48 440 80 L 440 130" fill="none" stroke="none" />

						<!-- Visible guide lines (same paths, dashed) -->
						<path d="M 80 130 L 80 80 Q 80 48 130 48 L 210 48" class="guide" stroke-dasharray="3 3" />
						<path d="M 310 48 L 390 48 Q 440 48 440 80 L 440 130" class="guide" stroke-dasharray="3 3" />

						<!-- Arrow heads for storage paths -->
						<polygon points="208,44 216,48 208,52" class="arrow-head" />
						<polygon points="436,128 440,136 444,128" class="arrow-head" />

						<!-- Step numbers -->
						<text x="55" y="100" class="step-num">①</text>
						<text x="245" y="138" class="step-num" text-anchor="middle">②</text>
						<text x="465" y="100" class="step-num">③</text>

						<!-- Path captions -->
						<text x="170" y="40" class="path-label" text-anchor="middle">put file</text>
						<text x="350" y="40" class="path-label" text-anchor="middle">get file</text>

						<!-- Animation layer -->
						<g id="particles"></g>
					</svg>

					<div class="counter" id="count-producer" style="left: 18px; top: 122px;">0</div>
					<div class="counter" id="count-storage" style="left: 208px; top: 12px;">0</div>
					<div class="counter" id="count-consumer" style="left: 378px; top: 122px;">0</div>
				</div>
			</div>

			<div class="block">
				<h2>When to use it</h2>
				<p>Any time payloads might exceed 128 KB: uploaded files, generated PDFs, ML inputs, big JSON bodies, bulk export rows. If your payload always fits, skip this pattern and just put it on the queue directly.</p>
			</div>
		</div>

		<div class="footer">
			Part of <a href="https://github.com/boyney123/cloudflare-patterns" target="_blank" rel="noopener">Cloudflare Patterns</a> — a collection of patterns for building on Cloudflare.
		</div>
	</div>

	<div class="pane right">
		<div class="label">Sandbox</div>
		<h1 style="font-size: 20px;">Try it yourself</h1>
		<p class="lede" style="font-size: 14px;">Send a message and watch the architecture light up as the request flows through.</p>

		<div class="send-card">
			<h3>Send a payload</h3>
			<p class="hint">Type a message, or send a 200 KB blob that's too big for the queue directly.</p>
			<textarea id="text" placeholder="Type anything here…">Hello! This is my message.</textarea>
			<div class="buttons">
				<button id="send">Send message</button>
				<button id="send-big" class="ghost">Send 200 KB blob</button>
				<button id="reset" class="ghost">Clear log</button>
			</div>
		</div>

		<div class="log-card">
			<div class="head">
				<span class="title">Runtime logs</span>
				<span class="live">streaming</span>
			</div>
			<div id="timeline">
				<div class="empty">
					<div class="big">~</div>
					<div>waiting for events…</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
const KINDS = {
	'producer.received': { badge: 'POST', kind: 'producer', text: 'producer <span class="ref">/enqueue</span> received payload', node: 'producer' },
	'producer.r2.put': { badge: 'PUT', kind: 'storage', text: 'producer <span class="arrow">→</span> R2 <span class="ref">put object</span>', node: 'storage', animate: { path: 'path-p-to-storage', glyph: '📄', duration: 900 } },
	'producer.queue.sent': { badge: 'SEND', kind: 'queue', text: 'producer <span class="arrow">→</span> queue <span class="ref">claim check</span>', node: 'queue', animate: { path: 'path-p-to-queue', glyph: '🎟️', duration: 600 } },
	'consumer.r2.got': { badge: 'GET', kind: 'storage', text: 'consumer <span class="arrow">←</span> R2 <span class="ref">fetched object</span>', node: 'storage', animate: { path: 'path-storage-to-c', glyph: '📄', duration: 900 } },
	'consumer.processed': { badge: 'OK', kind: 'consumer', text: 'consumer <span class="ref">processed payload</span>', node: 'consumer' },
	'consumer.r2.deleted': { badge: 'DEL', kind: 'storage', text: 'consumer <span class="arrow">→</span> R2 <span class="ref">deleted object</span>', node: 'storage' },
	'consumer.failed': { badge: 'ERR', kind: 'error', text: 'consumer <span class="ref">failed</span>', node: null },
};

const EXTRA = {
	'producer.queue.sent': [{ path: 'path-queue-to-c', glyph: '🎟️', duration: 600, delay: 400, hitNode: 'consumer' }],
};

function fmtTime(ts) {
	const d = new Date(ts);
	return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

let lastEventCount = 0;

async function refresh() {
	try {
		const res = await fetch('/events');
		const events = await res.json();
		render(events);
	} catch (err) {
		console.error(err);
	}
}

function render(events) {
	const timeline = document.getElementById('timeline');

	if (events.length === 0) {
		timeline.innerHTML = '<div class="empty"><div class="big">~</div><div>waiting for events…</div></div>';
	} else {
		timeline.innerHTML = events.map(e => {
			const k = KINDS[e.kind] || { badge: 'LOG', kind: 'producer', text: e.kind };
			return \`<div class="event kind-\${k.kind}">
				<span class="time">\${fmtTime(e.at)}</span>
				<span class="badge">\${k.badge}</span>
				<div class="msg">\${k.text}</div>
				<span class="meta">\${e.detail || ''}</span>
			</div>\`;
		}).join('');
	}

	setCount('producer', events.filter(e => e.kind === 'producer.received').length);
	setCount('storage', events.filter(e => e.kind === 'producer.r2.put').length);
	setCount('consumer', events.filter(e => e.kind === 'consumer.processed').length);

	if (events.length > lastEventCount) {
		timeline.scrollTop = timeline.scrollHeight;
		const fresh = events.slice(lastEventCount);
		for (const ev of fresh) {
			const k = KINDS[ev.kind];
			if (!k) continue;
			if (k.node) highlightNode(k.node);
			if (k.animate) animateParticle(k.animate);
			const extras = EXTRA[ev.kind];
			if (extras) {
				for (const e of extras) {
					setTimeout(() => {
						animateParticle(e);
						if (e.hitNode) highlightNode(e.hitNode);
					}, e.delay || 0);
				}
			}
		}
	}
	lastEventCount = events.length;
}

function setCount(step, n) {
	const el = document.getElementById('count-' + step);
	el.textContent = n;
	el.classList.toggle('show', n > 0);
}

function highlightNode(name) {
	const el = name === 'queue' ? document.querySelector('.queue-pipe') : document.getElementById('node-' + name);
	if (!el) return;
	el.classList.add('active');
	setTimeout(() => el.classList.remove('active'), 1100);
}

function animateParticle({ path, glyph, duration, reverse }) {
	const layer = document.getElementById('particles');
	const pathEl = document.getElementById(path);
	if (!pathEl || !layer) return;

	const length = pathEl.getTotalLength();
	const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.setAttribute('class', 'particle');
	text.setAttribute('text-anchor', 'middle');
	text.setAttribute('dominant-baseline', 'central');
	text.textContent = glyph;
	layer.appendChild(text);

	const start = performance.now();
	function step(now) {
		const t = Math.min(1, (now - start) / duration);
		const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
		const pos = pathEl.getPointAtLength((reverse ? 1 - eased : eased) * length);
		text.setAttribute('x', pos.x);
		text.setAttribute('y', pos.y);
		text.setAttribute('opacity', t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1);
		if (t < 1) requestAnimationFrame(step);
		else text.remove();
	}
	requestAnimationFrame(step);
}

async function enqueueBody(body, contentType) {
	await fetch('/enqueue', { method: 'POST', headers: { 'content-type': contentType }, body });
	refresh();
}

document.getElementById('send').addEventListener('click', () => {
	const body = document.getElementById('text').value;
	enqueueBody(body, 'text/plain');
});

document.getElementById('send-big').addEventListener('click', () => {
	const total = 200 * 1024;
	const blob = new Uint8Array(total);
	for (let offset = 0; offset < total; offset += 65536) {
		crypto.getRandomValues(blob.subarray(offset, Math.min(offset + 65536, total)));
	}
	enqueueBody(blob, 'application/octet-stream');
});

document.getElementById('reset').addEventListener('click', async () => {
	await fetch('/reset', { method: 'POST' });
	refresh();
});

refresh();
setInterval(refresh, 1000);
</script>
</body>
</html>
`;
