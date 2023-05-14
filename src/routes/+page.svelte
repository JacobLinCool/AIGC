<script lang="ts">
	import { goto } from "$app/navigation";
	import { user } from "$lib/auth";
	import { t } from "svelte-i18n";

	let id = "";
	function join() {
		if (!id) {
			return;
		}
		goto(`/game/${id.toLowerCase()}`);
	}
</script>

<svelte:head>
	<title>{$t("menu.title")}</title>
	<meta name="description" content={$t("menu.description")} />
</svelte:head>

<div class="flex w-full max-w-xs flex-col items-center justify-center">
	<h1 class="mb-4 text-center text-4xl font-bold">
		{$t("menu.title")}
	</h1>
	<p class="mb-8 text-center">
		{$t("menu.description")}
	</p>

	<div class="flex w-full flex-col items-center justify-center">
		<div class="form-control w-full">
			<button class="btn-primary btn-lg btn" on:click={() => goto("/game")} disabled={!$user}>
				{$t("menu.new")}
			</button>
		</div>
		<div class="divider">
			{$t("menu.or")}
		</div>
		<div class="form-control w-full">
			<div class="input-group">
				<input
					type="text"
					class="input-secondary input w-full !rounded-l-lg"
					placeholder={$t("menu.game-id")}
					bind:value={id}
					on:keydown={(evt) => {
						if (evt.key === "Enter") {
							join();
						}
					}}
				/>
				{#if id}
					<button class="btn-secondary btn" on:click={join}>
						{$t("menu.join")}
					</button>
				{/if}
			</div>
		</div>
		<div class="divider" />
		<div class="form-control">
			<a class="btn-outline btn" href="/settings">
				{$t("menu.settings")}
			</a>
		</div>
	</div>
</div>
