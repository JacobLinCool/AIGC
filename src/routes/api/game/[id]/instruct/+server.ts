import { games } from "$lib/server/manager";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const body = z
		.object({ command: z.string().max(8 * 1024), key: z.string().max(1024) })
		.parse(await request.json());

	if (locals.user !== body.key) {
		throw error(401, "Unauthorized");
	}

	const gm = games.get(params.id);
	if (!gm) {
		throw error(404, "Game not found");
	}

	const agent = gm.game.agents.find((x) => x.$owner === body.key);
	if (!agent) {
		throw error(404, "Agent not found");
	}

	console.log(agent);
	agent.post(body.command);

	return json({ ok: true });
};
