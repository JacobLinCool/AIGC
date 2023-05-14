import type { GameInstance, GameManager, ServerAgent } from "$lib/types";

export type GameModule<GameState = unknown> = {
	init: (init: unknown) => { state: GameState; config: GameInstance["config"] };
	/**
	 * Join an agent to the game.
	 * Don't forget to use `gm.join` to add the agent to the game
	 */
	join: (
		gm: GameManager<GameState>,
		agent: Omit<ServerAgent, "$owner">,
		owner: string,
	) => Promise<void>;
	/**
	 * Start the game.
	 * Don't forget to use `gm.start` to start the game
	 */
	start: (gm: GameManager<GameState>) => Promise<void>;
	/**
	 * Called in the game loop.
	 * Choose the next agent to play.
	 */
	assign: (gm: GameManager<GameState>) => Promise<ServerAgent>;
	/**
	 * Serialize the game state to a string.
	 */
	serialize: (state: GameState) => Promise<string>;
	/**
	 * Update the game state with the given move.
	 * You should perform some checks to ensure the move is valid, and throw an error if it's not.
	 */
	update: (gm: GameManager<GameState>, agent: ServerAgent, move: string) => Promise<void>;
};
