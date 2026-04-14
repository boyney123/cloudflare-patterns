export type RoomType = 'treasure' | 'monster' | 'trap' | 'empty';

export const MAX_HP = 50;
export const MAX_DAMAGE_PER_HIT = 5;
export const MIN_DC = 5;
export const MAX_DC = 18;

export interface RoomEntity {
	name: string;
	description: string;
}

export interface ItemDefinition extends RoomEntity {
	value: number;
	cursed?: boolean;
}

export interface RoomChecks {
	takeDC: number;
	fightDC: number;
	curseDC: number;
	trapDC: number;
	damageMin: number;
	damageMax: number;
}

export interface RoomDefinition {
	roomId: string;
	title: string;
	type: RoomType;
	item: ItemDefinition | null;
	monster: RoomEntity | null;
	doors: string[];
	flavourText: string;
	checks: RoomChecks;
	codeId: string;
	moduleSource: string;
}

export interface RoomFacetState {
	visited: boolean;
	visits: number;
	itemsLostHere: string[];
	takeLockedOut: boolean;
}

export interface RoomGlobalState {
	itemTaken: boolean;
	monsterDefeated: boolean;
	trapTriggered: boolean;
}

export interface RoomActionInput {
	room: RoomDefinition;
	roomState: RoomGlobalState;
	inventory: ItemDefinition[];
	hp: number;
}

export type RollKind = 'take' | 'fight' | 'curse' | 'trap';

export interface RollDetails {
	kind: RollKind;
	roll: number;
	dc: number;
	success: boolean;
}

export interface RoomActionResult {
	message: string;
	safe: boolean;
	canTake: boolean;
	canDefeat: boolean;
	consumedEnter: boolean;
	itemGained: ItemDefinition | null;
	itemLost: ItemDefinition | null;
	damage: number;
	roll: RollDetails | null;
	facetState: RoomFacetState;
	globalStateDelta: Partial<RoomGlobalState>;
}

export interface PlayerState {
	userId: string;
	inventory: ItemDefinition[];
	roomsVisited: string[];
	totalRoomsExplored: number;
	hp: number;
	maxHp: number;
	dead: boolean;
}

export interface RoomPageData {
	userId: string;
	room: RoomDefinition;
	roomState: RoomGlobalState;
	player: PlayerState;
	interaction: RoomActionResult;
	behaviorClass: string;
	loaderCodeId: string;
}

export interface ActionResponse {
	ok: boolean;
	message: string;
	redirectTo: string;
	userId: string;
	roll?: RollDetails | null;
	damage?: number;
}

export interface GeneratedRoomDraft {
	title: string;
	type: RoomType;
	flavourText: string;
	item: ItemDefinition | null;
	monster: RoomEntity | null;
	checks: RoomChecks;
	enterText: string;
	takeText: string | null;
	takeFailText: string | null;
	emptyTakeText: string | null;
	curseHitText: string | null;
	curseSpareText: string | null;
	defeatText: string | null;
	fightFailText: string | null;
	safeText: string | null;
	trapHitText: string | null;
	trapSpareText: string | null;
	fleeText: string;
}
