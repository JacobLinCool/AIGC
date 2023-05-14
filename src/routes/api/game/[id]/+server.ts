import { games } from "$lib/server/manager";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url }) => {
	const key = url.searchParams.get("key");
	return games.stream(params.id, key || undefined);
};
