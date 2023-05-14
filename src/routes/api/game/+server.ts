import { games } from "$lib/server/manager";
import type { GameInstance } from "$lib/types";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = z
		.object({
			type: z.string().max(64),
			init: z.any(),
			key: z.string().max(1024),
		})
		.parse(await request.json());

	if (locals.user !== body.key) {
		throw error(401, "Unauthorized");
	}

	const { state, config } = await import(`$lib/server/game`).then((m) =>
		m.default.init(body.init),
	);

	const game: GameInstance = {
		type: body.type,
		status: "waiting",
		initial: state,
		state,
		agents: [],
		moves: [],
		timestamp: Date.now(),
		$owner: body.key,
		config,
	};

	let id = Math.random().toString(36).substring(2, 6);
	while (games.has(id)) {
		id = Math.random().toString(36).substring(2, 6);
	}

	games.set(id, game);

	return json({ id });
};
