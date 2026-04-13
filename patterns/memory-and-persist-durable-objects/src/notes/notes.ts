import { DurableObject } from 'cloudflare:workers';

export type Note = {
	id: string;
	text: string;
	createdAt: number;
};

export class Notes extends DurableObject<Env> {
	private notes = new Map<string, Note>();

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		// Rehydrate in-memory state from durable storage before any request is handled.
		// blockConcurrencyWhile defers all incoming events until this async block resolves,
		// so reads can safely hit `this.notes` without racing the constructor.
		ctx.blockConcurrencyWhile(async () => {
			const stored = await ctx.storage.list<Note>({ prefix: 'note:' });
			for (const [, note] of stored) {
				this.notes.set(note.id, note);
			}
		});
	}

	async list(): Promise<Note[]> {
		return [...this.notes.values()].sort((a, b) => a.createdAt - b.createdAt);
	}

	async get(id: string): Promise<Note | null> {
		return this.notes.get(id) ?? null;
	}

	async add(text: string): Promise<Note> {
		const note: Note = {
			id: crypto.randomUUID(),
			text,
			createdAt: Date.now(),
		};
		this.notes.set(note.id, note);
		await this.ctx.storage.put(`note:${note.id}`, note);
		return note;
	}

	async remove(id: string): Promise<boolean> {
		if (!this.notes.delete(id)) return false;
		await this.ctx.storage.delete(`note:${id}`);
		return true;
	}

	async clear(): Promise<void> {
		this.notes.clear();
		await this.ctx.storage.deleteAll();
	}
}
