<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { token } from "$lib/auth";
	import End from "$lib/games/cross-kill/view/End.svelte";
	import Game from "$lib/games/cross-kill/view/Game.svelte";
	import { append } from "$lib/notice";
	import { key } from "$lib/store";
	import type { GameInstance } from "$lib/types";
	import { onDestroy, onMount } from "svelte";
	import { Confetti } from "svelte-confetti";
	import { t } from "svelte-i18n";
	import UploadAgent from "./UploadAgent.svelte";

	let es: EventSource | null = null;
	let game: GameInstance | null = null;
	let waiting = false;
	const id = $page.params.id.toLowerCase();

	onMount(() => {
		retrieve_key();

		es = new EventSource(`/api/game/${id}?key=${$key}`);
		es.addEventListener("reset", (evt) => {
			const data = JSON.parse(evt.data);
			console.log("reset", data);
			game = data;
		});
		es.addEventListener("update", (evt) => {
			if (!game) {
				return;
			}
			const data = JSON.parse(evt.data) as {
				move: GameInstance["moves"][number];
				state: unknown;
			};
			console.log("update", data);
			game.moves.push(data.move);
			game.state = data.state;
			game = game;
		});
		es.addEventListener("notice", (evt) => {
			if (!game) {
				return;
			}
			const data = JSON.parse(evt.data) as {
				waiting?: boolean;
			};

			if (data.waiting !== undefined) {
				waiting = data.waiting;
			}
		});
		es.onerror = (evt) => {
			append("error", "Connection Lost");
			console.error(evt);
			goto("/");
		};
	});

	onDestroy(() => {
		es?.close();
	});

	function retrieve_key() {
		const params = new URLSearchParams(window.location.search);
		const k = params.get("key");
		if (k) {
			$key = k;
		}
	}

	async function start() {
		const res = await fetch(`/api/game/${id}/start`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${$token}`,
			},
			body: JSON.stringify({
				key: $key,
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}
	}

	async function instruct(evt: CustomEvent) {
		waiting = false;
		const res = await fetch(`/api/game/${id}/instruct`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${$token}`,
			},
			body: JSON.stringify({
				key: $key,
				command: evt.detail,
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}
	}
</script>

<svelte:head>
	<title>{$t("menu.title")}</title>
	<meta name="description" content={$t("menu.description")} />
</svelte:head>

<div class="flex h-full w-full flex-col items-center gap-4">
	<div class="navbar rounded-lg bg-base-100 shadow-lg">
		<div class="flex-1">
			<a class="btn-ghost btn text-xl font-bold" href="/">
				{$t("menu.title")}
			</a>
		</div>
		<div>
			<a class="px-2 text-xl" target="_blank" href="/game/{id}">
				{$t("game.id")}
				<span class="ml-2 font-bold uppercase text-secondary">
					{id}
				</span>
			</a>
		</div>
	</div>

	<div class="w-full flex-1 overflow-auto">
		{#if !game}
			<div class="flex w-full animate-pulse justify-center text-2xl font-bold">Loading</div>
		{:else if game.status === "waiting"}
			<div class="flex w-full justify-center p-2">
				<div class="flex w-full max-w-md justify-evenly gap-4">
					{#each game.agents as agent}
						<div class="card">
							<div class="card-body">
								{agent.id}
							</div>
						</div>
					{/each}
				</div>
			</div>
			<UploadAgent key={$key} />
			{#if game.$owner === $key}
				<div class="flex w-full justify-center p-2">
					<button class="btn-primary btn" on:click={start}>
						{$t("game.start")}
					</button>
				</div>
			{/if}
		{:else if game.status === "playing"}
			<Game on:instruct={instruct} bind:game bind:waiting />
		{:else if game.status === "done"}
			<End bind:game />

			<div
				class="pointer-events-none fixed -top-12 left-0 z-10 flex h-full w-full justify-center"
			>
				<Confetti
					x={[-5, 5]}
					y={[0, 0.1]}
					delay={[500, 2000]}
					infinite
					duration="5000"
					amount="200"
					fallDistance="100vh"
				/>
			</div>
		{/if}
	</div>
</div>
