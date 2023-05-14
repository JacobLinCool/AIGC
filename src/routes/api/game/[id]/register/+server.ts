import { agents } from "$lib/server/agent";
import { games } from "$lib/server/manager";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const body = z
		.object({ id: z.string().max(64), key: z.string().max(1024) })
		.parse(await request.json());

	if (locals.user !== body.key) {
		throw error(401, "Unauthorized");
	}

	const gm = games.get(params.id);
	if (!gm) {
		throw error(404, "Game not found");
	}

	const agent = agents.get(body.id);
	if (!agent) {
		throw error(400, "Agent not found");
	}

	await import(`$lib/server/game`).then((m) => m.default.join(gm, agent, body.key));

	return json({ ok: true });
};
