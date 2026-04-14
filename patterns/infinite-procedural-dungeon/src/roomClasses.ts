import {
	MAX_DAMAGE_PER_HIT,
	MAX_DC,
	MIN_DC,
	type GeneratedRoomDraft,
	type ItemDefinition,
	type RoomChecks,
	type RoomDefinition,
	type RoomEntity,
	type RoomType,
} from './types';

/**
 * AI generates structured room drafts once. Trusted code compiles those drafts
 * into concrete room module source strings and stores them on the room record.
 *
 * That gives the demo a stronger Dynamic Workers story than a static per-type
 * switch, while still keeping syntax safety and game-rule invariants under our
 * control.
 */

export function buildRoomGenerationPrompt(input: { roomId: string; doors: string[] }) {
	const system = `You generate JSON for a single room in a procedural dice-rolling text dungeon.

Output only the room object that matches the provided JSON schema.

Fields:
- title: short evocative room title
- type: one of "treasure", "monster", "trap", "empty"
- flavourText: 1-2 sentences describing the room itself
- enterText: 1 sentence describing what happens on first entry
- fleeText: 1 sentence for leaving the room
- item: { name, description, value (5-40), cursed (boolean) } — treasure rooms AND monster rooms MUST have an item (monsters guard loot). Null for trap/empty.
- monster: { name, description } only for monster rooms, otherwise null.
- checks: { takeDC, fightDC, curseDC, trapDC, damageMin, damageMax } — DCs are integers 5-18 (higher = harder). damageMin/damageMax 1-5 (the dungeon caps damage at 5 per hit).
- takeText / takeFailText: success/failure narration for "take" roll (treasure rooms only).
- emptyTakeText: shown when another explorer already took the item.
- curseHitText / curseSpareText: cursed-item outcome lines (only if item.cursed === true).
- defeatText / fightFailText: success/failure narration for "fight" roll (monster rooms only).
- safeText: shown after the monster is already slain.
- trapHitText / trapSpareText: success/failure narration for trap dodge roll (trap rooms only).

Tone:
- terminal-friendly fantasy / dungeon crawler
- specific and vivid, not generic
- concise enough to fit in a UI panel

Balance guidance:
- About 25% of treasure/monster-loot items should be cursed.
- Cursed items should read dangerous but tempting.
- Pick DCs appropriate to how dangerous the room feels.
`;

	const user = `Generate one room for roomId "${input.roomId}".

Door IDs already assigned by trusted code:
${input.doors.join(', ')}

Return JSON only.`;

	return [
		{ role: 'system', content: system },
		{ role: 'user', content: user },
	];
}

export function buildRoomGenerationSchema() {
	const nullableString = { anyOf: [{ type: 'string' }, { type: 'null' }] };
	return {
		name: 'generated_room_draft',
		description: 'Schema for one generated dungeon room draft.',
		strict: true,
		schema: {
			type: 'object',
			additionalProperties: false,
			properties: {
				title: { type: 'string' },
				type: { type: 'string', enum: ['treasure', 'monster', 'trap', 'empty'] },
				flavourText: { type: 'string' },
				enterText: { type: 'string' },
				takeText: nullableString,
				takeFailText: nullableString,
				emptyTakeText: nullableString,
				curseHitText: nullableString,
				curseSpareText: nullableString,
				defeatText: nullableString,
				fightFailText: nullableString,
				safeText: nullableString,
				trapHitText: nullableString,
				trapSpareText: nullableString,
				fleeText: { type: 'string' },
				checks: {
					type: 'object',
					additionalProperties: false,
					properties: {
						takeDC: { type: 'integer' },
						fightDC: { type: 'integer' },
						curseDC: { type: 'integer' },
						trapDC: { type: 'integer' },
						damageMin: { type: 'integer' },
						damageMax: { type: 'integer' },
					},
					required: ['takeDC', 'fightDC', 'curseDC', 'trapDC', 'damageMin', 'damageMax'],
				},
				item: {
					anyOf: [
						{
							type: 'object',
							additionalProperties: false,
							properties: {
								name: { type: 'string' },
								description: { type: 'string' },
								value: { type: 'integer' },
								cursed: { type: 'boolean' },
							},
							required: ['name', 'description', 'value', 'cursed'],
						},
						{ type: 'null' },
					],
				},
				monster: {
					anyOf: [
						{
							type: 'object',
							additionalProperties: false,
							properties: {
								name: { type: 'string' },
								description: { type: 'string' },
							},
							required: ['name', 'description'],
						},
						{ type: 'null' },
					],
				},
			},
			required: [
				'title',
				'type',
				'flavourText',
				'enterText',
				'takeText',
				'takeFailText',
				'emptyTakeText',
				'curseHitText',
				'curseSpareText',
				'defeatText',
				'fightFailText',
				'safeText',
				'trapHitText',
				'trapSpareText',
				'fleeText',
				'checks',
				'item',
				'monster',
			],
		},
	};
}

