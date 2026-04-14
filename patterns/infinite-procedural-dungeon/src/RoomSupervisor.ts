import { DurableObject } from 'cloudflare:workers';
import {
	buildRoomGenerationPrompt,
	buildRoomGenerationSchema,
	createRoomDefinition,
	extractGeneratedRoomDraft,
} from './roomClasses';
import type {
	GeneratedRoomDraft,
	ItemDefinition,
	RoomChecks,
	RoomDefinition,
	RoomEntity,
	RoomGlobalState,
	RoomType,
} from './types';

const TREASURE_ITEMS: RoomEntity[] = [
	{ name: 'sun coin', description: 'A warm coin stamped with a forgotten king.' },
	{ name: 'amber key', description: 'A translucent key that hums when touched.' },
	{ name: 'moon shard', description: 'A pale crystal that throws silver light.' },
	{ name: 'brass compass', description: 'A compass that points deeper underground.' },
];

const MONSTERS: RoomEntity[] = [
	{ name: 'ash drake', description: 'A soot-covered drake guarding its nest.' },
	{ name: 'gloom wolf', description: 'A silent beast pacing in the dark.' },
	{ name: 'mire troll', description: 'A hulking troll dripping cave water.' },
	{ name: 'glass spider', description: 'A many-eyed spider reflecting torchlight.' },
];

const ROOM_GENERATION_MODEL = '@cf/zai-org/glm-4.7-flash';

const FLAVOUR_BY_TYPE: Record<RoomType, string[]> = {
	treasure: [
		'Coins sparkle between broken flagstones.',
		'An old pedestal holds something valuable beneath a shaft of green light.',
		'The chamber smells of cedar and dust. Someone hid treasure here deliberately.',
	],
	monster: [
		'Bones crunch underfoot as a growl rolls through the chamber.',
		'A shape stirs in the dark, guarding this room with obvious intent.',
		'The air is hot and wet. Something territorial lives here.',
	],
	trap: [
		'Fine wires glint across the doorway just a moment too late.',
		'The stones shift under your boots with a nasty mechanical click.',
		'The room looks safe until a hidden latch snaps open beneath the floor.',
	],
	empty: [
		'Only dripping water and distant echoes keep you company here.',
		'This chamber is barren, as if the dungeon is taking a breath.',
		'You find dust, silence, and the feeling that someone passed through long ago.',
	],
};

