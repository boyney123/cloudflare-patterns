/**
 * The UI is intentionally shipped as a single document string so the demo stays
 * easy to inspect. No framework, no build pipeline. The styling leans into a
 * torchlit dungeon-crawler feel so the game reads as a game first, with the
 * Cloudflare architecture notes tucked into a collapsible drawer.
 */
export const INDEX_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>RoomRaider</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rye&family=Rubik+Mono+One&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap" />
	<style>
		:root {
			color-scheme: dark;
			/* Palette: warm stone + molten lava + jungle green */
			--ink: #fbe6b6;
			--ink-dim: #d9b876;
			--ink-faint: #a98556;
			--stone-900: #0a0704;
			--stone-800: #140c06;
			--stone-700: #1f160b;
			--stone-600: #2f2010;
			--stone-500: #4a3218;
			--gold: #f2b13a;
			--gold-soft: #c5871f;
			--lava: #ff6a1f;
			--lava-bright: #ffaa4a;
			--lava-deep: #b83214;
			--blood: #c0392b;
			--jungle: #5fa24a;
			--jungle-deep: #2d4a25;
			--rune: #c7a6ff;

			--room-accent: var(--gold);
			--room-accent-soft: rgba(242, 177, 58, 0.25);
		}
		* { box-sizing: border-box; }
		html, body { margin: 0; min-height: 100%; }
		body {
			background:
				radial-gradient(1400px 600px at 50% -160px, rgba(255, 106, 31, 0.22), transparent 62%),
				radial-gradient(800px 500px at 90% 100%, rgba(95, 162, 74, 0.10), transparent 60%),
				radial-gradient(900px 500px at 5% 90%, rgba(184, 50, 20, 0.12), transparent 65%),
				repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 3px, rgba(255,200,120,0.015) 4px),
				linear-gradient(180deg, #120906 0%, #070302 100%);
			color: var(--ink);
			font-family: "EB Garamond", Georgia, "Times New Roman", serif;
			font-size: 17px;
			line-height: 1.55;
			padding: 28px 20px 60px;
			letter-spacing: 0.01em;
		}
		body::before {
			content: "";
			position: fixed; inset: 0;
			pointer-events: none;
			background:
				radial-gradient(1200px 600px at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%);
			z-index: 1;
		}
		.shell { max-width: 1180px; margin: 0 auto; position: relative; z-index: 2; }
		.shell.shell-narrow { max-width: 820px; }
		a { color: var(--gold); text-decoration: none; }
		a:hover { color: var(--lava-bright); }

		/* ---------- Top banner ---------- */
		.banner {
			display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
			gap: 12px;
			padding: 10px 16px;
			margin-bottom: 22px;
			position: relative;
			background:
				linear-gradient(180deg, #3a2510 0%, #1e1307 60%, #140a05 100%);
			border: 1px solid rgba(242, 177, 58, 0.35);
			border-radius: 4px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.12),
				inset 0 -2px 0 rgba(0, 0, 0, 0.6),
				0 0 40px -20px rgba(255, 106, 31, 0.5);
		}
		.banner::before {
			content: "";
			position: absolute;
			left: 8%; right: 8%; bottom: -2px;
			height: 2px;
			background: linear-gradient(90deg, transparent, var(--lava) 20%, var(--lava-bright) 50%, var(--lava) 80%, transparent);
			filter: blur(0.5px);
			box-shadow: 0 0 14px var(--lava);
		}
		.title-block { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
		.title-block .eyebrow {
			font-family: "JetBrains Mono", monospace;
			font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
			color: var(--ink-faint);
			display: none;
		}
		.title-block h1 {
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 400;
			font-size: 22px;
			letter-spacing: 0.04em;
			margin: 0;
			color: var(--gold);
			line-height: 1;
			text-shadow:
				0 1px 0 #6b3e12,
				0 2px 0 #4a2a0b,
				0 3px 10px rgba(255, 106, 31, 0.55),
				0 0 20px rgba(255, 170, 74, 0.4);
		}
		.title-block .tagline {
			font-family: "EB Garamond", serif;
			font-style: italic;
			font-size: 12px;
			color: var(--lava-bright);
			letter-spacing: 0.04em;
			opacity: 0.9;
		}
		@media (max-width: 640px) { .title-block .tagline { display: none; } }
		.banner-right { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; position: relative; }

		/* Account pill (clickable, opens dropdown) */
		.account-pill {
			display: inline-flex;
			align-items: center;
			gap: 12px;
			padding: 6px 14px 6px 10px;
			border: 1px solid rgba(242, 177, 58, 0.4);
			background: linear-gradient(180deg, #3a2510 0%, #1a0f05 100%);
			border-radius: 999px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.18),
				inset 0 -1px 0 rgba(0, 0, 0, 0.5);
			cursor: pointer;
			font: inherit;
			color: var(--ink);
			transition: border-color 140ms ease, box-shadow 140ms ease;
		}
		.account-pill:hover { border-color: var(--lava); box-shadow: inset 0 1px 0 rgba(255,200,120,0.25), 0 0 14px rgba(255,106,31,0.25); }
		.account-pill .pill-dot {
			width: 10px; height: 10px;
			border-radius: 50%;
			background: var(--lava-bright);
			box-shadow: 0 0 8px var(--lava);
			flex-shrink: 0;
		}
		.account-pill .pill-id {
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
			letter-spacing: 0.12em;
			color: var(--gold);
		}
		.account-pill .pill-hp {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			color: #f4c8c1;
			padding-left: 10px;
			border-left: 1px solid rgba(242, 177, 58, 0.25);
		}
		.account-pill .pill-hp .mini-track {
			width: 50px; height: 6px;
			background: #2a0c0a;
			border: 1px solid rgba(192, 57, 43, 0.45);
			border-radius: 2px;
			overflow: hidden;
		}
		.account-pill .pill-hp .mini-fill {
			height: 100%;
			background: linear-gradient(90deg, #c0392b 0%, #ff6b5a 70%, #ffb199 100%);
			box-shadow: 0 0 6px rgba(255, 107, 90, 0.5);
			transition: width 380ms ease;
		}
		.account-pill .caret {
			font-family: "JetBrains Mono", monospace;
			font-size: 10px;
			color: var(--ink-faint);
			transition: transform 180ms ease;
		}
		.account-pill[aria-expanded="true"] .caret { transform: rotate(180deg); }

		.account-menu {
			position: absolute;
			top: calc(100% + 8px);
			right: 0;
			min-width: 240px;
			padding: 10px;
			background: linear-gradient(180deg, #2a1a0a 0%, #140a05 100%);
			border: 1px solid rgba(242, 177, 58, 0.4);
			border-radius: 4px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.15),
				0 12px 32px -8px rgba(0,0,0,0.7),
				0 0 30px -10px rgba(255, 106, 31, 0.3);
			z-index: 30;
			display: none;
		}
		.account-menu.open { display: block; }
		.account-menu .menu-row {
			display: flex; align-items: center; justify-content: space-between; gap: 12px;
			padding: 8px 10px;
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.1em;
		}
		.account-menu .menu-row .k { color: var(--ink-faint); font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; }
		.account-menu .menu-row .v { color: var(--gold); }
		.account-menu .menu-row .v.hp { color: #f4c8c1; }
		.account-menu hr {
			border: 0;
			border-top: 1px dashed rgba(242, 177, 58, 0.2);
			margin: 6px 0;
		}
		.account-menu a.menu-item,
		.account-menu button.menu-item {
			display: flex; align-items: center; gap: 10px;
			width: 100%;
			padding: 10px 12px;
			background: transparent;
			border: 1px solid transparent;
			border-radius: 3px;
			font-family: "EB Garamond", serif;
			font-size: 14px;
			color: var(--ink);
			text-decoration: none;
			cursor: pointer;
			text-align: left;
			letter-spacing: 0;
			text-transform: none;
			box-shadow: none;
		}
		.account-menu a.menu-item:hover,
		.account-menu button.menu-item:hover {
			border-color: rgba(242, 177, 58, 0.35);
			background: rgba(74, 50, 24, 0.35);
			color: var(--lava-bright);
			transform: none;
		}
		.account-menu .menu-item .glyph { color: var(--lava-bright); font-size: 13px; }
		.explorer-seal {
			display: inline-flex; align-items: center; gap: 8px;
			font-family: "JetBrains Mono", monospace;
			font-size: 12px; letter-spacing: 0.14em;
			padding: 8px 14px;
			border: 1px solid rgba(242, 177, 58, 0.45);
			background:
				linear-gradient(180deg, #4a2f15 0%, #2a1a0a 100%);
			border-radius: 3px;
			color: var(--gold);
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.25),
				inset 0 -1px 0 rgba(0, 0, 0, 0.5),
				0 0 12px rgba(255, 106, 31, 0.15);
		}
		.explorer-seal::before {
			content: "◆";
			color: var(--lava-bright);
			text-shadow: 0 0 8px var(--lava);
		}

		/* ---------- Buttons ---------- */
		button, a.btn {
			font: inherit;
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 400;
			font-size: 13px;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			color: var(--ink);
			background:
				linear-gradient(180deg, #3a2714 0%, #1e1309 50%, #140a05 100%);
			border: 1px solid rgba(242, 177, 58, 0.4);
			border-radius: 3px;
			padding: 12px 18px;
			cursor: pointer;
			text-decoration: none;
			position: relative;
			transition: all 140ms ease;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.15),
				inset 0 -2px 0 rgba(0, 0, 0, 0.6),
				0 2px 0 rgba(0, 0, 0, 0.5);
		}
		button:hover, a.btn:hover {
			color: var(--lava-bright);
			border-color: var(--lava);
			background: linear-gradient(180deg, #5a3a1c 0%, #2c1c0c 100%);
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.25),
				inset 0 -2px 0 rgba(0, 0, 0, 0.6),
				0 0 18px rgba(255, 106, 31, 0.35);
			transform: translateY(-1px);
		}
		button:disabled { opacity: 0.45; cursor: default; transform: none; }
		.btn.ghost {
			background: transparent;
			border-color: rgba(169, 133, 86, 0.35);
			color: var(--ink-dim);
			box-shadow: none;
		}
		.btn.ghost:hover {
			color: var(--ink);
			border-color: var(--ink-dim);
			background: rgba(74, 50, 24, 0.3);
			box-shadow: none;
		}
		.btn.danger {
			border-color: rgba(192, 57, 43, 0.55);
			color: #ffcfc4;
		}
		.btn.danger:hover {
			background: linear-gradient(180deg, #5a1a12 0%, #2a0a07 100%);
			color: #ffe0da;
			border-color: var(--blood);
			box-shadow:
				inset 0 1px 0 rgba(255, 140, 120, 0.25),
				0 0 20px rgba(192, 57, 43, 0.4);
		}
		.btn.gold {
			border-color: var(--gold);
			color: var(--gold);
		}
		.btn.gold:hover {
			color: #fff4d6;
			background: linear-gradient(180deg, #6b4218 0%, #2e1b08 100%);
			box-shadow:
				inset 0 1px 0 rgba(255, 220, 150, 0.3),
				0 0 22px rgba(255, 170, 74, 0.45);
		}

		/* ---------- Layout ---------- */
		.grid {
			display: grid;
			grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
			gap: 22px;
		}
		.grid.grid-single { grid-template-columns: 1fr; max-width: 820px; margin: 0 auto; }

		/* Inline How-to-Play strip in the hero (full-width landing) */
		.how-to-play {
			margin-top: 16px;
			padding-top: 14px;
			border-top: 1px dashed rgba(169, 133, 86, 0.22);
			text-align: left;
		}
		.how-to-play .htp-label {
			font-family: "Rubik Mono One", monospace;
			font-size: 9px;
			letter-spacing: 0.22em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin-bottom: 8px;
			text-align: center;
		}
		.how-to-play .htp-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
			gap: 6px 12px;
			color: var(--ink-dim);
			font-size: 13px;
			line-height: 1.45;
		}
		.how-to-play .htp-grid > div {
			padding: 5px 10px;
		}
		.scene {
			position: relative;
			padding: 30px 32px 28px;
			background:
				radial-gradient(600px 260px at 50% -40px, var(--room-accent-soft), transparent 70%),
				linear-gradient(180deg, rgba(47,32,16,0.96) 0%, rgba(20,12,6,0.98) 100%);
			border: 1px solid rgba(242, 177, 58, 0.28);
			border-radius: 4px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.12),
				inset 0 0 0 1px rgba(0,0,0,0.4),
				0 30px 80px -40px rgba(255, 106, 31, 0.3),
				0 0 60px -20px rgba(0,0,0,0.8);
		}
		.scene::before, .scene::after {
			content: "";
			position: absolute;
			width: 26px; height: 26px;
			border: 1px solid var(--room-accent);
			opacity: 0.7;
		}
		.scene::before { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
		.scene::after { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }

		.aside-stack { display: grid; gap: 18px; align-content: start; }
		.card {
			padding: 18px 20px;
			background: linear-gradient(180deg, rgba(47,32,16,0.92), rgba(20,12,6,0.95));
			border: 1px solid rgba(169, 133, 86, 0.28);
			border-radius: 3px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.08),
				inset 0 -1px 0 rgba(0,0,0,0.4);
			position: relative;
		}

		/* ---------- Room typography ---------- */
		.room-type-strip {
			display: flex; align-items: center; gap: 14px;
			margin-bottom: 14px;
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.28em;
			text-transform: uppercase;
			color: var(--ink-faint);
		}
		.sigil {
			font-family: "Rye", serif;
			font-size: 26px;
			line-height: 1;
			width: 48px; height: 48px;
			display: inline-grid; place-items: center;
			border: 1px solid var(--room-accent);
			border-radius: 50%;
			color: var(--room-accent);
			background: radial-gradient(circle, var(--room-accent-soft), transparent 70%);
			box-shadow: 0 0 24px var(--room-accent-soft), inset 0 1px 0 rgba(255,200,120,0.15);
		}
		.room-title {
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 400;
			font-size: 36px;
			letter-spacing: 0.03em;
			margin: 6px 0 6px;
			color: var(--gold);
			text-shadow:
				0 1px 0 #6b3e12,
				0 2px 0 #4a2a0b,
				0 3px 0 #2e1a07,
				0 4px 16px rgba(255, 106, 31, 0.5);
		}
		.room-id-stamp {
			font-family: "JetBrains Mono", monospace;
			color: var(--ink-faint);
			font-size: 12px;
			letter-spacing: 0.22em;
		}
		.flavour {
			font-style: italic;
			font-size: 19px;
			line-height: 1.65;
			color: var(--ink-dim);
			margin: 20px 0 0;
			max-width: 62ch;
		}
		.log {
			margin: 22px 0 0;
			padding: 16px 20px;
			border-left: 2px solid var(--room-accent);
			background: linear-gradient(90deg, rgba(230,179,74,0.08), transparent 80%);
			color: var(--ink);
			font-size: 16.5px;
			line-height: 1.65;
			white-space: pre-line;
		}
		.log.flash {
			border-left-color: var(--lava);
			background: linear-gradient(90deg, rgba(255,106,31,0.2), transparent 80%);
			color: #ffe7c8;
			animation: flashPulse 900ms ease-out;
		}
		@keyframes flashPulse {
			0% { box-shadow: 0 0 0 0 rgba(255,106,31,0.5); }
			100% { box-shadow: 0 0 40px -10px rgba(255,106,31,0); }
		}

		/* ---------- Room-type accents ---------- */
		.type-treasure { --room-accent: #f2b13a; --room-accent-soft: rgba(242, 177, 58, 0.24); }
		.type-monster  { --room-accent: #ff6a1f; --room-accent-soft: rgba(255, 106, 31, 0.25); }
		.type-trap     { --room-accent: #8fd36f; --room-accent-soft: rgba(143, 211, 111, 0.2); }
		.type-empty    { --room-accent: #a98556; --room-accent-soft: rgba(169, 133, 86, 0.18); }

		/* ---------- Actions & doors ---------- */
		.actions {
			display: flex; flex-wrap: wrap; gap: 12px;
			margin-top: 22px;
		}
		.section-label {
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.28em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin: 0 0 10px;
		}
		.doors {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 10px;
		}
		.door {
			display: flex; flex-direction: column; align-items: center;
			padding: 16px 10px 12px;
			background:
				linear-gradient(180deg, #3a2714 0%, #1e1309 60%, #120905 100%);
			border: 1px solid rgba(169, 133, 86, 0.35);
			border-radius: 50px 50px 4px 4px;
			color: var(--ink-dim);
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			transition: all 160ms ease;
			cursor: pointer;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.12),
				inset 0 -2px 0 rgba(0,0,0,0.5);
		}
		.door:hover {
			color: var(--gold);
			border-color: var(--lava);
			transform: translateY(-2px);
			box-shadow:
				inset 0 1px 0 rgba(255, 220, 160, 0.25),
				0 0 22px rgba(255, 106, 31, 0.35);
		}
		.door-arch {
			font-family: "Rye", serif;
			font-size: 22px;
			color: var(--ink-faint);
			margin-bottom: 6px;
			line-height: 1;
		}
		.door:hover .door-arch { color: var(--lava); }

		/* ---------- Item/monster vignettes ---------- */
		.vignette-row {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
			gap: 14px;
			margin-top: 22px;
		}
		.vignette {
			padding: 16px 18px;
			background: linear-gradient(180deg, rgba(47,32,16,0.92), rgba(20,12,6,0.95));
			border: 1px solid var(--room-accent-soft);
			border-left: 4px solid var(--room-accent);
			border-radius: 3px;
			box-shadow:
				inset 0 1px 0 rgba(255, 200, 120, 0.08),
				inset 0 -1px 0 rgba(0,0,0,0.4);
		}
		.vignette .label {
			font-family: "JetBrains Mono", monospace;
			font-size: 10px;
			letter-spacing: 0.28em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin-bottom: 6px;
		}
		.vignette .name {
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 17px;
			letter-spacing: 0.04em;
			color: var(--room-accent);
			margin-bottom: 4px;
		}
		.vignette .desc { color: var(--ink-dim); font-style: italic; font-size: 15px; }

		/* ---------- Side panels ---------- */
		.panel-title {
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 14px;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			margin: 0 0 14px;
			color: var(--gold);
			display: flex; align-items: center; gap: 10px;
			text-shadow: 0 1px 0 #4a2a0b, 0 2px 8px rgba(255, 106, 31, 0.3);
		}
		.panel-title::before {
			content: "";
			width: 10px; height: 10px;
			background: var(--lava);
			transform: rotate(45deg);
			box-shadow: 0 0 12px var(--lava);
		}
		.inv-list, .visited-list {
			list-style: none; margin: 0; padding: 0; display: grid; gap: 6px;
		}
		.inv-list li {
			padding: 8px 12px;
			background: rgba(26,18,10,0.6);
			border: 1px solid rgba(230, 179, 74, 0.18);
			border-radius: 2px;
			font-family: "EB Garamond", serif;
			color: var(--ink);
			display: flex; align-items: center; gap: 8px;
		}
		.inv-list li::before {
			content: "❖";
			color: var(--gold-soft);
			font-size: 12px;
		}
		.inv-list.empty li, .visited-list.empty li {
			color: var(--ink-faint);
			font-style: italic;
			border-color: rgba(200, 177, 132, 0.1);
		}
		.inv-list.empty li::before, .visited-list.empty li::before { content: "·"; }
		.visited-list li {
			padding: 6px 10px;
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
			letter-spacing: 0.1em;
			color: var(--ink-dim);
			border: 1px dashed rgba(200, 177, 132, 0.18);
			border-radius: 2px;
			display: flex; align-items: center; gap: 8px;
		}
		.visited-list li::before { content: "›"; color: var(--gold-soft); }
		.visited-list li a { color: inherit; }
		.visited-list li a:hover { color: var(--gold); }

		.stat-row {
			display: flex; justify-content: space-between; align-items: baseline;
			padding: 7px 0;
			border-bottom: 1px dotted rgba(200, 177, 132, 0.18);
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
		}
		.stat-row:last-child { border-bottom: 0; }
		.stat-row .k { color: var(--ink-faint); letter-spacing: 0.14em; text-transform: uppercase; }
		.stat-row .v { color: var(--gold); font-weight: 600; }
		.stat-row .v.dim { color: var(--ink-faint); }
		.stat-row .v.on { color: var(--lava); }

		/* ---------- Mini-map ---------- */
		.minimap {
			font-family: "JetBrains Mono", monospace;
			font-size: 13px;
			line-height: 1.45;
			color: var(--ink-dim);
			background: #050302;
			border: 1px solid rgba(200, 177, 132, 0.2);
			border-radius: 2px;
			padding: 12px 14px;
			white-space: pre;
			overflow-x: auto;
		}
		.minimap .here { color: var(--lava); font-weight: 600; }
		.minimap .seen { color: var(--gold); }
		.minimap .unseen { color: var(--ink-faint); }
		.minimap .door-link { color: var(--ink-faint); }

		/* ---------- Architecture drawer ---------- */
		details.arch {
			border: 1px solid rgba(199, 166, 255, 0.2);
			border-radius: 2px;
			background: linear-gradient(180deg, rgba(20,14,24,0.85), rgba(10,7,12,0.9));
			padding: 0;
		}
		details.arch summary {
			cursor: pointer;
			list-style: none;
			padding: 14px 18px;
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 13px;
			letter-spacing: 0.22em;
			text-transform: uppercase;
			color: var(--rune);
			display: flex; align-items: center; justify-content: space-between;
		}
		details.arch summary::-webkit-details-marker { display: none; }
		details.arch summary::after {
			content: "▾";
			font-family: "JetBrains Mono", monospace;
			transition: transform 180ms ease;
		}
		details.arch[open] summary::after { transform: rotate(180deg); }
		.arch-body {
			padding: 4px 18px 18px;
			border-top: 1px dashed rgba(199, 166, 255, 0.2);
			font-size: 14px;
			color: var(--ink-dim);
			line-height: 1.65;
		}
		.arch-body p { margin: 12px 0; }
		.arch-body code {
			font-family: "JetBrains Mono", monospace;
			font-size: 12.5px;
			background: rgba(199, 166, 255, 0.08);
			border: 1px solid rgba(199, 166, 255, 0.15);
			padding: 1px 6px;
			border-radius: 2px;
			color: var(--rune);
		}

		/* ---------- Start screen ---------- */
		.start-hero {
			text-align: center;
			padding: 14px 18px 12px;
			position: relative;
		}
		.portal {
			position: relative;
			width: 220px;
			height: 220px;
			margin: 0 auto 24px;
		}
		.portal .ring-outer,
		.portal .ring-inner {
			position: absolute;
			inset: 0;
			border-radius: 50%;
			border: 6px solid transparent;
			background:
				conic-gradient(from 0deg,
					#ff6a1f, #ffaa4a, #ffd28a, #f2b13a, #b83214, #ff6a1f);
			-webkit-mask:
				radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px));
			        mask:
				radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px));
			animation: portalSpin 18s linear infinite;
			filter: drop-shadow(0 0 24px rgba(255, 106, 31, 0.65));
		}
		.portal .ring-inner {
			inset: 28px;
			animation-duration: 11s;
			animation-direction: reverse;
		}
		.portal .core {
			position: absolute; inset: 48px;
			border-radius: 50%;
			background:
				radial-gradient(circle at 50% 45%, #ffe1a6 0%, #ffaa4a 25%, #ff6a1f 55%, #8a2a10 90%);
			box-shadow:
				inset 0 0 40px rgba(255, 220, 150, 0.6),
				0 0 60px rgba(255, 106, 31, 0.6);
			animation: portalPulse 2.4s ease-in-out infinite;
		}
		.portal .stone-l,
		.portal .stone-r {
			position: absolute;
			top: 20%; bottom: 14%;
			width: 34px;
			background:
				linear-gradient(180deg, #4a3218 0%, #2a1a0a 100%);
			border: 1px solid rgba(242, 177, 58, 0.35);
			border-radius: 3px;
			box-shadow:
				inset 0 1px 0 rgba(255,200,120,0.15),
				inset 0 -2px 0 rgba(0,0,0,0.5);
		}
		.portal .stone-l { left: -18px; }
		.portal .stone-r { right: -18px; }
		@keyframes portalSpin { to { transform: rotate(360deg); } }
		@keyframes portalPulse {
			0%, 100% { transform: scale(1); filter: brightness(1); }
			50%      { transform: scale(1.04); filter: brightness(1.15); }
		}

		.start-hero h2 {
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 32px;
			letter-spacing: 0.02em;
			margin: 0 0 4px;
			line-height: 1.05;
			color: var(--gold);
			text-shadow:
				0 1px 0 #6b3e12,
				0 2px 0 #4a2a0b,
				0 4px 14px rgba(255, 106, 31, 0.45);
		}
		.start-hero .tagline-big {
			font-family: "EB Garamond", serif;
			font-style: italic;
			font-size: 14px;
			color: var(--lava-bright);
			margin-bottom: 12px;
			letter-spacing: 0.04em;
		}
		.start-hero p.lead {
			max-width: 56ch;
			margin: 0 auto 16px;
			color: var(--ink-dim);
			font-size: 14.5px;
			font-style: italic;
			line-height: 1.55;
		}
		.start-hero .cta { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
		.start-hero .cta .btn { padding: 9px 16px; font-size: 12px; }
		.divider {
			text-align: center;
			color: var(--ink-faint);
			letter-spacing: 0.4em;
			margin: 20px 0 10px;
			font-family: "Rye", serif;
			font-size: 12px;
		}

		/* Raider mascot + coin pile flavour on start */
		.hero-foot {
			display: flex; justify-content: space-between; align-items: flex-end;
			padding: 24px 10px 0;
			margin-top: 20px;
			border-top: 1px dashed rgba(242, 177, 58, 0.2);
			position: relative;
		}
		.hero-foot .mascot, .hero-foot .loot {
			font-size: 48px;
			line-height: 1;
			filter: drop-shadow(0 4px 12px rgba(255, 106, 31, 0.4));
		}
		.hero-foot .loot { color: var(--gold); }

		/* ---------- Long-form "Blog" section ---------- */
		.below { margin-top: 22px; }
		.longread {
			max-width: 820px;
			margin: 0 auto;
			padding: 22px 26px 30px;
			background: linear-gradient(180deg, rgba(20,12,6,0.6), rgba(10,6,3,0.7));
			border: 1px solid rgba(169, 133, 86, 0.22);
			border-radius: 4px;
			color: var(--ink);
			font-family: "EB Garamond", Georgia, serif;
			font-size: 16.5px;
			line-height: 1.7;
		}
		.longread .lr-eyebrow {
			font-family: "JetBrains Mono", monospace;
			font-size: 10px;
			letter-spacing: 0.32em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin-bottom: 8px;
		}
		.longread h2 {
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 400;
			font-size: 30px;
			letter-spacing: 0.03em;
			margin: 0 0 14px;
			color: var(--gold);
			text-shadow:
				0 1px 0 #4a2a0b,
				0 2px 12px rgba(255, 106, 31, 0.35);
		}
		.longread h3 {
			font-family: "Rubik Mono One", monospace;
			font-weight: 400;
			font-size: 14px;
			letter-spacing: 0.1em;
			text-transform: uppercase;
			margin: 32px 0 12px;
			color: var(--lava-bright);
			padding-bottom: 6px;
			border-bottom: 1px dashed rgba(255, 106, 31, 0.25);
		}
		.longread h3:first-of-type { margin-top: 8px; }
		.longread p { margin: 12px 0; color: var(--ink-dim); }
		.longread strong { color: var(--ink); font-weight: 500; }
		.longread code {
			font-family: "JetBrains Mono", monospace;
			font-size: 13px;
			color: var(--lava-bright);
			background: rgba(255, 106, 31, 0.06);
			border: 1px solid rgba(255, 106, 31, 0.18);
			padding: 1px 6px;
			border-radius: 2px;
		}
		.longread .trust-table {
			width: 100%;
			border-collapse: collapse;
			margin: 16px 0;
			font-size: 14px;
		}
		.longread .trust-table th,
		.longread .trust-table td {
			text-align: left;
			padding: 10px 12px;
			border-bottom: 1px dashed rgba(169, 133, 86, 0.2);
			vertical-align: top;
		}
		.longread .trust-table th {
			font-family: "Rubik Mono One", monospace;
			font-weight: 400;
			font-size: 10px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: var(--ink-faint);
			border-bottom-color: rgba(242, 177, 58, 0.35);
		}
		.longread .trust-table td:first-child { color: var(--gold); white-space: nowrap; }
		.longread .trust-table td { color: var(--ink-dim); }
		.longread .diagram {
			margin: 18px 0 24px;
			padding: 18px;
			background: rgba(5, 3, 2, 0.55);
			border: 1px solid rgba(169, 133, 86, 0.18);
			border-radius: 3px;
			overflow-x: auto;
			min-height: 60px;
			text-align: center;
		}
		.longread .diagram-loading {
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.18em;
			color: var(--ink-faint);
			text-transform: uppercase;
		}
		.longread .diagram svg { max-width: 100%; height: auto; }

		/* Page footer (start screen) */
		.page-footer {
			max-width: 820px;
			margin: 32px auto 0;
			padding: 18px 22px;
			display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
			gap: 12px;
			border-top: 1px dashed rgba(169, 133, 86, 0.25);
			color: var(--ink-faint);
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.14em;
		}
		.page-footer a {
			color: var(--ink-dim);
			border-bottom: 1px dashed rgba(169, 133, 86, 0.4);
			padding-bottom: 1px;
		}
		.page-footer a:hover { color: var(--lava-bright); border-bottom-color: var(--lava); }
		.page-footer .footer-tip { font-style: italic; font-family: "EB Garamond", serif; font-size: 13px; letter-spacing: 0.02em; color: var(--ink-faint); text-transform: none; max-width: 38ch; }

		/* "How it works" link in the side card scrolls to the long-form */
		.scroll-link {
			display: inline-block;
			margin-top: 10px;
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: var(--lava-bright);
			border-bottom: 1px dashed rgba(255, 106, 31, 0.4);
			padding-bottom: 1px;
			cursor: pointer;
		}
		.scroll-link:hover { color: var(--gold); border-bottom-color: var(--gold); }

		/* ---------- Door-opening overlay ---------- */
		.opening {
			position: fixed; inset: 0;
			z-index: 50;
			display: grid; place-items: center;
			background:
				radial-gradient(600px 400px at 50% 50%, rgba(26,18,10,0.92), rgba(5,3,2,0.98) 75%),
				rgba(0,0,0,0.55);
			backdrop-filter: blur(3px);
			-webkit-backdrop-filter: blur(3px);
			opacity: 0;
			pointer-events: none;
			transition: opacity 220ms ease;
		}
		.opening.on {
			opacity: 1;
			pointer-events: auto;
		}
		.opening-inner {
			text-align: center;
			max-width: 480px;
			padding: 28px 32px;
			transform: scale(0.96);
			transition: transform 260ms cubic-bezier(.22,.88,.3,1);
		}
		.opening.on .opening-inner { transform: scale(1); }
		.opening .door-big {
			position: relative;
			width: 160px;
			height: 210px;
			margin: 0 auto 24px;
			border-radius: 80px 80px 4px 4px;
			background:
				radial-gradient(120px 90px at 50% 40%, rgba(255,143,58,0.35), transparent 70%),
				linear-gradient(180deg, #2a1d10, #0d0805);
			border: 1px solid rgba(230, 179, 74, 0.45);
			box-shadow:
				0 0 0 1px rgba(0,0,0,0.6) inset,
				0 0 60px rgba(255, 143, 58, 0.35),
				0 0 140px rgba(255, 143, 58, 0.18);
			overflow: hidden;
		}
		.opening .door-big::before {
			content: "";
			position: absolute;
			inset: 12px 24px;
			border-radius: 60px 60px 2px 2px;
			border: 1px dashed rgba(230, 179, 74, 0.35);
		}
		.opening .door-big::after {
			content: "";
			position: absolute;
			left: 50%;
			top: 42%;
			width: 10px; height: 10px;
			background: var(--lava);
			border-radius: 50%;
			transform: translateX(-50%);
			box-shadow: 0 0 18px var(--lava), 0 0 36px rgba(255,143,58,0.6);
		}
		.opening .light-spill {
			position: absolute;
			left: 50%;
			top: 0;
			transform: translateX(-50%);
			width: 0%;
			height: 100%;
			background: linear-gradient(180deg, rgba(255,200,120,0.6), rgba(255,143,58,0.15) 60%, transparent);
			filter: blur(6px);
			animation: doorOpen 1600ms cubic-bezier(.25,.6,.2,1) infinite;
		}
		@keyframes doorOpen {
			0%   { width: 0%; opacity: 0; }
			35%  { opacity: 1; }
			100% { width: 82%; opacity: 0; }
		}
		.opening .glyph-ring {
			position: absolute;
			inset: -28px;
			border: 1px dashed rgba(230, 179, 74, 0.35);
			border-radius: 50%;
			animation: glyphSpin 9s linear infinite;
		}
		.opening .glyph-ring::before,
		.opening .glyph-ring::after {
			content: "✦";
			position: absolute;
			color: var(--gold);
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 14px;
			text-shadow: 0 0 10px var(--gold);
		}
		.opening .glyph-ring::before { top: -8px; left: 50%; transform: translateX(-50%); }
		.opening .glyph-ring::after  { bottom: -8px; left: 50%; transform: translateX(-50%); content: "⚜"; }
		@keyframes glyphSpin { to { transform: rotate(360deg); } }

		.opening .eyebrow-ornament {
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.32em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin-bottom: 8px;
		}
		.opening h3 {
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 700;
			font-size: 26px;
			letter-spacing: 0.1em;
			margin: 0 0 10px;
			color: var(--ink);
			text-shadow: 0 0 22px rgba(255,143,58,0.4);
		}
		.opening .chamber-id {
			font-family: "JetBrains Mono", monospace;
			font-size: 13px;
			letter-spacing: 0.2em;
			color: var(--gold);
			margin-bottom: 18px;
		}
		.opening .scroll {
			min-height: 3.2em;
			color: var(--ink-dim);
			font-style: italic;
			font-size: 16px;
			line-height: 1.55;
		}
		.opening .scroll span {
			display: inline-block;
			animation: fadeSwap 2800ms ease-in-out both;
		}
		@keyframes fadeSwap {
			0%   { opacity: 0; transform: translateY(4px); }
			15%  { opacity: 1; transform: translateY(0); }
			85%  { opacity: 1; transform: translateY(0); }
			100% { opacity: 0; transform: translateY(-4px); }
		}
		.opening .progress {
			margin: 20px auto 0;
			width: 220px;
			height: 2px;
			background: rgba(230, 179, 74, 0.12);
			overflow: hidden;
			border-radius: 2px;
		}
		.opening .progress::after {
			content: "";
			display: block;
			width: 40%;
			height: 100%;
			background: linear-gradient(90deg, transparent, var(--lava), transparent);
			animation: shimmer 1400ms linear infinite;
		}
		@keyframes shimmer {
			0%   { transform: translateX(-100%); }
			100% { transform: translateX(320%); }
		}

		/* ---------- HP bar ---------- */
		.hp-bar {
			display: inline-flex;
			align-items: center;
			gap: 10px;
			padding: 4px 0 0;
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.12em;
			color: #f4c8c1;
		}
		.account .hp-bar { padding: 0; }
		.hp-bar .hp-label { color: var(--ink-faint); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; }
		.hp-bar .hp-track {
			width: 140px; height: 10px;
			background: #2a0c0a;
			border: 1px solid rgba(192, 57, 43, 0.55);
			border-radius: 2px;
			overflow: hidden;
			box-shadow: inset 0 0 6px rgba(0,0,0,0.6);
		}
		.hp-bar .hp-fill {
			height: 100%;
			background: linear-gradient(90deg, #c0392b 0%, #ff6b5a 60%, #ffb199 100%);
			box-shadow: 0 0 8px rgba(255, 107, 90, 0.6);
			transition: width 380ms ease;
		}
		.hp-bar.low .hp-fill { animation: hpPulse 1s ease-in-out infinite; }
		@keyframes hpPulse {
			0%, 100% { filter: brightness(1); }
			50%      { filter: brightness(1.5); }
		}
		.hp-bar .hp-num { color: #ffe0da; font-weight: 600; min-width: 44px; text-align: right; }

		/* ---------- Dice overlay ---------- */
		.dice {
			position: fixed; inset: 0;
			z-index: 60;
			display: grid; place-items: center;
			background:
				radial-gradient(600px 400px at 50% 50%, rgba(26,18,10,0.92), rgba(5,3,2,0.98) 75%),
				rgba(0,0,0,0.65);
			backdrop-filter: blur(4px);
			-webkit-backdrop-filter: blur(4px);
			opacity: 0;
			pointer-events: none;
			transition: opacity 180ms ease;
		}
		.dice.on { opacity: 1; pointer-events: auto; }
		.dice-inner {
			text-align: center;
			max-width: 460px;
			padding: 24px;
		}
		.dice-kind {
			font-family: "JetBrains Mono", monospace;
			font-size: 11px;
			letter-spacing: 0.32em;
			text-transform: uppercase;
			color: var(--ink-faint);
			margin-bottom: 10px;
		}
		.dice-dc {
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 15px;
			letter-spacing: 0.18em;
			color: var(--gold);
			margin-bottom: 20px;
		}
		.d20 {
			width: 160px;
			height: 160px;
			margin: 0 auto 20px;
			position: relative;
			display: grid; place-items: center;
		}
		.d20-shape {
			position: absolute; inset: 0;
			background:
				radial-gradient(circle at 35% 30%, rgba(255,200,120,0.25), transparent 60%),
				linear-gradient(155deg, #3a2714 0%, #1a110a 60%, #0a0604 100%);
			clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
			border: 1px solid rgba(230, 179, 74, 0.6);
			box-shadow: 0 0 50px rgba(255, 143, 58, 0.35), inset 0 0 30px rgba(0,0,0,0.6);
			animation: diceTumble 900ms cubic-bezier(.2,.7,.3,1) infinite;
		}
		.d20.settled .d20-shape {
			animation: diceSettle 260ms ease-out forwards;
		}
		.d20.crit .d20-shape {
			border-color: var(--gold);
			box-shadow: 0 0 80px var(--gold), inset 0 0 40px rgba(230,179,74,0.3);
		}
		.d20.fumble .d20-shape {
			border-color: var(--blood);
			box-shadow: 0 0 80px var(--blood), inset 0 0 40px rgba(192,57,43,0.3);
		}
		@keyframes diceTumble {
			0%   { transform: rotate(0deg)    scale(0.96); }
			25%  { transform: rotate(95deg)   scale(1.05); }
			50%  { transform: rotate(190deg)  scale(0.98); }
			75%  { transform: rotate(265deg)  scale(1.04); }
			100% { transform: rotate(360deg)  scale(0.96); }
		}
		@keyframes diceSettle {
			0%   { transform: rotate(340deg) scale(1.1); }
			100% { transform: rotate(0deg)   scale(1);   }
		}
		.d20-face {
			position: relative;
			font-family: "Rye", "Rubik Mono One", serif;
			font-weight: 700;
			font-size: 52px;
			color: var(--ink);
			text-shadow: 0 0 18px rgba(255,143,58,0.55);
			z-index: 2;
			opacity: 0;
			transition: opacity 200ms ease;
		}
		.d20.settled .d20-face { opacity: 1; }
		.d20.crit .d20-face { color: var(--gold); text-shadow: 0 0 22px var(--gold); }
		.d20.fumble .d20-face { color: #ff8e8e; text-shadow: 0 0 22px var(--blood); }

		.dice-verdict {
			font-family: "Rye", "Rubik Mono One", serif;
			font-size: 22px;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			min-height: 1.4em;
			opacity: 0;
			transition: opacity 240ms ease 120ms;
		}
		.dice.settled .dice-verdict { opacity: 1; }
		.dice-verdict.success { color: var(--gold); text-shadow: 0 0 14px rgba(230,179,74,0.5); }
		.dice-verdict.failure { color: #ff8e8e; text-shadow: 0 0 14px rgba(192,57,43,0.5); }
		.dice-detail {
			margin-top: 10px;
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
			letter-spacing: 0.14em;
			color: var(--ink-faint);
			opacity: 0;
			transition: opacity 260ms ease 140ms;
		}
		.dice.settled .dice-detail { opacity: 1; }

		/* ---------- Pattern list (start screen) ---------- */
		.pattern-list {
			list-style: none;
			margin: 0;
			padding: 0;
			display: grid;
			gap: 8px;
		}
		.pattern-item {
			position: relative;
			padding: 10px 12px 10px 24px;
			background: rgba(10, 6, 3, 0.35);
			border-radius: 2px;
		}
		.pattern-item::before {
			content: "·";
			position: absolute;
			left: 10px;
			top: 8px;
			color: var(--ink-faint);
			font-weight: 700;
		}
		.pattern-name {
			font-family: "Rubik Mono One", monospace;
			font-size: 11px;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: var(--ink);
			margin-bottom: 4px;
		}
		.pattern-desc {
			margin: 0;
			color: var(--ink-dim);
			font-size: 13.5px;
			line-height: 1.55;
		}
		.pattern-desc code {
			font-family: "JetBrains Mono", monospace;
			font-size: 12px;
			color: var(--lava-bright);
			background: transparent;
			border: 0;
			padding: 0;
			border-radius: 0;
		}

		/* Cursed badge for items */
		.cursed-badge {
			display: inline-block;
			padding: 2px 8px;
			margin-left: 8px;
			font-family: "JetBrains Mono", monospace;
			font-size: 10px;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: var(--rune);
			border: 1px solid rgba(199, 166, 255, 0.5);
			border-radius: 2px;
			background: rgba(40, 28, 60, 0.6);
			box-shadow: 0 0 10px rgba(199, 166, 255, 0.25);
		}

		/* DC hint on action buttons */
		.dc-hint {
			display: block;
			font-family: "JetBrains Mono", monospace;
			font-size: 10px;
			letter-spacing: 0.2em;
			opacity: 0.72;
			margin-top: 2px;
			font-weight: 400;
		}

		/* Door being opened gets a glow */
		.door.opening-now {
			border-color: var(--lava);
			color: var(--lava);
			box-shadow: 0 0 32px rgba(255,143,58,0.45);
			animation: doorPulse 900ms ease-in-out infinite;
		}
		.door.opening-now .door-arch { color: var(--lava); }
		@keyframes doorPulse {
			0%, 100% { box-shadow: 0 0 24px rgba(255,143,58,0.35); }
			50%      { box-shadow: 0 0 44px rgba(255,143,58,0.65); }
		}

		@media (max-width: 900px) {
			body { padding: 20px 14px 40px; font-size: 16px; }
			.grid { grid-template-columns: 1fr; }
			.room-title { font-size: 28px; }
			.start-hero h2 { font-size: 30px; }
			.opening .door-big { width: 130px; height: 170px; }
		}
	</style>
</head>
<body>
	<div id="app"></div>
	<div id="dice" class="dice" aria-hidden="true">
		<div class="dice-inner">
			<div class="dice-kind" id="dice-kind">Roll</div>
			<div class="dice-dc" id="dice-dc">DC —</div>
			<div class="d20" id="d20">
				<div class="d20-shape"></div>
				<div class="d20-face" id="d20-face">—</div>
			</div>
			<div class="dice-verdict" id="dice-verdict">&nbsp;</div>
			<div class="dice-detail" id="dice-detail">&nbsp;</div>
		</div>
	</div>
	<div id="opening" class="opening" aria-hidden="true">
		<div class="opening-inner">
			<div class="door-big">
				<div class="glyph-ring"></div>
				<div class="light-spill"></div>
			</div>
			<div class="eyebrow-ornament">The door creaks open</div>
			<h3 id="opening-title">Opening the hall…</h3>
			<div class="chamber-id" id="opening-chamber"></div>
			<div class="scroll" id="opening-scroll"><span>The runewrights conjure its stones.</span></div>
			<div class="progress"></div>
		</div>
	</div>
	<script>
		const USER_KEY = 'roomraider:user';
		const VISITED_KEY = 'roomraider:visited';
		const state = {
			userId: sessionStorage.getItem(USER_KEY) || null,
			flash: null,
			lastPlayer: null,
		};

		const app = document.getElementById('app');

		const SIGILS = { treasure: '✦', monster: '☠', trap: '⚜', empty: '◯' };
		const TYPE_LABEL = {
			treasure: 'Treasure Chamber',
			monster:  'Monster Lair',
			trap:     'Trapped Hall',
			empty:    'Empty Chamber',
		};

		function escapeHtml(value) {
			return String(value).replace(/[&<>\"']/g, function (ch) {
				return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
			});
		}

		function randomHex(length) {
			const bytes = new Uint8Array(Math.ceil(length / 2));
			crypto.getRandomValues(bytes);
			return Array.from(bytes, function (byte) {
				return byte.toString(16).padStart(2, '0');
			}).join('').slice(0, length);
		}

		function applyUserHintFromUrl() {
			const url = new URL(location.href);
			const hinted = url.searchParams.get('user');
			if (!hinted) return;
			state.userId = hinted;
			sessionStorage.setItem(USER_KEY, hinted);
			sessionStorage.removeItem(VISITED_KEY);
			url.searchParams.delete('user');
			const nextQuery = url.searchParams.toString();
			history.replaceState({}, '', url.pathname + (nextQuery ? '?' + nextQuery : '') + url.hash);
		}

		const openingEl = document.getElementById('opening');
		const openingScroll = document.getElementById('opening-scroll');
		const openingChamber = document.getElementById('opening-chamber');
		let openingRotator = null;

		const OPENING_PHRASES = [
			'The runewrights conjure its stones.',
			'Ink pools into new flagstones.',
			'A torch sputters to life beyond the threshold.',
			'Something on the other side notices you.',
			'The dungeon exhales — a new hall is born.',
			'Runes settle into the walls, still warm.',
		];

		function showOpening(roomId) {
			if (!openingEl) return;
			openingChamber.textContent = 'chamber · ' + roomId;
			let i = 0;
			openingScroll.innerHTML = '<span>' + OPENING_PHRASES[0] + '</span>';
			clearInterval(openingRotator);
			openingRotator = setInterval(function () {
				i = (i + 1) % OPENING_PHRASES.length;
				openingScroll.innerHTML = '<span>' + OPENING_PHRASES[i] + '</span>';
			}, 2600);
			openingEl.classList.add('on');
			openingEl.setAttribute('aria-hidden', 'false');
		}

		function hideOpening() {
			if (!openingEl) return;
			openingEl.classList.remove('on');
			openingEl.setAttribute('aria-hidden', 'true');
			clearInterval(openingRotator);
			openingRotator = null;
		}

		function isUnvisitedRoomHref(href) {
			if (!href) return null;
			const m = href.match(/^\/room\/([a-f0-9]+)$/);
			if (!m) return null;
			const roomId = m[1];
			return getVisitedSet().has(roomId) ? null : roomId;
		}

		function recordVisit(roomId) {
			if (!roomId) return;
			const raw = sessionStorage.getItem(VISITED_KEY);
			const set = new Set(raw ? JSON.parse(raw) : []);
			set.add(roomId);
			sessionStorage.setItem(VISITED_KEY, JSON.stringify([...set]));
		}
		function getVisitedSet() {
			const raw = sessionStorage.getItem(VISITED_KEY);
			return new Set(raw ? JSON.parse(raw) : []);
		}

		async function api(path, options) {
			const request = options || {};
			const headers = new Headers(request.headers || {});
			if (state.userId) headers.set('x-demo-user', state.userId);
			if (request.body && !headers.has('content-type')) {
				headers.set('content-type', 'application/json');
			}
			const response = await fetch(path, Object.assign({}, request, { headers: headers }));
			const data = await response.json();
			if (data.userId) {
				state.userId = data.userId;
				sessionStorage.setItem(USER_KEY, data.userId);
			}
			if (!response.ok) throw new Error(data.error || ('Request failed with ' + response.status));
			return data;
		}

		function hpPill(player) {
			if (!player) return '';
			const hp = Number(player.hp ?? 0);
			const max = Number(player.maxHp ?? 50);
			const pct = Math.max(0, Math.min(100, (hp / max) * 100));
			const low = hp / max <= 0.25 ? ' low' : '';
			return [
				'<div class="hp-bar' + low + '">',
				'  <span class="hp-label">Vigour</span>',
				'  <div class="hp-track"><div class="hp-fill" style="width: ' + pct.toFixed(1) + '%;"></div></div>',
				'  <span class="hp-num">' + hp + '/' + max + '</span>',
				'</div>',
			].join('');
		}

		function accountPill(player) {
			const hp = Number((player && player.hp) ?? 0);
			const max = Number((player && player.maxHp) ?? 50);
			const pct = Math.max(0, Math.min(100, (hp / max) * 100));
			return [
				'<button type="button" class="account-pill" id="account-trigger" aria-expanded="false" aria-haspopup="true">',
				'  <span class="pill-dot"></span>',
				'  <span class="pill-id">' + escapeHtml(state.userId || 'pending') + '</span>',
				'  <span class="pill-hp">',
				'    <span class="mini-track"><span class="mini-fill" style="width: ' + pct.toFixed(1) + '%;"></span></span>',
				'    <span>' + hp + '/' + max + '</span>',
				'  </span>',
				'  <span class="caret">▾</span>',
				'</button>',
			].join('');
		}

		function accountMenu(player) {
			const hp = Number((player && player.hp) ?? 0);
			const max = Number((player && player.maxHp) ?? 50);
			return [
				'<div class="account-menu" id="account-menu" role="menu">',
				'  <div class="menu-row"><span class="k">Raider ID</span><span class="v">' + escapeHtml(state.userId || 'pending') + '</span></div>',
				'  <div class="menu-row"><span class="k">Vigour</span><span class="v hp">' + hp + ' / ' + max + '</span></div>',
				'  <hr />',
				'  <a class="menu-item" data-nav href="/player"><span class="glyph">◆</span><span>View Satchel</span></a>',
				'  <a class="menu-item" href="' + forkHref() + '" target="_blank" rel="noopener noreferrer"><span class="glyph">⧉</span><span>Open as New Raider</span></a>',
				'</div>',
			].join('');
		}

		function banner() {
			return [
				'<div class="banner">',
				'  <div class="title-block">',
				'    <h1>RoomRaider</h1>',
				'    <div class="tagline">Raid Rooms in the Cloud</div>',
				'  </div>',
				'  <div class="banner-right">',
				accountPill(state.lastPlayer),
				accountMenu(state.lastPlayer),
				'  </div>',
				'</div>',
			].join('');
		}

		// --- Dice overlay ---
		const diceEl = document.getElementById('dice');
		const diceKindEl = document.getElementById('dice-kind');
		const diceDcEl = document.getElementById('dice-dc');
		const d20El = document.getElementById('d20');
		const d20Face = document.getElementById('d20-face');
		const diceVerdictEl = document.getElementById('dice-verdict');
		const diceDetailEl = document.getElementById('dice-detail');
		let diceTumbleTimer = null;

		const DICE_KIND_LABEL = {
			take: 'Lock, Ward & Wit',
			fight: 'Strike of Steel',
			curse: 'The Curse Bites',
			trap: 'The Trap Snaps',
		};

		function showDiceTumble(kind, dc) {
			if (!diceEl) return;
			diceKindEl.textContent = DICE_KIND_LABEL[kind] || 'The Dice';
			diceDcEl.textContent = 'DC ' + dc;
			diceVerdictEl.textContent = '\u00A0';
			diceVerdictEl.className = 'dice-verdict';
			diceDetailEl.textContent = '\u00A0';
			d20El.className = 'd20';
			d20Face.textContent = '—';
			diceEl.classList.remove('settled');
			diceEl.classList.add('on');
			diceEl.setAttribute('aria-hidden', 'false');
			// Cycle random numbers while the tumble is playing so the die feels alive.
			clearInterval(diceTumbleTimer);
			diceTumbleTimer = setInterval(function () {
				d20Face.textContent = String(Math.floor(Math.random() * 20) + 1);
			}, 70);
		}

		function settleDice(roll) {
			if (!diceEl || !roll) return;
			clearInterval(diceTumbleTimer);
			diceTumbleTimer = null;
			d20Face.textContent = String(roll.roll);
			const modClass = roll.roll === 20 ? ' crit' : roll.roll === 1 ? ' fumble' : '';
			d20El.className = 'd20 settled' + modClass;
			diceEl.classList.add('settled');
			diceVerdictEl.textContent = roll.success ? 'Success' : 'Failure';
			diceVerdictEl.className = 'dice-verdict ' + (roll.success ? 'success' : 'failure');
			diceDetailEl.textContent = 'rolled ' + roll.roll + ' vs DC ' + roll.dc;
		}

		function hideDice() {
			if (!diceEl) return;
			clearInterval(diceTumbleTimer);
			diceTumbleTimer = null;
			diceEl.classList.remove('on');
			diceEl.classList.remove('settled');
			diceEl.setAttribute('aria-hidden', 'true');
		}

		function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

		function kindForAction(action, room, canDefeat) {
			// The client can't know for sure whether a cursed roll will happen,
			// but we always open with the action's primary roll kind.
			if (action === 'take') return 'take';
			if (action === 'defeat') return 'fight';
			return null;
		}

		function dcForAction(action, room) {
			const c = room && room.checks;
			if (!c) return '?';
			if (action === 'take') return c.takeDC;
			if (action === 'defeat') return c.fightDC;
			return '?';
		}

		function frame(mainHtml, sideHtml, belowHtml) {
			const single = !sideHtml;
			const gridClass = single ? 'grid grid-single' : 'grid';
			const shellClass = single ? 'shell shell-narrow' : 'shell';
			return [
				'<div class="' + shellClass + '">',
				banner(),
				'  <div class="' + gridClass + '">',
				'    <section>' + mainHtml + '</section>',
				sideHtml ? '    <aside class="aside-stack">' + sideHtml + '</aside>' : '',
				'  </div>',
				belowHtml ? '  <div class="below">' + belowHtml + '</div>' : '',
				'</div>',
			].join('');
		}

		function forkHref() {
			const nextUser = randomHex(8);
			return location.pathname + '?user=' + nextUser;
		}

		function longread() {
			const firstVisitDiagram = [
				'flowchart LR',
				'  Browser --> Worker',
				'  Worker --> AI[Workers AI]',
				'  AI --> Room[(Room storage)]',
				'  Room --> Facet[Facet sandbox]',
				'  Facet --> Browser',
			].join('\n');

			const repeatDiagram = [
				'flowchart LR',
				'  Browser --> Worker',
				'  Worker --> Room[(Room storage)]',
				'  Room --> Facet[Facet sandbox]',
				'  Facet --> Browser',
			].join('\n');

			const diceDiagram = [
				'flowchart LR',
				'  Action --> Facet[Facet rolls dice]',
				'  Facet --> Delta[damage + items]',
				'  Delta --> Player[Player storage]',
				'  Player --> Browser',
			].join('\n');

			return [
				'<article class="longread" id="howitworks">',
				'  <div class="lr-eyebrow">Architecture · The Long Version</div>',
				'  <h2>How RoomRaider Works</h2>',
				'  <p>RoomRaider is a small showcase for combining three Cloudflare primitives — <strong>Workers AI</strong>, <strong>Dynamic Workers</strong>, and <strong>Durable Object Facets</strong> — without losing the trust boundary that keeps player state safe from generated, sandboxed code.</p>',

				'  <h3>The trust boundary</h3>',
				'  <p>Four storage locations, each with a different owner. The dynamic, AI-generated room code can only write to its own facet KV. Everything else is touched by trusted code only.</p>',
				'  <table class="trust-table">',
				'    <thead><tr><th>Storage</th><th>Scope</th><th>Holds</th><th>Writer</th></tr></thead>',
				'    <tbody>',
				'      <tr><td>PlayerSupervisor SQLite</td><td>per raider</td><td>inventory, HP, visited rooms</td><td>trusted only</td></tr>',
				'      <tr><td>RoomSupervisor SQLite</td><td>per room</td><td>room definition, global progression</td><td>trusted only</td></tr>',
				'      <tr><td>Facet KV</td><td>per (room, raider)</td><td>visit history, takeLockedOut</td><td><strong>dynamic code</strong></td></tr>',
				'      <tr><td>Worker Loader cache</td><td>per codeId</td><td>the loaded module itself</td><td>runtime</td></tr>',
				'    </tbody>',
				'  </table>',
				'  <p>The dynamic room code can roll dice, mutate its own facet storage, and <em>propose</em> deltas like <code>damage</code> or <code>itemGained</code>. It cannot reach inventory or HP directly. The damage doesn\'t hit because the room said so — it hits because <code>PlayerSupervisor.applyRoomOutcome</code> received a <code>damage: number</code> delta, clamped it to 5, and subtracted from HP.</p>',

				'  <h3>First visit to a chamber</h3>',
				'  <p>The first time anyone enters a room ID, Workers AI generates the room: title, item (with a possible cursed flag), monster, difficulty checks, damage range, and per-action flavour text. <code>RoomSupervisor</code> normalizes and clamps the response, compiles a Durable Object module source string, and stores it in SQLite forever.</p>',
				'  <div class="diagram" data-mermaid="' + escapeAttr(firstVisitDiagram) + '"><div class="diagram-loading">conjuring diagram…</div></div>',

				'  <h3>Repeat visits</h3>',
				'  <p>Subsequent visits skip the AI call. The cached room module is loaded by <code>LOADER.get(codeId)</code> and the per-(room, raider) facet is attached. Different raiders entering the same room get separate facets running the same module — same code, isolated state.</p>',
				'  <div class="diagram" data-mermaid="' + escapeAttr(repeatDiagram) + '"><div class="diagram-loading">conjuring diagram…</div></div>',

				'  <h3>Dice, damage, and trust</h3>',
				'  <p>Rolls happen <em>inside</em> the sandboxed facet — that\'s on theme for "the room owns its own logic." But the player never takes more than 5 HP per hit, and HP can\'t go below 0, because <code>PlayerSupervisor</code> enforces those clamps when applying the delta. The room can ask for 9999 damage; the supervisor will hand back at most 5.</p>',
				'  <div class="diagram" data-mermaid="' + escapeAttr(diceDiagram) + '"><div class="diagram-loading">conjuring diagram…</div></div>',

				'  <h3>Why facets, not one DO per room</h3>',
				'  <p>A single Durable Object per room could hold the room rules, but it would force every raider through one storage namespace. Facets give us per-(room, raider) isolation for free: the same loaded module runs against a fresh KV per raider. It also keeps the dynamic code\'s blast radius local — a buggy generated room can corrupt one raider\'s facet, never another\'s.</p>',

				'  <h3>What the AI controls vs. what trusted code controls</h3>',
				'  <p><strong>AI controls:</strong> names, descriptions, prose, the <code>cursed</code> flag, suggested DCs and damage ranges, all per-action narration.</p>',
				'  <p><strong>Trusted code controls:</strong> HP cap (50), max damage per hit (5), DC range (5–18), how/when deltas apply, who can read what storage. The <code>normalizeDraft</code> function in <code>roomClasses.ts</code> is the chokepoint — every AI value passes through clamping there before it reaches the generated module source.</p>',
				'</article>',
			].join('');
		}

		function escapeAttr(s) {
			return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		// --- Mermaid lazy loader ---
		let mermaidPromise = null;
		let mermaidObserver = null;
		const renderedDiagrams = new WeakSet();

		function loadMermaid() {
			if (mermaidPromise) return mermaidPromise;
			mermaidPromise = new Promise(function (resolve, reject) {
				const s = document.createElement('script');
				s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
				s.async = true;
				s.onload = function () {
					if (window.mermaid) {
						window.mermaid.initialize({
							startOnLoad: false,
							theme: 'dark',
							themeVariables: {
								background: '#0a0604',
								primaryColor: '#2f2010',
								primaryTextColor: '#fbe6b6',
								primaryBorderColor: '#f2b13a',
								lineColor: '#a98556',
								secondaryColor: '#3a2510',
								tertiaryColor: '#1a0f05',
								actorBkg: '#2f2010',
								actorBorder: '#f2b13a',
								actorTextColor: '#fbe6b6',
								actorLineColor: '#a98556',
								signalColor: '#d9b876',
								signalTextColor: '#fbe6b6',
								labelBoxBkgColor: '#2f2010',
								labelBoxBorderColor: '#f2b13a',
								labelTextColor: '#fbe6b6',
								loopTextColor: '#fbe6b6',
								noteBkgColor: '#3a2510',
								noteTextColor: '#fbe6b6',
								noteBorderColor: '#a98556',
								altBackground: '#1a0f05',
							},
						});
						resolve(window.mermaid);
					} else reject(new Error('mermaid failed to load'));
				};
				s.onerror = reject;
				document.head.appendChild(s);
			});
			return mermaidPromise;
		}

		async function renderDiagram(el) {
			if (renderedDiagrams.has(el)) return;
			const source = el.getAttribute('data-mermaid');
			if (!source) return;
			renderedDiagrams.add(el);
			try {
				const mermaid = await loadMermaid();
				const id = 'm' + Math.random().toString(36).slice(2, 9);
				const { svg } = await mermaid.render(id, source);
				el.innerHTML = svg;
			} catch (err) {
				el.innerHTML = '<div class="diagram-loading">diagram unavailable (' + escapeHtml(err.message || 'error') + ')</div>';
			}
		}

		function scheduleMermaid() {
			// Lazy: only render diagrams that scroll into view.
			if (mermaidObserver) mermaidObserver.disconnect();
			if (typeof IntersectionObserver === 'undefined') {
				document.querySelectorAll('.diagram[data-mermaid]').forEach(renderDiagram);
				return;
			}
			mermaidObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) renderDiagram(entry.target);
				});
			}, { rootMargin: '200px' });
			document.querySelectorAll('.diagram[data-mermaid]').forEach(function (el) {
				mermaidObserver.observe(el);
			});
		}

		function inventoryPanel(player) {
			const items = player.inventory.length
				? player.inventory.map(function (item) {
					return '<li><span>' + escapeHtml(item.name) + '</span><span style="color: var(--gold);">' + escapeHtml(item.value) + 'g</span></li>';
				}).join('')
				: '<li>Your satchel is empty.</li>';

			const visited = player.roomsVisited.slice(0, 8).length
				? player.roomsVisited.slice(0, 8).map(function (roomId) {
					return '<li><a data-nav href="/room/' + encodeURIComponent(roomId) + '">' + escapeHtml(roomId) + '</a></li>';
				}).join('')
				: '<li>No halls yet walked.</li>';

			return [
				'<section class="card">',
				'  <h2 class="panel-title">Satchel</h2>',
				'  <div class="stat-row"><span class="k">Halls walked</span><span class="v">' + escapeHtml(player.totalRoomsExplored) + '</span></div>',
				'  <div class="stat-row"><span class="k">Items carried</span><span class="v">' + escapeHtml(player.inventory.length) + '</span></div>',
				'  <div class="stat-row"><span class="k">Total value</span><span class="v">' + escapeHtml(player.inventory.reduce(function (sum, item) { return sum + item.value; }, 0)) + 'g</span></div>',
				'  <ul class="inv-list' + (player.inventory.length ? '' : ' empty') + '" style="margin-top: 14px;">' + items + '</ul>',
				'  <h3 class="panel-title" style="margin-top: 22px; font-size: 13px;">Recent Halls</h3>',
				'  <ul class="visited-list' + (player.roomsVisited.length ? '' : ' empty') + '">' + visited + '</ul>',
				'</section>',
			].join('');
		}

		function miniMap(roomPage) {
			const visited = getVisitedSet();
			const here = roomPage.room.roomId;
			const doors = roomPage.room.doors;

			// Cross layout: current room in center, doors radiating out.
			const d0 = doors[0] || '······';
			const d1 = doors[1] || '······';
			const d2 = doors[2] || '······';
			const d3 = doors[3] || '······';

			function cell(id) {
				if (!id || id === '······') return '<span class="unseen">·' + id.padEnd(6, '·') + '·</span>';
				const cls = visited.has(id) ? 'seen' : 'unseen';
				return '<a class="door-link ' + cls + '" data-nav href="/room/' + encodeURIComponent(id) + '">[' + id + ']</a>';
			}

			const hereCell = '<span class="here">[' + here + ']</span>';
			const lines = [
				'           ' + cell(d0),
				'                │',
				cell(d3) + '  ──  ' + hereCell + '  ──  ' + cell(d1),
				'                │',
				'           ' + cell(d2),
			];

			return [
				'<section class="card">',
				'  <h2 class="panel-title">Map Fragment</h2>',
				'  <div class="minimap">' + lines.join('\n') + '</div>',
				'  <div style="margin-top: 10px; font-size: 12px; color: var(--ink-faint); font-style: italic;">Gold marks halls you have entered. Grey halls wait in the dark.</div>',
				'</section>',
			].join('');
		}

		function architectureDrawer(roomPage) {
			return [
				'<details class="arch">',
				'  <summary>Codex of the Runewrights</summary>',
				'  <div class="arch-body">',
				'    <p>The chamber definition was generated once with Workers AI, then stored by <code>RoomSupervisor</code> as code and content for room <code>' + escapeHtml(roomPage.room.roomId) + '</code>.</p>',
				'    <p>Room progression — <code>itemTaken</code>, <code>monsterDefeated</code>, <code>trapTriggered</code> — also lives in <code>RoomSupervisor</code>. If one raider empties a room, it stays empty for all.</p>',
				'    <p>Room behaviour was conjured at runtime via <code>LOADER.get()</code> as <code>' + escapeHtml(roomPage.behaviorClass) + '</code> from stored code id <code>' + escapeHtml(roomPage.loaderCodeId) + '</code>.</p>',
				'    <p>The facet holds only this raider\'s visit history. Inventory changes are applied afterwards by trusted code — dynamic room code cannot reach the player\'s ledger.</p>',
				'  </div>',
				'</details>',
			].join('');
		}

		function roomStatePanel(roomPage) {
			const rs = roomPage.roomState;
			const fs = roomPage.interaction.facetState;
			function onoff(v) { return v ? '<span class="v on">TRUE</span>' : '<span class="v dim">false</span>'; }
			return [
				'<section class="card">',
				'  <h2 class="panel-title">Chamber Record</h2>',
				'  <div style="font-family:\"Rubik Mono One\", monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--ink-faint); text-transform: uppercase; margin-bottom: 8px;">Shared by all raiders</div>',
				'  <div class="stat-row"><span class="k">itemTaken</span>' + onoff(rs.itemTaken) + '</div>',
				'  <div class="stat-row"><span class="k">monsterDefeated</span>' + onoff(rs.monsterDefeated) + '</div>',
				'  <div class="stat-row"><span class="k">trapTriggered</span>' + onoff(rs.trapTriggered) + '</div>',
				'  <div style="font-family:\"Rubik Mono One\", monospace; font-size: 10px; letter-spacing: 0.22em; color: var(--ink-faint); text-transform: uppercase; margin: 18px 0 8px;">Your footsteps only</div>',
				'  <div class="stat-row"><span class="k">visited</span>' + onoff(fs.visited) + '</div>',
				'  <div class="stat-row"><span class="k">visits</span><span class="v">' + escapeHtml(fs.visits) + '</span></div>',
				'  <div class="stat-row"><span class="k">itemsLostHere</span><span class="v ' + (fs.itemsLostHere.length ? '' : 'dim') + '">' + escapeHtml(fs.itemsLostHere.join(', ') || 'none') + '</span></div>',
				'</section>',
			].join('');
		}

		function roomActions(roomPage) {
			const actions = [];
			const checks = roomPage.room.checks || {};
			const dead = roomPage.player && roomPage.player.dead;
			if (dead) {
				return '<div style="color: var(--ink-faint); font-style: italic;">You cannot act while fallen.</div>';
			}
			if (roomPage.interaction.canTake && roomPage.room.item) {
				const cursedNote = roomPage.room.item.cursed ? ' · cursed: DC ' + checks.curseDC : '';
				actions.push(
					'<button class="gold" data-action="take" data-room-id="' + escapeHtml(roomPage.room.roomId) + '">' +
					'◆ Take the ' + escapeHtml(roomPage.room.item.name) +
					'<span class="dc-hint">roll vs DC ' + escapeHtml(checks.takeDC) + cursedNote + '</span>' +
					'</button>'
				);
			}
			if (roomPage.interaction.canDefeat) {
				actions.push(
					'<button class="danger" data-action="defeat" data-room-id="' + escapeHtml(roomPage.room.roomId) + '">' +
					'⚔ Fight<span class="dc-hint">roll vs DC ' + escapeHtml(checks.fightDC) + ' · ' +
					escapeHtml(checks.damageMin) + '–' + escapeHtml(checks.damageMax) + ' dmg on miss</span>' +
					'</button>'
				);
			}
			actions.push('<button class="ghost" data-action="flee" data-room-id="' + escapeHtml(roomPage.room.roomId) + '">↷ Flee</button>');
			return actions.join('');
		}

		function roomDoors(roomPage) {
			if (!roomPage.room.doors.length) return '<div style="color: var(--ink-faint); font-style: italic;">No doors lead onward.</div>';
			return roomPage.room.doors.map(function (doorId) {
				return [
					'<a class="door" data-nav href="/room/' + encodeURIComponent(doorId) + '">',
					'  <span class="door-arch">∩</span>',
					'  <span>' + escapeHtml(doorId) + '</span>',
					'</a>',
				].join('');
			}).join('');
		}

		function renderStart(data) {
			if (data.player) state.lastPlayer = data.player;
			app.innerHTML = frame(
				[
					'<section class="scene type-treasure" style="padding: 16px 22px;">',
					'  <div class="start-hero">',
					'    <h2>RoomRaider</h2>',
					'    <div class="tagline-big">Raid Rooms in the Cloud</div>',
					'    <p class="lead">Every chamber is shared between all who raid it. What one raider takes, the next finds gone. What one slays stays slain. Yet your satchel, your scars — these are yours alone.</p>',
					'    <div class="cta">',
					'      <a class="btn gold" data-nav href="/room/' + encodeURIComponent(data.firstRoomId) + '">Begin the Raid</a>',
					'      <a class="btn ghost" data-scroll-to="howitworks">How it Works ↓</a>',
					'    </div>',
					'    <div class="how-to-play">',
					'      <div class="htp-label">How to Play</div>',
					'      <div class="htp-grid">',
					'        <div>· Enter a chamber. Read what stirs there.</div>',
					'        <div>· <span style="color: var(--gold);">Take</span> treasure before another does.</div>',
					'        <div>· <span style="color: var(--blood);">Fight</span> the monster or <span style="color: var(--ink);">flee</span> through a door.</div>',
					'        <div>· Traps spring only once — for someone.</div>',
					'      </div>',
					'    </div>',
					'  </div>',
					'</section>',
				].join(''),
				null,
				longread() + [
					'<footer class="page-footer">',
					'  <div class="footer-tip">Open a second tab from your raider menu to raid the same chamber as someone else — the dungeon will remember what the first of you did.</div>',
					'  <div>',
					'    <a href="https://github.com/boyney123/cloudflare-room-raiders" target="_blank" rel="noopener noreferrer">View Source ⧉</a>',
					'  </div>',
					'</footer>',
				].join('')
			);
			scheduleMermaid();
		}

		function renderPlayerPage(data) {
			const player = data.player;
			state.lastPlayer = player;
			app.innerHTML = frame(
				[
					'<section class="scene">',
					'  <div class="room-type-strip"><span class="sigil">❖</span><div><div class="eyebrow" style="font-family:\"JetBrains Mono\",monospace; color: var(--ink-faint); letter-spacing: 0.28em;">The Raider\'s Ledger</div></div></div>',
					'  <h1 class="room-title">Your Satchel</h1>',
					'  <div class="room-id-stamp">raider · ' + escapeHtml(player.userId) + '</div>',
					'  <p class="flavour">This ledger is kept by a trusted scribe. What you carry, where you have walked — no dungeon hall can reach in and rewrite it.</p>',
					'  <div class="vignette-row">',
					'    <div class="vignette"><div class="label">Halls walked</div><div class="name">' + escapeHtml(player.totalRoomsExplored) + '</div></div>',
					'    <div class="vignette"><div class="label">Items carried</div><div class="name">' + escapeHtml(player.inventory.length) + '</div></div>',
					'    <div class="vignette"><div class="label">Last hall</div><div class="name">' + escapeHtml(player.roomsVisited[0] || '—') + '</div></div>',
					'  </div>',
					'  <div class="actions"><a class="btn gold" data-nav href="/">Return to the Threshold</a></div>',
					'</section>',
				].join(''),
				inventoryPanel(player)
			);
		}

		function renderRoom(roomPage) {
			recordVisit(roomPage.room.roomId);
			state.lastPlayer = roomPage.player;
			state.lastRoom = roomPage.room;

			const type = roomPage.room.type;
			const sigil = SIGILS[type] || '◯';
			const typeLabel = TYPE_LABEL[type] || type;

			const cursedBadge = roomPage.room.item && roomPage.room.item.cursed
				? '<span class="cursed-badge">⚠ Cursed</span>'
				: '';
			const itemBlock = roomPage.room.item
				? '<div class="vignette"><div class="label">◆ The prize' + (roomPage.room.item.cursed ? ' (beware)' : '') + '</div><div class="name">' + escapeHtml(roomPage.room.item.name) + ' <span style="color: var(--gold);">· ' + escapeHtml(roomPage.room.item.value) + 'g</span>' + cursedBadge + '</div><div class="desc">' + escapeHtml(roomPage.room.item.description) + '</div></div>'
				: '';
			const monsterBlock = roomPage.room.monster
				? '<div class="vignette"><div class="label">☠ The dweller</div><div class="name">' + escapeHtml(roomPage.room.monster.name) + '</div><div class="desc">' + escapeHtml(roomPage.room.monster.description) + '</div></div>'
				: '';
			const vignetteRow = (itemBlock || monsterBlock)
				? '<div class="vignette-row">' + itemBlock + monsterBlock + '</div>'
				: '';

			const flashClass = state.flash ? 'log flash' : 'log';
			const message = state.flash || roomPage.interaction.message;

			if (roomPage.player && roomPage.player.dead) {
				app.innerHTML = frame(
					[
						'<section class="scene type-monster">',
						'  <div class="room-type-strip"><span class="sigil">☠</span><div><div class="eyebrow" style="color: var(--ink-faint); letter-spacing: 0.28em;">The dark takes you</div></div></div>',
						'  <h1 class="room-title">You have fallen.</h1>',
						'  <div class="room-id-stamp">chamber · ' + escapeHtml(roomPage.room.roomId) + '</div>',
						'  <p class="flavour">Your torch sputters out. The dungeon keeps what it remembers — the rooms you cleared, the monsters you slew — but you begin again, empty-handed.</p>',
						'  <div class="actions" style="margin-top: 22px;">',
						'    <button class="gold" data-action-special="revive">✦ Rise Again</button>',
						'    <a class="btn ghost" data-nav href="/">Return to the Threshold</a>',
						'  </div>',
						'</section>',
					].join(''),
					[
						inventoryPanel(roomPage.player),
					].join('')
				);
				state.flash = null;
				return;
			}

			app.innerHTML = frame(
				[
					'<section class="scene type-' + type + '">',
					'  <div class="room-type-strip">',
					'    <span class="sigil">' + sigil + '</span>',
					'    <div>',
					'      <div>' + escapeHtml(typeLabel) + '</div>',
					'      <div class="room-id-stamp">chamber · ' + escapeHtml(roomPage.room.roomId) + '</div>',
					'    </div>',
					'  </div>',
					'  <h1 class="room-title">' + escapeHtml(roomPage.room.title) + '</h1>',
					'  <div class="room-id-stamp" style="margin-bottom: 12px;">' + escapeHtml(typeLabel) + ' · stored AI room module</div>',
					'  <p class="flavour">' + escapeHtml(roomPage.room.flavourText) + '</p>',
					'  <div class="' + flashClass + '">' + escapeHtml(message) + '</div>',
					'  ' + vignetteRow,
					'  <div style="margin-top: 26px;">',
					'    <div class="section-label">Your move</div>',
					'    <div class="actions">' + roomActions(roomPage) + '</div>',
					'  </div>',
					'  <div style="margin-top: 26px;">',
					'    <div class="section-label">Doors onward</div>',
					'    <div class="doors">' + roomDoors(roomPage) + '</div>',
					'  </div>',
					'  <div style="margin-top: 26px; display: flex; gap: 10px; flex-wrap: wrap;">',
					'    <a class="btn ghost" data-nav href="/player">Check Satchel</a>',
					'    <a class="btn ghost" data-nav href="/">New Raid Seed</a>',
					'  </div>',
					'</section>',
				].join(''),
				[
					miniMap(roomPage),
					inventoryPanel(roomPage.player),
					roomStatePanel(roomPage),
					architectureDrawer(roomPage),
				].join('')
			);

			state.flash = null;
		}

		async function renderRoute() {
			try {
				applyUserHintFromUrl();
				if (location.pathname === '/') {
					const start = await api('/api/start');
					renderStart(start);
					return;
				}
				if (location.pathname === '/player') {
					const player = await api('/api/player');
					renderPlayerPage(player);
					return;
				}
				const roomMatch = location.pathname.match(/^\/room\/([a-f0-9]+)$/);
				if (roomMatch) {
					const roomPage = await api('/api/room/' + roomMatch[1]);
					renderRoom(roomPage);
					return;
				}
				history.replaceState({}, '', '/');
				await renderRoute();
			} catch (error) {
				app.innerHTML = frame(
					[
						'<section class="scene type-monster">',
						'  <h1 class="room-title">The torch goes out.</h1>',
						'  <p class="flavour">Something went wrong in the dark.</p>',
						'  <div class="log flash">' + escapeHtml(error.message || String(error)) + '</div>',
						'  <div class="actions"><a class="btn gold" data-nav href="/">Relight a torch</a></div>',
						'</section>',
					].join(''),
					'<section class="card"><h2 class="panel-title">Recovery</h2><p style="color: var(--ink-dim); font-style: italic;">The room logic is dynamic code. If the demo breaks, reload or start a fresh raider to reset the client view.</p></section>'
				);
			}
		}

		document.addEventListener('click', async function (event) {
			// Account-pill dropdown: open/close + click-outside
			const trigger = event.target.closest('#account-trigger');
			const menu = document.getElementById('account-menu');
			if (trigger) {
				event.preventDefault();
				const open = menu && menu.classList.toggle('open');
				trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
				return;
			}
			if (menu && menu.classList.contains('open') && !event.target.closest('#account-menu')) {
				menu.classList.remove('open');
				const t = document.getElementById('account-trigger');
				if (t) t.setAttribute('aria-expanded', 'false');
				// fall through so a click on a menu link still navigates
			}

			// Smooth-scroll links: <a data-scroll-to="elementId">
			const scrollTarget = event.target.closest('[data-scroll-to]');
			if (scrollTarget) {
				event.preventDefault();
				const id = scrollTarget.getAttribute('data-scroll-to');
				const el = document.getElementById(id);
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'start' });
					// Render diagrams immediately if user jumped past the lazy threshold
					el.querySelectorAll('.diagram[data-mermaid]').forEach(renderDiagram);
				}
				return;
			}

			const navTarget = event.target.closest('[data-nav]');
			if (navTarget) {
				event.preventDefault();
				const href = navTarget.getAttribute('href');
				if (!href) return;
				const unvisitedId = isUnvisitedRoomHref(href);
				if (unvisitedId) {
					if (navTarget.classList.contains('door')) {
						navTarget.classList.add('opening-now');
					}
					showOpening(unvisitedId);
				}
				history.pushState({}, '', href);
				try {
					await renderRoute();
				} finally {
					hideOpening();
				}
				return;
			}

			const reviveTarget = event.target.closest('[data-action-special="revive"]');
			if (reviveTarget) {
				event.preventDefault();
				reviveTarget.setAttribute('disabled', 'disabled');
				try {
					await api('/api/revive', { method: 'POST' });
					await renderRoute();
				} finally {
					reviveTarget.removeAttribute('disabled');
				}
				return;
			}

			const actionTarget = event.target.closest('[data-action]');
			if (actionTarget) {
				event.preventDefault();
				const roomId = actionTarget.getAttribute('data-room-id');
				const action = actionTarget.getAttribute('data-action');
				if (!roomId || !action) return;
				actionTarget.setAttribute('disabled', 'disabled');

				const rollsDice = action === 'take' || action === 'defeat';
				if (rollsDice && state.lastRoom && state.lastRoom.roomId === roomId) {
					showDiceTumble(kindForAction(action), dcForAction(action, state.lastRoom));
				}

				try {
					const result = await api('/api/room/' + roomId + '/' + action, { method: 'POST' });

					if (rollsDice && result.roll) {
						settleDice(result.roll);
						await wait(900);
					}

					state.flash = result.message;
					const redirectUnvisited = isUnvisitedRoomHref(result.redirectTo);
					if (redirectUnvisited) showOpening(redirectUnvisited);
					history.pushState({}, '', result.redirectTo);
					try {
						await renderRoute();
					} finally {
						hideOpening();
						hideDice();
					}
				} catch (err) {
					hideDice();
					throw err;
				} finally {
					actionTarget.removeAttribute('disabled');
				}
			}
		});

		window.addEventListener('popstate', async function () {
			const unvisitedId = isUnvisitedRoomHref(location.pathname);
			if (unvisitedId) showOpening(unvisitedId);
			try {
				await renderRoute();
			} finally {
				hideOpening();
			}
		});

		(async function bootstrap() {
			const unvisitedId = isUnvisitedRoomHref(location.pathname);
			if (unvisitedId) showOpening(unvisitedId);
			try {
				await renderRoute();
			} finally {
				hideOpening();
			}
		})();
	</script>
</body>
</html>`;