export function extractGeneratedRoomDraft(raw: string): GeneratedRoomDraft | null {
	const text = raw.trim();
	const candidate = extractJsonObject(text);
	if (!candidate) return null;

	let parsed: unknown;
	try {
		parsed = JSON.parse(candidate);
	} catch {
		return null;
	}

	return normalizeDraft(parsed);
}

export function createRoomDefinition(input: {
	roomId: string;
	draft: GeneratedRoomDraft;
	doors: string[];
}): RoomDefinition {
	return {
		roomId: input.roomId,
		title: input.draft.title,
		type: input.draft.type,
		item: input.draft.item,
		monster: input.draft.monster,
		doors: input.doors,
		flavourText: input.draft.flavourText,
		checks: input.draft.checks,
		codeId: getBehaviorCodeId(input.roomId),
		moduleSource: buildRoomModule(input.draft),
	};
}

export function getBehaviorCodeId(roomId: string): string {
	return `generated-room:${roomId}:v1`;
}

export function getBehaviorClassName(): string {
	return 'Room';
}

function normalizeDraft(value: unknown): GeneratedRoomDraft | null {
	if (!value || typeof value !== 'object') return null;
	const draft = value as Record<string, unknown>;
	const type = normalizeRoomType(draft.type);
	if (!type) return null;

	const title = normalizeSentence(draft.title, 72);
	const flavourText = normalizeSentence(draft.flavourText, 220);
	const enterText = normalizeSentence(draft.enterText, 220);
	const fleeText = normalizeSentence(draft.fleeText, 140);
	if (!title || !flavourText || !enterText || !fleeText) return null;

	// Monster rooms now guard loot: if the AI forgot an item, synthesize a simple one.
	const item =
		type === 'treasure' || type === 'monster'
			? normalizeItem(draft.item) ?? (type === 'monster' ? fallbackMonsterLoot() : null)
			: null;
	const monster = type === 'monster' ? normalizeEntity(draft.monster) : null;

	if (type === 'treasure' && !item) return null;
	if (type === 'monster' && !monster) return null;

	const checks = normalizeChecks(draft.checks, type);

	return {
		title,
		type,
		flavourText,
		enterText,
		item,
		monster,
		checks,
		takeText:
			type === 'treasure' || (type === 'monster' && item)
				? normalizeSentence(draft.takeText, 180) ?? `You claim the ${item!.name}.`
				: null,
		takeFailText:
			type === 'treasure'
				? normalizeSentence(draft.takeFailText, 180) ?? `The ${item!.name} resists your touch. It will not come loose.`
				: null,
		emptyTakeText: item ? normalizeSentence(draft.emptyTakeText, 180) ?? `The ${item.name} is already gone.` : null,
		curseHitText:
			item?.cursed
				? normalizeSentence(draft.curseHitText, 180) ?? `The ${item.name} burns cold as it bites you.`
				: null,
		curseSpareText:
			item?.cursed
				? normalizeSentence(draft.curseSpareText, 180) ?? `The ${item.name} settles, quiet for now.`
				: null,
		defeatText:
			type === 'monster'
				? normalizeSentence(draft.defeatText, 180) ?? `You defeat the ${monster!.name}.`
				: null,
		fightFailText:
			type === 'monster'
				? normalizeSentence(draft.fightFailText, 180) ?? `The ${monster!.name} cuts you and you fall back.`
				: null,
		safeText:
			type === 'monster'
				? normalizeSentence(draft.safeText, 180) ?? `The ${monster!.name} is gone. The room is quiet now.`
				: null,
		trapHitText:
			type === 'trap'
				? normalizeSentence(draft.trapHitText, 180) ?? 'The trap snaps shut before you can react.'
				: null,
		trapSpareText:
			type === 'trap'
				? normalizeSentence(draft.trapSpareText, 180) ?? 'You sidestep the mechanism just in time.'
				: null,
		fleeText,
	};
}

