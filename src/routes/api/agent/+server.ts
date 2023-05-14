import { agents } from "$lib/server/agent";
import { sha256 } from "$lib/server/utils";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, "Unauthorized");
	}

	const body = z
		.object({
			lang: z.string().max(64),
			source: z
				.string()
				.trim()
				.max(128 * 1024),
		})
		.parse(await request.json());

	if (body.lang === "human") {
		return json({ hash: `human-${Math.random().toString(36).substring(2, 8)}` });
	}

	const hash = sha256(body.source);

	await agents.add(body.lang, body.source);

	return json({ hash });
};
