export interface GameInstance<State = unknown, OnServer extends boolean = false> {
	type: string;
	status: "waiting" | "playing" | "done";
	timestamp: number;
	initial: State;
	state: State;
	agents: (OnServer extends true ? ServerAgent : Agent)[];
	moves: Move[];
	$owner: string;
	config: {
		time: {
			turn: number;
			game: number;
		};
	};
}

export interface GameManager<State = unknown> {
	game: GameInstance<State, true>;
	join: (agent: Omit<ServerAgent, "$owner">, owner: string) => void;
	start: () => void;
	end: () => void;
	update: (move: Move, state: State) => void;
	broadcast: (event: string, json: unknown) => void;
	notice: (to: string, json: unknown) => void;
}

export interface Agent {
	id: string;
	$owner?: string;
}

export interface ServerAgent {
	id: string;
	$owner: string;
	lang: string;
	src: string;
	exec: (input: string) => Promise<string>;
	wait: () => Promise<string>;
	post: (message: string) => void;
}

export interface Move {
	agent: string;
	action: string;
	time: number;
}
