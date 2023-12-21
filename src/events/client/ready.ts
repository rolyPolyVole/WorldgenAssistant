import { Event } from "../../types/types";
import chalk from "chalk";

export default {
	once: true,
	type: "ready",
	async execute(client) {
		client.util.log(`Logged in as ${client.user?.username} in ${client.guilds.cache.size} server(s).`, chalk.cyan);
		client.onlineTimestamp = Date.now() as unknown as BigInt;
	},
} as Event;
