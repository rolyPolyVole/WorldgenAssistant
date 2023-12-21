import { Bot } from "../../main";
import { AnyEvent } from "../../types/types";
import fs from "node:fs";

export default (client: Bot): Bot => {
	client.handleEvents = async () => {
		const eventFolder = fs.readdirSync("./dist/events");

		for (const eventSubfolders of eventFolder) {
			const eventSubfolder = fs
				.readdirSync(`./dist/events/${eventSubfolders}`)
				.filter((file) => !file.endsWith(".js.map"));

			for (const file of eventSubfolder) {
				const event = (
					await import(`../../events/${eventSubfolders}/${file}`)
				).default as AnyEvent;

				if (event.custom) {
					event.once
						? client.eventManager.once(
								event.type,
								(...args) =>
									event.execute(client, ...args) as Promise<void>
						  )
						: client.eventManager.on(
								event.type,
								(...args) =>
									event.execute(client, ...args) as Promise<void>
						  );
				} else {
					event.once
						? client.once(
								event.type,
								(...args) =>
									event.execute(client, ...args) as Promise<void>
						  )
						: client.on(
								event.type,
								(...args) =>
									event.execute(client, ...args) as Promise<void>
						  );
				}
			}
		}
	};

	return client;
};
