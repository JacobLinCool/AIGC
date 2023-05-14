import type { GameManager, ServerAgent } from "$lib/types";
import type { CrossKillState } from "./types";

export async function join(
	gm: GameManager<CrossKillState>,
	agent: Omit<ServerAgent, "$owner">,
	owner: string,
): Promise<void> {
	if (gm.game.agents.length >= 2) {
		throw new Error("Only 2 agents can join");
	}

	const exists = gm.game.agents.find((x) => x.$owner === owner);
	if (exists) {
		throw new Error(`${owner} has already joined`);
	}

	gm.join(agent, owner);
}

export async function start(gm: GameManager<CrossKillState>): Promise<void> {
	if (gm.game.agents.length !== 2) {
		throw new Error(
			`Only ${gm.game.agents.length} agents have joined, but 2 are required to start`,
		);
	}

	gm.start();
}
