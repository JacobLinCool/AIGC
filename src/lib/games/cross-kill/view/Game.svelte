<script lang="ts">
	import { key } from "$lib/store";
	import type { GameInstance } from "$lib/types";
	import { createEventDispatcher } from "svelte";
	import type { CrossKillState } from "../core";

	export let waiting = false;
	export let game: GameInstance<unknown>;
	$: g = game as GameInstance<CrossKillState>;
	$: is_player =
		g?.agents.find((a) => a.id.startsWith("human") && a.$owner === $key) !== undefined;

	const dispatch = createEventDispatcher();

	function instruct(mode: "Row" | "Column", index: number) {
		const command = `${mode}#: ${index}\n0 points\nTotal run time = 0 seconds`;
		dispatch("instruct", command);
	}
</script>

<div
	class="flex h-full w-full flex-col items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4"
>
	{#if is_player}
		<div class="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4">
			<div class="btn-ghost btn-square btn pointer-events-none max-md:btn-sm" />
			{#each Array.from({ length: g.state.board[0].length }) as _, i}
				<button
					class="btn-primary btn-square btn max-md:btn-sm"
					disabled={!waiting}
					on:click={() => instruct("Column", i + 1)}
				/>
			{/each}
		</div>
	{/if}
	{#each g.state.board as row, i}
		<div class="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4">
			{#if is_player}
				<button
					class="btn-primary btn-square btn max-md:btn-sm"
					disabled={!waiting}
					on:click={() => instruct("Row", i + 1)}
				/>
			{/if}
			{#each row as cell, j}
				<div
					class="btn-square btn-circle btn pointer-events-none max-md:btn-sm"
					class:btn-outline={!cell}
				/>
			{/each}
		</div>
	{/each}
</div>
