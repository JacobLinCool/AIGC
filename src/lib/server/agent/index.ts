import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { env } from "$env/dynamic/private";
import { sha256 } from "$lib/server/utils";
import type { ServerAgent } from "$lib/types";

export const AGENT_HOME = env.AGENT_HOME || "./agents";
if (!fs.existsSync(AGENT_HOME)) {
	fs.mkdirSync(AGENT_HOME, { recursive: true });
}

export class Agents extends Map {
	get(id: string): Omit<ServerAgent, "$owner"> | undefined {
		if (id.startsWith("human")) {
			const agent: Omit<ServerAgent, "$owner"> = {
				id,
				lang: "human",
				src: "",
				exec: async () => "HUMAN",
				post: (message) => {
					console.log("human agent post", message);
				},
				wait() {
					const p = new Promise<string>((r) => (this.post = r));
					return p;
				},
			};

			return agent;
		}
		return super.get(id);
	}

	async add(lang: string, src: string): Promise<void> {
		src = src.trim();
		const id = sha256(src);
		if (this.has(id)) {
			return;
		}

		if (!["js", "ts", "c", "cpp", "rs", "py"].includes(lang)) {
			throw new Error(`Invalid language: ${lang}`);
		}

		const agent: Omit<ServerAgent, "$owner"> = {
			id,
			lang,
			src,
			async exec() {
				return "WAITING";
			},
			post: () => void 0,
			wait() {
				return new Promise((r) => (agent.post = r));
			},
		};

		console.log("compiling agent", id, lang);
		let exe: string | undefined;
		switch (lang) {
			case "js": {
				if (!src.startsWith("#!/usr/bin/env node")) {
					src = `#!/usr/bin/env node\n${src}`;
				}

				const file = path.join(AGENT_HOME, id, "agent.js");
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file, src);
				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
			case "ts": {
				if (!src.startsWith("#!/usr/bin/env node")) {
					src = `#!/usr/bin/env node\n${src}`;
				}

				const file = path.join(AGENT_HOME, id, "agent.js");
				fs.mkdirSync(path.dirname(file), { recursive: true });

				await new Promise((resolve, reject) => {
					const proc = exec(
						`esbuild --bundle --outfile=${file} --platform=node --target=node16`,
						(err, stdout, stderr) => {
							if (err) {
								console.log(err);
								console.log(stderr);
								reject(err);
							} else {
								resolve(stdout);
							}
						},
					);
					proc.stdin?.write(src);
					proc.stdin?.end();
				});

				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
			case "c": {
				const file = path.join(AGENT_HOME, id, "agent");
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file + ".c", src);

				await new Promise((resolve, reject) => {
					const proc = exec(
						`gcc -std=c11 -lm -o ${file} -O2 -g ${file}.c`,
						(err, stdout, stderr) => {
							if (err) {
								console.log(err);
								console.log(stderr);
								reject(err);
							} else {
								resolve(stdout);
							}
						},
					);
					proc.stdin?.write(src);
					proc.stdin?.end();
				});

				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
			case "cpp": {
				const file = path.join(AGENT_HOME, id, "agent");
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file + ".cpp", src);

				await new Promise((resolve, reject) => {
					const proc = exec(
						`g++ -std=c++17 -lm -o ${file} -O2 -g ${file}.cpp`,
						(err, stdout, stderr) => {
							if (err) {
								console.log(err);
								console.log(stderr);
								reject(err);
							} else {
								resolve(stdout);
							}
						},
					);
					proc.stdin?.write(src);
					proc.stdin?.end();
				});

				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
			case "rs": {
				const file = path.join(AGENT_HOME, id, "agent");
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file + ".rs", src);

				await new Promise((resolve, reject) => {
					const proc = exec(
						`rustc --edition 2021 -O -g -o ${file} ${file}.rs`,
						(err, stdout, stderr) => {
							if (err) {
								console.log(err);
								console.log(stderr);
								reject(err);
							} else {
								resolve(stdout);
							}
						},
					);

					proc.stdin?.write(src);
					proc.stdin?.end();
				});

				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
			case "py": {
				if (!src.startsWith("#!/usr/bin/env python")) {
					src = `#!/usr/bin/env python\n${src}`;
				}

				const file = path.join(AGENT_HOME, id, "agent.py");
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file, src);
				fs.chmodSync(file, 0o755);

				exe = file;
				break;
			}
		}

		if (!exe) {
			throw new Error(`Invalid language: ${lang}`);
		}

		const executable = exe;
		agent.exec = async (input: string) => {
			return new Promise((resolve, reject) => {
				const proc = exec(executable, (err, stdout) => {
					if (err) {
						reject(err);
					}
					resolve(stdout);
				});
				proc.stdin?.write(input);
				proc.stdin?.end();
			});
		};

		super.set(id, agent);
	}

	/** It throws, use .add instead */
	set(): this {
		throw new Error("Use .add instead");
	}
}

export const agents = new Agents();
