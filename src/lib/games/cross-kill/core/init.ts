import type { GameInstance } from "$lib/types";
import type { CrossKillState } from "./types";

export function init(init: unknown): {
	state: CrossKillState;
	config: GameInstance["config"];
} {
	if (typeof init !== "object" || init === null) {
		throw new Error("Invalid initial state");
	}

	if (!("board" in init) || !Array.isArray(init.board)) {
		throw new Error("Invalid initial state");
	}

	const size = init.board[0].length;
	if (init.board.some((row) => row.length !== size)) {
		throw new Error("Invalid initial state");
	}

	if (init.board.flat(2).some((x) => typeof x !== "boolean")) {
		throw new Error("Invalid initial state");
	}

	return {
		state: {
			board: init.board,
			scores: [0, 0],
		},
		config: {
			time: {
				turn: 60_000,
				game: 600_000,
			},
		},
	};
}
