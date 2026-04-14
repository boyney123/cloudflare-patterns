import { DurableObject } from 'cloudflare:workers';
import { MAX_DAMAGE_PER_HIT, MAX_HP, type ItemDefinition, type PlayerState } from './types';

export class PlayerSupervisor extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		// The trusted player database is intentionally separate from room facets.
		// Dynamic code can suggest deltas, but it never touches this schema.
		this.ctx.storage.sql.exec(`
			CREATE TABLE IF NOT EXISTS inventory_entries (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				item_json TEXT NOT NULL
			)
		`);
			this.ctx.storage.sql.exec(`
				CREATE TABLE IF NOT EXISTS visited_rooms (
					room_id TEXT PRIMARY KEY,
					visited_at INTEGER NOT NULL
				)
			`);
			this.ctx.storage.sql.exec(`
				CREATE TABLE IF NOT EXISTS vitals (
					id INTEGER PRIMARY KEY CHECK (id = 1),
					hp INTEGER NOT NULL
				)
			`);

		this.#migrateInventorySchema();
		this.#ensureVitals();
	}

		async getState(userId: string): Promise<PlayerState> {
		const inventoryRows = this.ctx.storage.sql
			.exec('SELECT item_json FROM inventory_entries ORDER BY id ASC')
			.toArray() as Array<{ item_json: string }>;
		const visitedRows = this.ctx.storage.sql
			.exec('SELECT room_id FROM visited_rooms ORDER BY visited_at DESC')
			.toArray() as Array<{ room_id: string }>;
		const totalRows = this.ctx.storage.sql
			.exec('SELECT COUNT(*) AS total FROM visited_rooms')
			.toArray() as Array<{ total: number }>;
		const hp = this.#readHp();

		return {
			userId,
			inventory: inventoryRows.map((row) => JSON.parse(row.item_json) as ItemDefinition),
			roomsVisited: visitedRows.map((row) => row.room_id),
			totalRoomsExplored: Number(totalRows[0]?.total ?? 0),
			hp,
			maxHp: MAX_HP,
			dead: hp <= 0,
		};
	}

	async applyRoomOutcome(input: {
		userId: string;
		roomId: string;
		itemLost?: ItemDefinition | null;
		itemGained?: ItemDefinition | null;
		damage?: number;
	}): Promise<PlayerState> {
		this.#recordVisit(input.roomId);

		if (input.itemLost) {
			this.#removeOneInventoryItem(input.itemLost);
		}
		if (input.itemGained) {
			const itemJson = JSON.stringify(input.itemGained);
			const columns = this.#getInventoryColumnNames();
			if (columns.has('item_name')) {
				this.ctx.storage.sql.exec(
					'INSERT INTO inventory_entries (item_json, item_name) VALUES (?, ?)',
					itemJson,
					input.itemGained.name,
				);
			} else {
				this.ctx.storage.sql.exec('INSERT INTO inventory_entries (item_json) VALUES (?)', itemJson);
			}
		}

		if (input.damage && input.damage > 0) {
			const clampedHit = Math.min(MAX_DAMAGE_PER_HIT, Math.max(0, Math.floor(input.damage)));
			const nextHp = Math.max(0, this.#readHp() - clampedHit);
			this.#writeHp(nextHp);
		}

		return this.getState(input.userId);
	}

	async revive(userId: string): Promise<PlayerState> {
		this.ctx.storage.sql.exec('DELETE FROM inventory_entries');
		this.#writeHp(MAX_HP);
		return this.getState(userId);
	}

	#ensureVitals(): void {
		const rows = this.ctx.storage.sql
			.exec('SELECT hp FROM vitals WHERE id = 1')
			.toArray() as Array<{ hp: number }>;
		if (rows.length === 0) {
			this.ctx.storage.sql.exec('INSERT INTO vitals (id, hp) VALUES (1, ?)', MAX_HP);
		}
	}

	#readHp(): number {
		const rows = this.ctx.storage.sql
			.exec('SELECT hp FROM vitals WHERE id = 1')
			.toArray() as Array<{ hp: number }>;
		if (rows.length === 0) return MAX_HP;
		return Math.max(0, Math.min(MAX_HP, Number(rows[0].hp) || 0));
	}

	#writeHp(value: number): void {
		const clamped = Math.max(0, Math.min(MAX_HP, Math.floor(value)));
		this.ctx.storage.sql.exec(
			'INSERT OR REPLACE INTO vitals (id, hp) VALUES (1, ?)',
			clamped,
		);
	}

	#recordVisit(roomId: string): void {
		const existing = this.ctx.storage.sql
			.exec('SELECT room_id FROM visited_rooms WHERE room_id = ?', roomId)
			.toArray() as Array<{ room_id: string }>;
		if (existing.length === 0) {
			this.ctx.storage.sql.exec(
				'INSERT INTO visited_rooms (room_id, visited_at) VALUES (?, ?)',
				roomId,
				Date.now(),
			);
		}
	}

	#removeOneInventoryItem(item: ItemDefinition): void {
		const rows = this.ctx.storage.sql
			.exec('SELECT id, item_json FROM inventory_entries ORDER BY id ASC')
			.toArray() as Array<{ id: number; item_json: string }>;
		const match = rows.find((row) => {
			const candidate = JSON.parse(row.item_json) as ItemDefinition;
			return candidate.name === item.name && candidate.value === item.value;
		});
		if (match) {
			this.ctx.storage.sql.exec('DELETE FROM inventory_entries WHERE id = ?', match.id);
		}
	}

	#migrateInventorySchema(): void {
		const columnNames = this.#getInventoryColumnNames();

		if (!columnNames.has('item_json')) {
			this.ctx.storage.sql.exec('ALTER TABLE inventory_entries ADD COLUMN item_json TEXT');
		}

		if (columnNames.has('item_name')) {
			const legacyRows = this.ctx.storage.sql
				.exec('SELECT id, item_name, item_json FROM inventory_entries ORDER BY id ASC')
				.toArray() as Array<{ id: number; item_name: string | null; item_json: string | null }>;

			for (const row of legacyRows) {
				if (row.item_json || !row.item_name) continue;
				this.ctx.storage.sql.exec(
					'UPDATE inventory_entries SET item_json = ? WHERE id = ?',
					JSON.stringify({
						name: row.item_name,
						description: `A legacy item recovered from an older demo schema.`,
						value: 10,
					} satisfies ItemDefinition),
					row.id,
				);
			}
		}
	}

	#getInventoryColumnNames(): Set<string> {
		const columns = this.ctx.storage.sql
			.exec('PRAGMA table_info(inventory_entries)')
			.toArray() as Array<{ name: string }>;
		return new Set(columns.map((column) => column.name));
	}
}
