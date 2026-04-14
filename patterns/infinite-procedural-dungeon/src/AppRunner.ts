import { DurableObject } from 'cloudflare:workers';
import type { ItemDefinition, RoomActionInput, RoomActionResult, RoomDefinition, RoomGlobalState } from './types';

interface RoomFacetRpc {
	enter(input: RoomActionInput): Promise<RoomActionResult>;
	take(input: RoomActionInput): Promise<RoomActionResult>;
	flee(input: RoomActionInput): Promise<RoomActionResult>;
	defeat(input: RoomActionInput): Promise<RoomActionResult>;
}

export class AppRunner extends DurableObject<Env> {
	async enterForUser(input: {
		userId: string;
		room: RoomDefinition;
		roomState: RoomGlobalState;
		inventory: ItemDefinition[];
		hp: number;
	}): Promise<RoomActionResult> {
		return this.#getFacet(input.userId, input.room).enter({
			room: input.room,
			roomState: input.roomState,
			inventory: input.inventory,
			hp: input.hp,
		});
	}

	async takeForUser(input: {
		userId: string;
		room: RoomDefinition;
		roomState: RoomGlobalState;
		inventory: ItemDefinition[];
		hp: number;
	}): Promise<RoomActionResult> {
		return this.#getFacet(input.userId, input.room).take({
			room: input.room,
			roomState: input.roomState,
			inventory: input.inventory,
			hp: input.hp,
		});
	}

	async fleeForUser(input: {
		userId: string;
		room: RoomDefinition;
		roomState: RoomGlobalState;
		inventory: ItemDefinition[];
		hp: number;
	}): Promise<RoomActionResult> {
		return this.#getFacet(input.userId, input.room).flee({
			room: input.room,
			roomState: input.roomState,
			inventory: input.inventory,
			hp: input.hp,
		});
	}

	async defeatForUser(input: {
		userId: string;
		room: RoomDefinition;
		roomState: RoomGlobalState;
		inventory: ItemDefinition[];
		hp: number;
	}): Promise<RoomActionResult> {
		return this.#getFacet(input.userId, input.room).defeat({
			room: input.room,
			roomState: input.roomState,
			inventory: input.inventory,
			hp: input.hp,
		});
	}

	async getBehaviorMetadata(room: RoomDefinition): Promise<{ className: string; codeId: string }> {
		return {
			className: 'Room',
			codeId: room.codeId,
		};
	}

	#getFacet(userId: string, room: RoomDefinition): RoomFacetRpc {
		const worker = this.env.LOADER.get(room.codeId, () => ({
			compatibilityDate: '2026-04-13',
			mainModule: 'room.js',
			modules: {
				'room.js': room.moduleSource,
			},
			// The behaviour sandbox should never call the network. The entire point
			// of the demo is that room logic can mutate only its own facet state and
			// emit deltas back to trusted supervisors.
			globalOutbound: null,
		}));

		return this.ctx.facets.get(`room-${room.roomId}-user-${userId}`, () => ({
			class: worker.getDurableObjectClass('Room'),
		})) as unknown as RoomFacetRpc;
	}
}
