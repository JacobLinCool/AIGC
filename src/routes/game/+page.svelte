<script lang="ts">
	import { goto } from "$app/navigation";
	import { token } from "$lib/auth";
	import Init from "$lib/games/cross-kill/view/Init.svelte";
	import { key } from "$lib/store";
	import { t } from "svelte-i18n";

	let waiting = false;
	async function start(data: CustomEvent) {
		if (waiting) {
			return;
		}
		waiting = true;

		try {
			const res = await fetch("/api/game", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({
					type: "cross-kill",
					init: data.detail,
					key: $key,
				}),
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			const { id } = await res.json();
			await goto(`/game/${id}`);
		} finally {
			waiting = false;
		}
	}
</script>

<svelte:head>
	<title>{$t("menu.new")} | {$t("menu.title")}</title>
	<meta name="description" content={$t("menu.description")} />
</svelte:head>

<div class="flex w-full max-w-xs flex-col items-center justify-center gap-4">
	<h1 class="mb-4 text-3xl">
		{$t("menu.new")}
	</h1>

	<Init on:start={start} disabled={waiting} />
</div>
