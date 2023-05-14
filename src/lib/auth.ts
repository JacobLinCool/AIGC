import { browser } from "$app/environment";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";

const prefix = "aigc-";
const key = {
	user: `${prefix}user`,
	token: `${prefix}token`,
};

export const token: Writable<string | null> = !browser
	? writable(null)
	: localStorage.getItem(key.token)
	? writable(JSON.parse(localStorage.getItem(key.token) || "null"))
	: writable(null);

export const user: Writable<{ exp: number; email: string } | null> = !browser
	? writable(null)
	: localStorage.getItem(key.user)
	? writable(JSON.parse(localStorage.getItem(key.user) || "null"))
	: writable(null);

token.subscribe((value) => {
	if (browser) {
		if (value) {
			localStorage?.setItem(key.token, JSON.stringify(value));
		} else {
			localStorage?.removeItem(key.token);
		}
	}
});

user.subscribe((value) => {
	if (browser) {
		if (value) {
			localStorage?.setItem(key.user, JSON.stringify(value));
		} else {
			localStorage?.removeItem(key.user);
		}
	}
});

if (browser) {
	const search = new URLSearchParams(location.search);
	if (search.has("token")) {
		const payload = JSON.parse(atob(search.get("token")?.split(".")[1] || ""));
		console.log(payload);
		user.set({
			exp: payload.exp,
			email: payload.sub,
		});
		token.set(search.get("token"));
		history.replaceState({}, "", location.pathname);
	}
}

check_exp();

function check_exp() {
	const u = get(user);
	if (u && u.exp < Date.now() / 1000) {
		user.set(null);
	}
}
