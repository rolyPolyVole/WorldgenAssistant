import {  ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from "discord.js";
import { Event } from "../../types/types";
import chalk from "chalk";

export default {
    once: false,
	type: "interactionCreate",
	async execute(client, interaction) {
		if (interaction instanceof ChatInputCommandInteraction) {
			const { commands } = client;
			const command = commands.get(interaction.commandName);

			if (!command) {
				client.util.log(
					`Unknown command executed with name /${interaction.commandName}.`,
					chalk.red
				);

				return interaction.reply({
					content: "This command does not yet exist.",
					ephemeral: true,
				});
			}

			try {
				return await command.execute(
					interaction as ChatInputCommandInteraction,
					client
				);
			} catch (error) {
				throw error;
			}
		} else if (interaction instanceof ButtonInteraction) {
			const { buttons } = client;

			const button = buttons.get(interaction.customId);

			if (!button) {
				client.util.log(
					`Unknown button executed with id ${interaction.customId}.`,
					chalk.red
				);

				return interaction.reply({
					content: "This button is not yet enabled.",
					ephemeral: true,
				});
			}

			try {
				return await button.execute(interaction as ButtonInteraction, client);
			} catch (error) {
				throw error;
			}
		} else if (interaction instanceof StringSelectMenuInteraction) {
			const { menus } = client;

			const menu = menus.get(interaction.customId);

			if (!menu) {
				client.util.log(
					`Unknown menu executed with id ${interaction.customId}.`,
					chalk.red
				);

				return interaction.reply({
					content: "This menu is not yet enabled.",
					ephemeral: true,
				});
			}

			try {
				return await menu.execute(interaction as StringSelectMenuInteraction, client);
			} catch (error) {
				throw error;
			}
		} else if (interaction instanceof ModalSubmitInteraction) {
			const { modals } = client;

			const modal = modals.get(interaction.customId);

			if (!modal) {
				client.util.log(
					`Unknown button executed with id ${interaction.customId}.`,
					chalk.red
				);

				return interaction.reply({
					content: "This modal is not yet enabled.",
					ephemeral: true,
				});
			}

			try {
				return await modal.execute(interaction as ModalSubmitInteraction, client);
			} catch (error) {
				throw error;
			}
		} else return;
	},
} as Event;
