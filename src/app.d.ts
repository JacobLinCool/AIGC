import type { ComponentType } from "svelte";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: string;
		}
		// interface PageData {}
		// interface Platform {}
	}

	declare module "svelte-confetti" {
		const confetti: ComponentType;
		export default confetti;
	}
}

export {};
