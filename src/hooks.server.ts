import { env } from "$env/dynamic/private";
import JWT from "jsonwebtoken";
import { locale, waitLocale } from "svelte-i18n";
import { error, type Handle, type RequestEvent } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale(lang);

	await auth(event);

	const start = Date.now();
	const result = await resolve(event);
	const ms = Date.now() - start;
	console.log(`${event.request.method} ${event.request.url} - (${result.status}) [${ms}ms]`);
	return result;
};

process?.on("SIGINT", () => {
	process.exit(0);
});

process?.on("SIGTERM", () => {
	process.exit(0);
});

async function auth(event: RequestEvent): Promise<void> {
	if (!env.APP_SECRET) {
		return;
	}

	const auth = event.request.headers.get("authorization");
	if (auth) {
		const [type, token] = auth.split(" ");
		if (type === "Bearer") {
			try {
				const payload = JWT.verify(token, env.APP_SECRET) as { exp: number; sub: string };
				if (payload.exp < Date.now() / 1000) {
					throw error(401, "Token expired");
				}
				event.locals.user = payload.sub;
			} catch (err) {
				console.error(err);
			}
		}
	}
}
