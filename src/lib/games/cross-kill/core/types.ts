export interface CrossKillStateInit {
	board: boolean[][];
}

export interface CrossKillState {
	board: boolean[][];
	scores: [number, number];
}
