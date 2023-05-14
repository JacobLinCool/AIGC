<script lang="ts">
	import { key } from "$lib/store";
	import type { GameInstance } from "$lib/types";
	import type { CrossKillState } from "../core";

	export let game: GameInstance<unknown>;
	$: g = game as GameInstance<CrossKillState>;
	$: winner =
		g.state.scores[0] === g.state.scores[1]
			? null
			: g.agents[g.state.scores[0] > g.state.scores[1] ? 0 : 1];
</script>

{#if g.status === "done"}
	<div class="flex h-full w-full flex-col items-center justify-center gap-1 sm:gap-2">
		{#if !winner}
			<h1 class="text-xl font-bold">平手！</h1>
			<p>
				雙方都得到了 {g.state.scores[0]} 分。
			</p>
		{:else if winner.$owner === $key}
			<h1 class="text-2xl font-bold">🎉 🎉 你贏了！ 🎉 🎉</h1>
			<p>
				你得到了 {g.state.scores[0]} 分，對手只有 {g.state.scores[1]} 分。
			</p>
		{:else}
			<h1 class="text-xl font-bold">結束！</h1>
			<p>
				一號玩家得到了 {g.state.scores[0]} 分，二號玩家得到了 {g.state.scores[1]} 分。
			</p>
		{/if}
	</div>
{/if}
