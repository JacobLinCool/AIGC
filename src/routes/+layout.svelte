<script lang="ts">
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import { user } from "$lib/auth";
	import { messages, append } from "$lib/notice";
	import { t } from "svelte-i18n";
	import { fade } from "svelte/transition";
	import "../app.css";

	user.subscribe((user) => {
		if (browser) {
			if (user) {
				append("success", $t("auth.logged-in-as", { values: { user: user.email } }));
			} else {
				append("info", $t("auth.you-are-in-guest-mode"), {
					ttl: 60 * 60 * 1000,
					action: () => {
						goto(
							"https://pea.csie.cool/app/aigc?cb=" +
								encodeURIComponent(location.href),
						);
					},
				});
			}
		}
	});
</script>

<div class="flex h-full w-full flex-col items-center justify-center p-4">
	<slot />
</div>

<div class="toast z-20 flex-col-reverse">
	{#each $messages as m}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="alert"
			class:alert-info={m.type === "info"}
			class:alert-success={m.type === "success"}
			class:alert-warning={m.type === "warning"}
			class:alert-error={m.type === "error"}
			class:cursor-pointer={!!m.action}
			transition:fade={{ duration: 200 }}
			on:click={m.action}
		>
			<div>
				<span>{m.content}</span>
			</div>
		</div>
	{/each}
</div>
