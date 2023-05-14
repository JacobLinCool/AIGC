import { games } from "$lib/server/manager";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const body = z.object({ key: z.string().max(1024) }).parse(await request.json());

	if (locals.user !== body.key) {
		throw error(401, "Unauthorized");
	}

	const gm = games.get(params.id);
	if (!gm) {
		throw error(404, "Game not found");
	}

	if (gm.game.$owner !== body.key) {
		throw error(400, "Only the owner can start the game");
	}

	await import(`$lib/server/game`).then((m) => m.default.start(gm));

	return json({ ok: true });
};
