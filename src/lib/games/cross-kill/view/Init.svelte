<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let disabled: boolean;

	const dispatch = createEventDispatcher();

	const MAX = 8;

	let n = 4;
	let m = 8;

	let board: boolean[][] | null = null;

	function upload(evt: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		const file = evt.currentTarget.files?.[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			const nums = text.split(/\s+/).map((s) => parseInt(s, 10));
			if (nums[0] > 1 || nums[1] > 1) {
				n = nums[0];
				m = nums[1];
				board = Array.from({ length: n }, (_, i) =>
					Array.from({ length: m }, (_, j) => !!nums[2 + i * m + j]),
				);
			} else {
				const lines = text
					.split(/\n/)
					.filter((s) => s.trim())
					.map((l) => l.split(/\s+/).map((s) => parseInt(s, 10)));
				n = lines.length;
				m = lines[0].length;
				board = Array.from({ length: n }, (_, i) =>
					Array.from({ length: m }, (_, j) => !!lines[i][j]),
				);
			}
		};
		reader.readAsText(file);
	}

	function next() {
		board = Array.from({ length: n }, () => Array.from({ length: m }, () => true));
	}

	function start() {
		dispatch("start", { board });
	}
</script>

{#if !board}
	<div class="form-control w-full">
		<input id="file-input" type="file" class="hidden" on:change={upload} {disabled} />
		<label class="btn-outline btn-primary btn w-full" for="file-input"> 上傳棋盤 </label>
	</div>
	<div class="divider">或</div>
	<div class="form-control w-full">
		<div class="label">
			<label class="label-text" for=""> 列數 (n) </label>
		</div>
		<select class="select-bordered select-primary select w-full" bind:value={n} {disabled}>
			{#each Array.from({ length: MAX }, (_, i) => i + 1) as i}
				<option value={i}>{i}</option>
			{/each}
		</select>
	</div>

	<div class="form-control w-full">
		<div class="label">
			<label class="label-text" for=""> 行數 (m) </label>
		</div>
		<select class="select-bordered select-primary select w-full" bind:value={m} {disabled}>
			{#each Array.from({ length: MAX }, (_, i) => i + 1) as i}
				<option value={i}>{i}</option>
			{/each}
		</select>
	</div>

	<button class="btn-primary btn" on:click={next} {disabled}> 下一步 </button>
{:else}
	<h2 class="text-xl">設定初始棋盤</h2>

	<div>
		{#each board as row, i}
			<div class="flex">
				{#each row as cell, j}
					<input
						type="checkbox"
						class="checkbox-secondary checkbox m-1 sm:checkbox-lg sm:m-4"
						bind:checked={cell}
						{disabled}
					/>
				{/each}
			</div>
		{/each}
	</div>

	<div class="flex gap-4">
		<button class="btn-outline btn" on:click={() => (board = null)} {disabled}> 上一步 </button>
		<button class="btn-primary btn" on:click={start} {disabled}> 開始 </button>
	</div>
{/if}
