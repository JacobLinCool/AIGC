import type { GameModule } from "$lib/server/game";
import { init } from "./init";
import { assign, serialize, update } from "./playing";
import type { CrossKillState } from "./types";
import { join, start } from "./waiting";

const module: GameModule<CrossKillState> = {
	init,
	join,
	start,
	assign,
	serialize,
	update,
};

export default module;
export * from "./types";
