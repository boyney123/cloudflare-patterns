import { INDEX_HTML } from './ui';
import { PlayerSupervisor } from './PlayerSupervisor';
import { RoomSupervisor } from './RoomSupervisor';
import { AppRunner } from './AppRunner';
import type { ActionResponse, RoomPageData } from './types';

export { PlayerSupervisor, RoomSupervisor, AppRunner };

const USER_COOKIE = 'dungeon_user';

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const user = resolveUser(request, url);

		if (request.method === 'GET' && isShellRoute(url.pathname)) {
			return htmlResponse(INDEX_HTML, user.setCookie);
		}

		if (request.method === 'GET' && url.pathname === '/api/start') {
			const player = await getPlayerStub(env, user.userId).getState(user.userId);
			return jsonResponse(
				{
					userId: user.userId,
					firstRoomId: randomHex(6),
					player,
				},
				undefined,
				user.setCookie,
			);
		}

		if (request.method === 'GET' && url.pathname === '/api/player') {
			const player = await getPlayerStub(env, user.userId).getState(user.userId);
			return jsonResponse({ userId: user.userId, player }, undefined, user.setCookie);
		}

		const roomGetMatch = url.pathname.match(/^\/api\/room\/([a-f0-9]{6})$/);
		if (request.method === 'GET' && roomGetMatch) {
			const roomPage = await buildRoomPageData(env, user.userId, roomGetMatch[1]);
			return jsonResponse(roomPage, undefined, user.setCookie);
		}

		const roomActionMatch = url.pathname.match(/^\/api\/room\/([a-f0-9]{6})\/(take|flee|defeat)$/);
		if (request.method === 'POST' && roomActionMatch) {
			const [, roomId, actionName] = roomActionMatch;
			const response = await handleRoomAction(
				env,
				user.userId,
				roomId,
				actionName as 'take' | 'flee' | 'defeat',
			);
			return jsonResponse(response, undefined, user.setCookie);
		}

		if (request.method === 'POST' && url.pathname === '/api/revive') {
			const player = await getPlayerStub(env, user.userId).revive(user.userId);
			return jsonResponse({ ok: true, userId: user.userId, player }, undefined, user.setCookie);
		}

		return jsonResponse({ error: 'Not found' }, { status: 404 }, user.setCookie);
	},
} satisfies ExportedHandler<Env>;

async function buildRoomPageData(env: Env, userId: string, roomId: string): Promise<RoomPageData> {
	const roomStub = getRoomStub(env, roomId);
	const snapshot = await roomStub.getRoomSnapshot(roomId);
	const playerStub = getPlayerStub(env, userId);
	const currentPlayer = await playerStub.getState(userId);
	const appRunnerStub = getAppRunnerStub(env, roomId);

	const interaction = await appRunnerStub.enterForUser({
		userId,
		room: snapshot.room,
		roomState: snapshot.state,
		inventory: currentPlayer.inventory,
		hp: currentPlayer.hp,
	});
	const roomAfterInteraction = await roomStub.applyGlobalStateDelta(roomId, interaction.globalStateDelta);
	const player = await playerStub.applyRoomOutcome({
		userId,
		roomId,
		itemLost: interaction.itemLost,
		itemGained: interaction.itemGained,
		damage: interaction.damage,
	});
	const behavior = await appRunnerStub.getBehaviorMetadata(roomAfterInteraction.room);

	return {
		userId,
		room: roomAfterInteraction.room,
		roomState: roomAfterInteraction.state,
		player,
		interaction,
		behaviorClass: behavior.className,
		loaderCodeId: behavior.codeId,
	};
}

