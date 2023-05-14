<script lang="ts">
	import { page } from "$app/stores";
	import { token } from "$lib/auth";
	import { append } from "$lib/notice";

	export let key: string;

	const langs = ["human", "js", "ts", "c", "cpp", "rs", "py"];
	let lang = langs[0];
	let source = "";

	let waiting = false;
	async function upload() {
		if (waiting) {
			return;
		}
		waiting = true;

		try {
			const res = await fetch(`/api/agent`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({ lang, source }),
			});
			if (!res.ok) {
				throw new Error("Upload failed");
			}

			const { hash } = await res.json();

			const reg = await fetch(`/api/game/${$page.params.id}/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({ id: hash, key }),
			});

			if (!reg.ok) {
				throw new Error("Failed to register");
			}

			append("success", "Upload successful");
		} catch (err) {
			append("error", "Upload failed");
			console.error(err);
		} finally {
			waiting = false;
		}
	}
</script>

<div class="flex w-full justify-center p-2">
	<div class="w-full max-w-md">
		<h1 class="mb-4 text-xl font-bold">Upload Your Agent</h1>
		<div class="flex w-full justify-between gap-2">
			<div class="form-control w-full">
				<select class="select-bordered select" bind:value={lang}>
					{#each langs as l}
						<option value={l}>{l}</option>
					{/each}
				</select>
			</div>
			<button class="btn-primary btn" on:click={upload} disabled={waiting}>Upload</button>
		</div>
		{#if lang !== "human"}
			<div class="form-control">
				<label class="label" for="">
					<span class="label-text">Source Code</span>
				</label>
				<textarea class="textarea-bordered textarea h-40 font-mono" bind:value={source} />
			</div>
		{/if}
	</div>
</div>
