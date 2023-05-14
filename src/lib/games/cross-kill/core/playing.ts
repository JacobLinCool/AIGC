import type { GameManager, ServerAgent } from "$lib/types";
import type { CrossKillState } from "./types";

export async function assign(gm: GameManager<CrossKillState>): Promise<ServerAgent> {
	if (gm.game.moves.length === 0) {
		return gm.game.agents[0];
	}

	const last_move = gm.game.moves[gm.game.moves.length - 1];
	const next_agent = gm.game.agents.find((x) => x.id !== last_move.agent);
	if (!next_agent) {
		throw new Error(`Agent ${last_move.agent} not found`);
	}

	return next_agent;
}

export async function serialize(state: CrossKillState): Promise<string> {
	const n = state.board.length;
	const m = state.board[0].length;

	let s = `${n} ${m}\n`;
	for (const row of state.board) {
		s += row.map((x) => (x ? "1" : "0")).join(" ") + "\n";
	}

	return s;
}

export async function update(
	gm: GameManager<CrossKillState>,
	agent: ServerAgent,
	move: string,
): Promise<void> {
	move = move.toLowerCase().trim();
	let mode: string | undefined;
	if (move.startsWith("row")) {
		mode = "row";
	} else if (move.startsWith("col")) {
		mode = "col";
	}

	if (!mode) {
		throw new Error(`Invalid move: ${move}`);
	}

	const [pos, pts, sec] = move
		.split("\n")
		.map((x) => x.match(/(\d+)/)?.[0])
		.map(Number);
	if (isNaN(pos) || isNaN(pts) || isNaN(sec)) {
		throw new Error(`Invalid move: ${move}`);
	}

	const n = gm.game.state.board.length;
	const m = gm.game.state.board[0].length;

	if (mode === "row" && (pos < 1 || pos > n)) {
		throw new Error(`Invalid move: ${move}`);
	}
	if (mode === "col" && (pos < 1 || pos > m)) {
		throw new Error(`Invalid move: ${move}`);
	}

	let count = 0;
	if (mode === "row") {
		for (let i = 0; i < m; i++) {
			if (gm.game.state.board[pos - 1][i]) {
				gm.game.state.board[pos - 1][i] = false;
				count++;
			}
		}
	}
	if (mode === "col") {
		for (let i = 0; i < n; i++) {
			if (gm.game.state.board[i][pos - 1]) {
				gm.game.state.board[i][pos - 1] = false;
				count++;
			}
		}
	}

	if (count === 0) {
		throw new Error(`Invalid move: ${move}`);
	}

	const idx = gm.game.agents.findIndex((x) => x.id === agent.id);
	if (idx === -1) {
		throw new Error(`Agent ${agent.id} not found`);
	}
	gm.game.state.scores[idx] += count;

	const is_over = gm.game.state.board.every((row) => row.every((x) => !x));
	if (is_over) {
		gm.end();
	}
}