async function handleRoomAction(
	env: Env,
	userId: string,
	roomId: string,
	actionName: 'take' | 'flee' | 'defeat',
): Promise<ActionResponse> {
	const roomStub = getRoomStub(env, roomId);
	const snapshot = await roomStub.getRoomSnapshot(roomId);
	const playerStub = getPlayerStub(env, userId);
	const player = await playerStub.getState(userId);
	const appRunnerStub = getAppRunnerStub(env, roomId);

	if (player.dead) {
		return {
			ok: false,
			message: 'Your corpse cannot act. Rest and begin again.',
			redirectTo: `/room/${roomId}`,
			userId,
		};
	}

	let interaction;
	switch (actionName) {
		case 'take':
			interaction = await appRunnerStub.takeForUser({
				userId,
				room: snapshot.room,
				roomState: snapshot.state,
				inventory: player.inventory,
				hp: player.hp,
			});
			break;
		case 'flee':
			interaction = await appRunnerStub.fleeForUser({
				userId,
				room: snapshot.room,
				roomState: snapshot.state,
				inventory: player.inventory,
				hp: player.hp,
			});
			break;
		case 'defeat':
			interaction = await appRunnerStub.defeatForUser({
				userId,
				room: snapshot.room,
				roomState: snapshot.state,
				inventory: player.inventory,
				hp: player.hp,
			});
			break;
	}

	await roomStub.applyGlobalStateDelta(roomId, interaction.globalStateDelta);
	await playerStub.applyRoomOutcome({
		userId,
		roomId,
		itemLost: interaction.itemLost,
		itemGained: interaction.itemGained,
		damage: interaction.damage,
	});

	if (actionName === 'flee') {
		const nextRoomId = pickRandom(snapshot.room.doors);
		return {
			ok: true,
			message: interaction.message + ' You tumble into room ' + nextRoomId + '.',
			redirectTo: `/room/${nextRoomId}`,
			userId,
			roll: interaction.roll,
			damage: interaction.damage,
		};
	}

	return {
		ok: true,
		message: interaction.message,
		redirectTo: `/room/${roomId}`,
		userId,
		roll: interaction.roll,
		damage: interaction.damage,
	};
}

function getPlayerStub(env: Env, userId: string): DurableObjectStub<PlayerSupervisor> {
	return env.PLAYER_SUPERVISOR.get(env.PLAYER_SUPERVISOR.idFromName(userId));
}

function getRoomStub(env: Env, roomId: string): DurableObjectStub<RoomSupervisor> {
	return env.ROOM_SUPERVISOR.get(env.ROOM_SUPERVISOR.idFromName(roomId));
}

function getAppRunnerStub(env: Env, roomId: string): DurableObjectStub<AppRunner> {
	return env.APP_RUNNER.get(env.APP_RUNNER.idFromName(roomId));
}

function isShellRoute(pathname: string): boolean {
	return pathname === '/' || pathname === '/player' || /^\/room\/[a-f0-9]{6}$/.test(pathname);
}

function resolveUser(request: Request, url: URL): { userId: string; setCookie?: string } {
	const headerId = sanitizeUserId(request.headers.get('x-demo-user'));
	if (headerId) {
		return { userId: headerId };
	}

	const queryId = sanitizeUserId(url.searchParams.get('user'));
	if (queryId) {
		return {
			userId: queryId,
			setCookie: createUserCookie(queryId),
		};
	}

	const cookieId = sanitizeUserId(parseCookies(request.headers.get('cookie')).get(USER_COOKIE) ?? null);
	if (cookieId) {
		return { userId: cookieId };
	}

	const generated = randomHex(8);
	return {
		userId: generated,
		setCookie: createUserCookie(generated),
	};
}

function sanitizeUserId(value: string | null): string | null {
	if (!value) return null;
	const normalized = value.toLowerCase();
	return /^[a-f0-9]{6,24}$/.test(normalized) ? normalized : null;
}

function parseCookies(header: string | null): Map<string, string> {
	const cookies = new Map<string, string>();
	if (!header) return cookies;

	for (const segment of header.split(';')) {
		const [name, ...rest] = segment.trim().split('=');
		if (!name) continue;
		cookies.set(name, decodeURIComponent(rest.join('=')));
	}

	return cookies;
}

function createUserCookie(userId: string): string {
	return `${USER_COOKIE}=${encodeURIComponent(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}

function jsonResponse(body: unknown, init?: ResponseInit, setCookie?: string): Response {
	const headers = new Headers(init?.headers);
	headers.set('content-type', 'application/json; charset=utf-8');
	if (setCookie) headers.append('set-cookie', setCookie);
	return new Response(JSON.stringify(body), {
		...init,
		headers,
	});
}

function htmlResponse(html: string, setCookie?: string): Response {
	const headers = new Headers({ 'content-type': 'text/html; charset=utf-8' });
	if (setCookie) headers.append('set-cookie', setCookie);
	return new Response(html, { headers });
}

function randomHex(length: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2)));
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}
