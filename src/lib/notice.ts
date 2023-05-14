import { writable } from "svelte/store";

export const messages = writable<
	{
		id: string;
		type: "info" | "warning" | "success" | "error";
		content: string;
		action?: () => void;
	}[]
>([]);

export function append(
	type: "info" | "warning" | "success" | "error",
	content: string,
	{ ttl = 3000, action = undefined }: { ttl?: number; action?: () => void } = {},
): void {
	const id = Math.random().toString(36).substring(2);

	messages.update((messages) => [
		...messages,
		{
			id,
			type,
			content,
			action,
		},
	]);

	setTimeout(() => {
		messages.update((messages) => messages.filter((m) => m.id !== id));
	}, ttl);
}
