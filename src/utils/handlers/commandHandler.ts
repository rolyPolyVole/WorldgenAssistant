import { Bot } from "../../main";
import fs from "node:fs";
import { Command } from "../../types/types";
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
import chalk from "chalk";

export default (client: Bot): Bot => {
	client.handleCommands = async () => {
		const commandFolder = fs.readdirSync("./dist/commands");

		for (const folder of commandFolder) {
			const commandSubfolder = fs
				.readdirSync(`./dist/commands/${folder}`)
				.filter((file) => !file.endsWith(".js.map"));

			for (const file of commandSubfolder) {
				const command: Command = (
					await import(`../../commands/${folder}/${file}`)
				).default as Command;

				client.commandArray.push(command.data);
				client.commands.set(command.data.name, command);
			}
		}

		try {
			client.util.log("Started loading application commands...", chalk.yellow);

			await new REST({ version: "10" })
				.setToken(client.defaultBotToken)
				.put(Routes.applicationCommands(client.clientId), {
					body: client.commandArray,
				});

			client.util.log("Successfully loaded application commands.", chalk.green);
		} catch (err) {
			client.util.log("Failed to load application commands; See error below.", chalk.red);
			throw err;
		}
	};

	return client;
};
