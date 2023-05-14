import cgm from "$lib/server/game";
import type { GameInstance, GameManager, ServerAgent } from "$lib/types";
import { error } from "@sveltejs/kit";

export class Games extends Map {
	public controllers = new Map<
		string,
		{
			c: ReadableStreamDefaultController<string>;
			k: string;
		}[]
	>();

	/**
	 * Create a new Server-Sent Events stream for the given game id.
	 * @param id The game id.
	 */
	public stream(id: string, key = Math.random().toString(36).substring(2)): Response {
		if (!this.has(id)) {
			throw error(404, "Game not found");
		}

		let self: ReadableStreamDefaultController<string>;
		const stream = new ReadableStream<string>({
			start: (c) => {
				const list = this.controllers.get(id);
				if (list) {
					list.push({ c, k: key });
				} else {
					this.controllers.set(id, [{ c, k: key }]);
				}
				self = c;

				const gm = this.get(id);
				if (gm) {
					c.enqueue(`event: reset\ndata: ${stringify(gm.game, key)}\n\n`);
				}
				console.log("new stream", id, this.controllers.get(id)?.length);
			},
			cancel: () => {
				if (!self) {
					return;
				}

				const list = this.controllers.get(id);
				if (!list) {
					return;
				}

				const index = list.findIndex((x) => x.c === self);
				if (index === -1) {
					return;
				}

				list.splice(index, 1);

				if (list.length === 0) {
					this.controllers.delete(id);
				}

				console.log("stream closed", id, this.controllers.get(id)?.length);
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	}

	/**
	 * Send a message to all clients subscribed to the given game id.
	 * @param id The game id.
	 * @param message The message to send.
	 */
	public send(id: string, event: string, data: unknown, to?: string): void {
		if (!this.has(id)) {
			return;
		}

		const list = this.controllers.get(id);
		if (!list) {
			return;
		}

		if (!to) {
			for (const controller of list) {
				controller.c.enqueue(`event: ${event}\ndata: ${stringify(data, controller.k)}\n\n`);
			}
		} else {
			const controller = list.find((x) => x.k === to);
			if (controller) {
				controller.c.enqueue(`event: ${event}\ndata: ${stringify(data, controller.k)}\n\n`);
			}
		}
	}

	set(key: string, value: GameInstance): this {
		if (this.has(key)) {
			throw new Error("Game already exists");
		}

		return super.set(key, value);
	}

	get(key: string): GameManager | undefined {
		const game = super.get(key) as GameInstance<unknown, true> | undefined;

		if (!game) {
			return undefined;
		}

		const broadcast = (event: string, json: unknown) => {
			console.log("broadcast", key, json);
			this.send(key, event, json);
		};

		const notice = (to: string, json: unknown) => {
			console.log("notice", key, to, json);
			this.send(key, "notice", json, to);
		};

		const gm: GameManager = {
			game,
			join: (agent, $owner) => {
				console.log("join", key, agent.id);
				game.agents.push({ ...agent, $owner });
				broadcast("reset", game);
			},
			start: () => {
				if (game.status !== "waiting") {
					throw new Error("Game has already started");
				}
				game.status = "playing";
				broadcast("reset", game);
				game_loop(gm);
			},
			end: () => {
				if (game.status !== "playing") {
					throw new Error("Game has already ended");
				}
				game.status = "done";
				broadcast("reset", game);
			},
			update: (move, state) => {
				if (game.state !== "playing") {
					throw new Error("Cannot update game state");
				}
				game.moves.push(move);
				game.state = state;
				broadcast("update", JSON.stringify({ move, state }));
			},
			broadcast,
			notice,
		};

		return gm;
	}
}

export const games = new Games();

async function game_loop(gm: GameManager): Promise<void> {
	try {
		while (gm.game.status === "playing") {
			const agent = await cgm.assign(gm);
			const exec = agent.lang === "human" ? () => human(gm, agent) : agent.exec;
			const state = await cgm.serialize(gm.game.state);
			const action = await exec(state);
			try {
				await cgm.update(gm, agent, action);
				const move = {
					agent: agent.id,
					action,
					time: 0,
				};
				gm.game.moves.push(move);
				gm.broadcast("update", { move, state: gm.game.state });
			} catch (err) {
				console.error("update failed", err);
				gm.end();
			}
		}
	} catch (err) {
		console.error("Game loop error", err);
	}
}

function stringify(data: unknown, receiver: string): string {
	if (typeof data === "string") {
		return data;
	}

	return JSON.stringify(data, (key, value) => {
		if (key.startsWith("#")) {
			return undefined;
		}
		if (key.startsWith("$") && value !== receiver) {
			return undefined;
		}

		return value;
	});
}

async function human(gm: GameManager, agent: ServerAgent): Promise<string> {
	gm.notice(agent.$owner, { waiting: true, time: 0 });
	console.log("waiting for human interaction", agent.$owner);
	const command = await agent.wait();
	console.log("received human interaction", agent.$owner, command);
	gm.notice(agent.$owner, { waiting: false, time: 0 });
	return command;
}