function normalizeChecks(value: unknown, type: RoomType): RoomChecks {
	const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
	const takeDC = clampInt(raw.takeDC, MIN_DC, MAX_DC, defaultDC(type, 'take'));
	const fightDC = clampInt(raw.fightDC, MIN_DC, MAX_DC, defaultDC(type, 'fight'));
	const curseDC = clampInt(raw.curseDC, MIN_DC, MAX_DC, defaultDC(type, 'curse'));
	const trapDC = clampInt(raw.trapDC, MIN_DC, MAX_DC, defaultDC(type, 'trap'));
	const damageMin = clampInt(raw.damageMin, 1, MAX_DAMAGE_PER_HIT, 2);
	const damageMax = clampInt(raw.damageMax, damageMin, MAX_DAMAGE_PER_HIT, Math.min(MAX_DAMAGE_PER_HIT, damageMin + 2));
	return { takeDC, fightDC, curseDC, trapDC, damageMin, damageMax };
}

function defaultDC(type: RoomType, kind: 'take' | 'fight' | 'curse' | 'trap'): number {
	if (kind === 'take') return type === 'treasure' ? 10 : 8;
	if (kind === 'fight') return 12;
	if (kind === 'curse') return 11;
	return 10;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
	const n = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.max(min, Math.min(max, Math.round(n)));
}

function fallbackMonsterLoot(): ItemDefinition {
	return {
		name: 'worn talisman',
		description: 'A cracked talisman the monster was hoarding.',
		value: 12,
		cursed: false,
	};
}

function normalizeRoomType(value: unknown): RoomType | null {
	return value === 'treasure' || value === 'monster' || value === 'trap' || value === 'empty' ? value : null;
}

function normalizeSentence(value: unknown, maxLength: number): string | null {
	if (typeof value !== 'string') return null;
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (!normalized) return null;
	return normalized.slice(0, maxLength);
}

function normalizeEntity(value: unknown): RoomEntity | null {
	if (!value || typeof value !== 'object') return null;
	const entity = value as Record<string, unknown>;
	const name = normalizeSentence(entity.name, 60);
	const description = normalizeSentence(entity.description, 180);
	if (!name || !description) return null;
	return { name, description };
}

function normalizeItem(value: unknown): ItemDefinition | null {
	const entity = normalizeEntity(value);
	if (!entity) return null;
	const record = value as Record<string, unknown>;
	const rawValue = typeof record.value === 'number' ? record.value : Number(record.value);
	const clamped = Number.isFinite(rawValue) ? Math.max(5, Math.min(40, Math.round(rawValue))) : 10;
	const cursed = record.cursed === true;
	return { ...entity, value: clamped, cursed };
}

function extractJsonObject(raw: string): string | null {
	if (raw.startsWith('{') && raw.endsWith('}')) {
		return raw;
	}

	const fenced = raw.match(/```(?:json)?\s*\n([\s\S]*?)```/i);
	if (fenced) {
		return fenced[1].trim();
	}

	const start = raw.indexOf('{');
	const end = raw.lastIndexOf('}');
	return start >= 0 && end > start ? raw.slice(start, end + 1) : null;
}

