import { writable } from "svelte/store";
import { user } from "./auth";

export const key = writable(Math.random().toString(36).substring(2));
user.subscribe((u) => {
	if (u) {
		key.set(u.email);
	}
});