export class RoomSupervisor extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		// One shared immutable definition per room ID. This is trusted state:
		// all players see the same room metadata, but none of their per-room facet
		// progress leaks into this object.
		this.ctx.storage.sql.exec(`
			CREATE TABLE IF NOT EXISTS room_definition (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				json TEXT NOT NULL,
				created_at INTEGER NOT NULL
			)
		`);
		this.ctx.storage.sql.exec(`
			CREATE TABLE IF NOT EXISTS room_state (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				json TEXT NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);
	}

	async getOrCreateRoom(roomId: string): Promise<RoomDefinition> {
		const rows = this.ctx.storage.sql
			.exec('SELECT json FROM room_definition WHERE id = 1')
			.toArray() as Array<{ json: string }>;
		if (rows.length > 0) {
			return JSON.parse(rows[0].json) as RoomDefinition;
		}

		const definition = await this.#generateRoomDefinition(roomId);
		this.ctx.storage.sql.exec(
			'INSERT INTO room_definition (id, json, created_at) VALUES (1, ?, ?)',
			JSON.stringify(definition),
			Date.now(),
		);

		return definition;
	}

	async getRoomSnapshot(roomId: string): Promise<{ room: RoomDefinition; state: RoomGlobalState }> {
		const room = await this.getOrCreateRoom(roomId);
		const stateRows = this.ctx.storage.sql
			.exec('SELECT json FROM room_state WHERE id = 1')
			.toArray() as Array<{ json: string }>;
		if (stateRows.length > 0) {
			return {
				room,
				state: JSON.parse(stateRows[0].json) as RoomGlobalState,
			};
		}

		const state = createInitialRoomState();
		this.ctx.storage.sql.exec(
			'INSERT INTO room_state (id, json, updated_at) VALUES (1, ?, ?)',
			JSON.stringify(state),
			Date.now(),
		);
		return { room, state };
	}

	async applyGlobalStateDelta(
		roomId: string,
		delta: Partial<RoomGlobalState>,
	): Promise<{ room: RoomDefinition; state: RoomGlobalState }> {
		const snapshot = await this.getRoomSnapshot(roomId);
		const nextState: RoomGlobalState = {
			...snapshot.state,
			...delta,
		};

		this.ctx.storage.sql.exec(
			'INSERT OR REPLACE INTO room_state (id, json, updated_at) VALUES (1, ?, ?)',
			JSON.stringify(nextState),
			Date.now(),
		);

		return {
			room: snapshot.room,
			state: nextState,
		};
	}

	async #generateRoomDefinition(roomId: string): Promise<RoomDefinition> {
		const doorCount = randomInt(2, 4);
		const doors = createDoors(roomId, doorCount);
		const draft = (await this.#generateRoomDraftWithSchema(roomId, doors))
			?? (await this.#generateRoomDraftWithJsonFallback(roomId, doors))
			?? buildFallbackDraft(roomId);
		return createRoomDefinition({
			roomId,
			draft,
			doors,
		});
	}

	async #generateRoomDraftWithSchema(roomId: string, doors: string[]) {
		try {
			const result = (await (this.env as Env).AI.run(ROOM_GENERATION_MODEL, {
				messages: buildRoomGenerationPrompt({ roomId, doors }) as any,
				max_tokens: 1200,
				temperature: 0.9,
				response_format: {
					type: 'json_schema',
					json_schema: buildRoomGenerationSchema(),
				},
			} as any)) as AiGenerationResult;

			if (result.response && typeof result.response === 'object') {
				return extractGeneratedRoomDraft(JSON.stringify(result.response));
			}

			return extractGeneratedRoomDraft(readAiText(result));
		} catch (error) {
			console.warn('schema-based room generation failed, falling back to prompt-only JSON mode', error);
			return null;
		}
	}

	async #generateRoomDraftWithJsonFallback(roomId: string, doors: string[]) {
		try {
			const result = (await (this.env as Env).AI.run(ROOM_GENERATION_MODEL, {
				messages: buildRoomGenerationPrompt({ roomId, doors }) as any,
				max_tokens: 1200,
				temperature: 0.9,
			})) as AiGenerationResult;

			return extractGeneratedRoomDraft(readAiText(result));
		} catch (error) {
			console.warn('prompt-only room generation failed, using local fallback room draft', error);
			return null;
		}
	}
}

function createInitialRoomState(): RoomGlobalState {
	return {
		itemTaken: false,
		monsterDefeated: false,
		trapTriggered: false,
	};
}

function buildFallbackDraft(roomId: string): GeneratedRoomDraft {
	const type = pickRoomType();
	const cursed = type === 'treasure' && Math.random() < 0.25;
	const item: ItemDefinition | null =
		type === 'treasure'
			? { ...pickRandom(TREASURE_ITEMS), value: randomInt(8, 28), cursed }
			: type === 'monster'
				? { name: 'hoarded coin', description: 'A coin the beast kept close.', value: randomInt(10, 22), cursed: false }
				: null;
	const monster = type === 'monster' ? pickRandom(MONSTERS) : null;

	const checks: RoomChecks = {
		takeDC: type === 'treasure' ? randomInt(8, 13) : 8,
		fightDC: randomInt(10, 14),
		curseDC: randomInt(9, 13),
		trapDC: randomInt(9, 13),
		damageMin: 2,
		damageMax: 4,
	};

	return {
		title: `Room ${roomId.toUpperCase()}`,
		type,
		flavourText: pickRandom(FLAVOUR_BY_TYPE[type]),
		item,
		monster,
		checks,
		enterText:
			type === 'treasure'
				? 'A carefully hidden prize waits in the dark.'
				: type === 'monster'
					? `A ${monster?.name ?? 'monster'} lunges from the shadows.`
					: type === 'trap'
						? 'You hear a mechanism snap beneath your boots.'
						: 'The chamber is still, silent, and empty.',
		takeText: item ? `You take the ${item.name}.` : null,
		takeFailText: item ? `The ${item.name} slips your grasp.` : null,
		emptyTakeText: item ? `The ${item.name} is already gone.` : null,
		curseHitText: cursed ? `The ${item!.name} burns cold against your skin.` : null,
		curseSpareText: cursed ? `The ${item!.name} lies still, its malice unfocused.` : null,
		defeatText: monster ? `You defeat the ${monster.name}.` : null,
		fightFailText: monster ? `The ${monster.name} catches you a blow.` : null,
		safeText: monster ? `The ${monster.name} is gone. The room is safe now.` : null,
		trapHitText: type === 'trap' ? 'The trap springs and catches you hard.' : null,
		trapSpareText: type === 'trap' ? 'You dive aside as the trap snaps.' : null,
		fleeText: 'You retreat toward the next doorway.',
	};
}

function createDoors(roomId: string, count: number): string[] {
	const doors = new Set<string>();
	while (doors.size < count) {
		const next = randomHex(6);
		if (next !== roomId) {
			doors.add(next);
		}
	}
	return [...doors];
}

function pickRoomType(): RoomType {
	const roll = Math.random();
	if (roll < 0.28) return 'treasure';
	if (roll < 0.56) return 'monster';
	if (roll < 0.78) return 'trap';
	return 'empty';
}

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

type AiGenerationResult = {
	response?: unknown;
	choices?: Array<{
		message?: {
			content?: string | Array<{ type?: string; text?: string }>;
		};
	}>;
};

function readAiText(result: AiGenerationResult): string {
	if (typeof result.response === 'string') {
		return result.response;
	}
	const content = result.choices?.[0]?.message?.content;
	if (typeof content === 'string') return content;
	if (Array.isArray(content)) {
		return content
			.filter((part) => part?.type === 'text' && typeof part.text === 'string')
			.map((part) => part.text)
			.join('\n');
	}
	return '';
}

function randomHex(length: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