function buildRoomModule(draft: GeneratedRoomDraft): string {
	const L = (value: unknown) => JSON.stringify(value ?? null);
	const lit = {
		type: L(draft.type),
		enterText: L(draft.enterText),
		fleeText: L(draft.fleeText),
		takeText: L(draft.takeText ?? 'You take the item.'),
		takeFailText: L(draft.takeFailText ?? 'The item resists you. It will not come loose.'),
		emptyTakeText: L(draft.emptyTakeText ?? 'Nothing remains to take.'),
		curseHitText: L(draft.curseHitText ?? 'The item bites back as you grasp it.'),
		curseSpareText: L(draft.curseSpareText ?? 'The item settles, quiet for now.'),
		defeatText: L(draft.defeatText ?? 'You win the fight.'),
		fightFailText: L(draft.fightFailText ?? 'The creature slashes you and you stagger back.'),
		safeText: L(draft.safeText ?? 'The room is safe.'),
		trapHitText: L(draft.trapHitText ?? 'The trap catches you square.'),
		trapSpareText: L(draft.trapSpareText ?? 'You avoid the mechanism just in time.'),
	};

	return [
		'import { DurableObject } from "cloudflare:workers";',
		`const ROOM_TYPE = ${lit.type};`,
		`const ENTER_TEXT = ${lit.enterText};`,
		`const FLEE_TEXT = ${lit.fleeText};`,
		`const TAKE_TEXT = ${lit.takeText};`,
		`const TAKE_FAIL_TEXT = ${lit.takeFailText};`,
		`const EMPTY_TAKE_TEXT = ${lit.emptyTakeText};`,
		`const CURSE_HIT_TEXT = ${lit.curseHitText};`,
		`const CURSE_SPARE_TEXT = ${lit.curseSpareText};`,
		`const DEFEAT_TEXT = ${lit.defeatText};`,
		`const FIGHT_FAIL_TEXT = ${lit.fightFailText};`,
		`const SAFE_TEXT = ${lit.safeText};`,
		`const TRAP_HIT_TEXT = ${lit.trapHitText};`,
		`const TRAP_SPARE_TEXT = ${lit.trapSpareText};`,
		'',
		'export class Room extends DurableObject {',
		'  loadState() {',
		'    const kv = this.ctx.storage.kv;',
		'    return {',
		"      visited: Boolean(kv.get('visited')),",
		"      visits: Number(kv.get('visits') ?? 0),",
		"      itemsLostHere: kv.get('itemsLostHere') ?? [],",
		"      takeLockedOut: Boolean(kv.get('takeLockedOut')),",
		'    };',
		'  }',
		'',
		'  saveState(state) {',
		'    const kv = this.ctx.storage.kv;',
		"    kv.put('visited', state.visited);",
		"    kv.put('visits', state.visits);",
		"    kv.put('itemsLostHere', state.itemsLostHere);",
		"    kv.put('takeLockedOut', state.takeLockedOut);",
		'  }',
		'',
		'  rollD20() { return Math.floor(Math.random() * 20) + 1; }',
		'  rollDamage(checks) {',
		'    const lo = Math.max(1, Math.min(5, Number(checks.damageMin) || 1));',
		'    const hi = Math.max(lo, Math.min(5, Number(checks.damageMax) || lo));',
		'    return Math.floor(Math.random() * (hi - lo + 1)) + lo;',
		'  }',
		'',
		'  result(state, extras) {',
		'    return {',
		'      message: extras.message,',
		'      safe: extras.safe,',
		'      canTake: extras.canTake,',
		'      canDefeat: extras.canDefeat,',
		'      consumedEnter: extras.consumedEnter ?? false,',
		'      itemGained: extras.itemGained ?? null,',
		'      itemLost: extras.itemLost ?? null,',
		'      damage: extras.damage ?? 0,',
		'      roll: extras.roll ?? null,',
		'      facetState: state,',
		'      globalStateDelta: extras.globalStateDelta ?? {},',
		'    };',
		'  }',
		'',
		'  canTakeHere(input, state) {',
		'    if (state.takeLockedOut) return false;',
		'    if (!input.room.item) return false;',
		'    if (input.roomState.itemTaken) return false;',
		'    if (ROOM_TYPE === "treasure") return true;',
		'    if (ROOM_TYPE === "monster") return Boolean(input.roomState.monsterDefeated);',
		'    return false;',
		'  }',
		'',
		'  async enter(input) {',
		'    const state = this.loadState();',
		'    const next = { ...state, visited: true, visits: state.visits + 1 };',
		'',
		'    if (ROOM_TYPE === "treasure") {',
		'      this.saveState(next);',
		'      return this.result(next, {',
		'        message: input.roomState.itemTaken ? EMPTY_TAKE_TEXT : ENTER_TEXT,',
		'        safe: true,',
		'        canTake: this.canTakeHere(input, next),',
		'        canDefeat: false,',
		'      });',
		'    }',
		'',
		'    if (ROOM_TYPE === "monster") {',
		'      this.saveState(next);',
		'      if (input.roomState.monsterDefeated) {',
		'        return this.result(next, {',
		'          message: SAFE_TEXT,',
		'          safe: true,',
		'          canTake: this.canTakeHere(input, next),',
		'          canDefeat: false,',
		'        });',
		'      }',
		'      return this.result(next, {',
		'        message: ENTER_TEXT,',
		'        safe: false,',
		'        canTake: false,',
		'        canDefeat: true,',
		'        consumedEnter: !state.visited,',
		'      });',
		'    }',
		'',
		'    if (ROOM_TYPE === "trap") {',
		'      // Trap only rolls the first time ANY explorer enters (global).',
		'      // After that, the room is dormant for everyone.',
		'      if (input.roomState.trapTriggered) {',
		'        this.saveState(next);',
		'        return this.result(next, {',
		'          message: "The trap has already been sprung. The room is still now.",',
		'          safe: true,',
		'          canTake: false,',
		'          canDefeat: false,',
		'        });',
		'      }',
		'      const dc = input.room.checks.trapDC;',
		'      const roll = this.rollD20();',
		'      const success = roll >= dc;',
		'      const damage = success ? 0 : this.rollDamage(input.room.checks);',
		'      this.saveState(next);',
		'      return this.result(next, {',
		'        message: success',
		'          ? TRAP_SPARE_TEXT',
		'          : TRAP_HIT_TEXT + " You take " + damage + " damage.",',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'        consumedEnter: true,',
		'        damage,',
		'        roll: { kind: "trap", roll, dc, success },',
		'        globalStateDelta: { trapTriggered: true },',
		'      });',
		'    }',
		'',
		'    this.saveState(next);',
		'    return this.result(next, {',
		'      message: ENTER_TEXT,',
		'      safe: true,',
		'      canTake: false,',
		'      canDefeat: false,',
		'    });',
		'  }',
		'',
		'  async take(input) {',
		'    const state = this.loadState();',
		'    if (!input.room.item) {',
		'      return this.result(state, {',
		'        message: "There is nothing here to take.",',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'      });',
		'    }',
		'    if (input.roomState.itemTaken) {',
		'      return this.result(state, {',
		'        message: EMPTY_TAKE_TEXT,',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'      });',
		'    }',
		'    if (state.takeLockedOut) {',
		'      return this.result(state, {',
		'        message: "You already failed to claim this prize. It will not yield to you.",',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'      });',
		'    }',
		'    if (ROOM_TYPE === "monster" && !input.roomState.monsterDefeated) {',
		'      return this.result(state, {',
		'        message: "The creature still guards this prize. Fight it first.",',
		'        safe: false,',
		'        canTake: false,',
		'        canDefeat: true,',
		'      });',
		'    }',
		'',
		'    const dc = input.room.checks.takeDC;',
		'    const roll = this.rollD20();',
		'    const success = roll >= dc;',
		'    if (!success) {',
		'      const lockedState = { ...state, takeLockedOut: true };',
		'      this.saveState(lockedState);',
		'      return this.result(lockedState, {',
		'        message: TAKE_FAIL_TEXT + " (rolled " + roll + " vs DC " + dc + ")",',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'        roll: { kind: "take", roll, dc, success: false },',
		'      });',
		'    }',
		'',
		'    // Success: the item is ours. If cursed, roll the curse check.',
		'    if (input.room.item.cursed) {',
		'      const curseDC = input.room.checks.curseDC;',
		'      const curseRoll = this.rollD20();',
		'      const sparedCurse = curseRoll >= curseDC;',
		'      const damage = sparedCurse ? 0 : this.rollDamage(input.room.checks);',
		'      return this.result(state, {',
		'        message: sparedCurse',
		'          ? TAKE_TEXT + " " + CURSE_SPARE_TEXT',
		'          : TAKE_TEXT + " " + CURSE_HIT_TEXT + " You take " + damage + " damage.",',
		'        safe: sparedCurse,',
		'        canTake: false,',
		'        canDefeat: false,',
		'        itemGained: input.room.item,',
		'        damage,',
		'        roll: { kind: "curse", roll: curseRoll, dc: curseDC, success: sparedCurse },',
		'        globalStateDelta: { itemTaken: true },',
		'      });',
		'    }',
		'',
		'    return this.result(state, {',
		'      message: TAKE_TEXT,',
		'      safe: true,',
		'      canTake: false,',
		'      canDefeat: false,',
		'      itemGained: input.room.item,',
		'      roll: { kind: "take", roll, dc, success: true },',
		'      globalStateDelta: { itemTaken: true },',
		'    });',
		'  }',
		'',
		'  async defeat(input) {',
		'    const state = this.loadState();',
		'    if (ROOM_TYPE !== "monster") {',
		'      return this.result(state, {',
		'        message: "There is nothing here to fight.",',
		'        safe: true,',
		'        canTake: false,',
		'        canDefeat: false,',
		'      });',
		'    }',
		'    if (input.roomState.monsterDefeated) {',
		'      return this.result(state, {',
		'        message: SAFE_TEXT,',
		'        safe: true,',
		'        canTake: this.canTakeHere(input, state),',
		'        canDefeat: false,',
		'      });',
		'    }',
		'',
		'    const dc = input.room.checks.fightDC;',
		'    const roll = this.rollD20();',
		'    const success = roll >= dc;',
		'    if (!success) {',
		'      const damage = this.rollDamage(input.room.checks);',
		'      return this.result(state, {',
		'        message: FIGHT_FAIL_TEXT + " You take " + damage + " damage. (rolled " + roll + " vs DC " + dc + ")",',
		'        safe: false,',
		'        canTake: false,',
		'        canDefeat: true,',
		'        damage,',
		'        roll: { kind: "fight", roll, dc, success: false },',
		'      });',
		'    }',
		'',
		'    const looted = { ...state };',
		'    return this.result(looted, {',
		'      message: DEFEAT_TEXT,',
		'      safe: true,',
		'      canTake: Boolean(input.room.item),',
		'      canDefeat: false,',
		'      roll: { kind: "fight", roll, dc, success: true },',
		'      globalStateDelta: { monsterDefeated: true },',
		'    });',
		'  }',
		'',
		'  async flee(input) {',
		'    const state = this.loadState();',
		'    return this.result(state, {',
		'      message: FLEE_TEXT,',
		'      safe: ROOM_TYPE !== "monster" || input.roomState.monsterDefeated,',
		'      canTake: this.canTakeHere(input, state),',
		'      canDefeat: ROOM_TYPE === "monster" && !input.roomState.monsterDefeated,',
		'    });',
		'  }',
		'}',
	].join('\n');
}
