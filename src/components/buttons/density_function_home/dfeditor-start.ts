import {
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	codeBlock,
	ButtonInteraction,
} from "discord.js";
import { Button, DatabaseJSONObject, ToolType } from "../../../types/types";
import { EmbedBuilderWithData } from "../../../types/classes";
import { EmbedUtil } from "../../../utils/util";
import { Bot } from "main";
import { DatabaseManager } from "database/manager";
import { getCenteredObjectSnippet } from "../../../types/functions";

export default {
	id: "dfeditor-start",
	async execute(interaction, client) {
		if (!client.util.isInteractionOwner(interaction))
			return client.util.deny(interaction);

		const database = client.database;
		initialiseDatabaseProfile(interaction, database);

		const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

		await interaction.message.edit({
			embeds: buildEmbed(interaction, client, entry),
			components: buildActionRows(client)
		});

		return interaction.deferUpdate();
	},
} as Button;

//Code snippets
const initialiseDatabaseProfile = (interaction: ButtonInteraction, database: DatabaseManager) => {
	if (!database.getEntry(interaction.user.id)?.density_function) {
		database.existsEntry(interaction.user.id)
			? database.updateEntry(
				interaction.user.id, 
				{
					density_function: {
						json: "{}",
						location: "",
						modal_value: null,
					}
				}
			) as DatabaseJSONObject
			: database.createEntry(
				interaction.user.id,
				interaction.user.username,
				{
					density_function: {
						json: "{}",
						location: "",
						modal_value: null,
					}
				} as DatabaseJSONObject
			) as DatabaseJSONObject;
	};

	database.updateEntry(
		interaction.user.id,
		{
			active_menus: {
				[ToolType.DENSITY_FUNCTION_EDITOR]: {
					main: interaction.token
				}
			}
		}
	)
}

const buildEmbed = (interaction: ButtonInteraction, client: Bot, entry: DatabaseJSONObject) => {
	return new EmbedBuilderWithData()
		.setAuthor({
			name: `Requested by ${interaction.user.displayName}`,
			iconURL: interaction.user.displayAvatarURL(),
		})
		.setColor(EmbedUtil.TransparentColour)
		.setDescription(
			codeBlock(
				"json",
				getCenteredObjectSnippet(
					entry.density_function.json as string, 
					entry.density_function.location as string
				)
			)
		)
		.setFooter({
			text: "Made by rolyPolyVole",
			iconURL: EmbedUtil.InfoIcon as string,
		})
		.setTimestamp()
		.setTitle("Untitled Density Function File")
		.setFields({
			name: "You're currently in:",
			value: client.objectUtil.formatObjectPath(client, entry),
		})

		.createDataField(EmbedBuilderWithData.defaultURL)
		.appendStringValue(interaction.user.id)
		.build();
}

const buildActionRows = (client: Bot) => {
	const backButton = new ButtonBuilder()
		.setCustomId("dfeditor-back")
		.setEmoji(client.util.componentEmoji("1165724096424857813"))
		.setStyle(ButtonStyle.Secondary);

	const infoButton = new ButtonBuilder()
		.setCustomId("dfeditor-info")
		.setLabel("Info")
		.setEmoji(client.util.componentEmoji("1163975203479638097"))
		.setStyle(ButtonStyle.Primary);

	const editButton = new ButtonBuilder()
		.setCustomId("dfeditor-edit")
		.setLabel("Edit JSON")
		.setEmoji(client.util.componentEmoji("1165724773679112363"))
		.setStyle(ButtonStyle.Secondary);

	const downloadButton = new ButtonBuilder()
		.setCustomId("dfeditor-download")
		.setLabel("Download")
		.setEmoji(client.util.componentEmoji("1166094074395230240"))
		.setStyle(ButtonStyle.Secondary);

	const refreshButton = new ButtonBuilder()
		.setCustomId("dfeditor-refresh")
		.setEmoji(client.util.componentEmoji("1165725004965629952"))
		.setStyle(ButtonStyle.Secondary);

	const clearButton = new ButtonBuilder()
		.setCustomId("dfeditor-clear")
		.setEmoji(client.util.componentEmoji("1163965675811901540"))
		.setStyle(ButtonStyle.Danger);

	return [
		new ActionRowBuilder<ButtonBuilder>().setComponents(infoButton, editButton, downloadButton, clearButton),
		new ActionRowBuilder<ButtonBuilder>().setComponents(backButton, refreshButton)
	];
}
