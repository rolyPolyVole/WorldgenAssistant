import { Bot } from "main";
import { EmbedBuilderWithData, PageSystem } from "../../../types/classes";
import { Button, DatabaseUpdateObject, MenuSystemNamespaces, PageSystemNamespaces, ToolType } from "../../../types/types";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
} from "discord.js";

export default {
	id: "home-browsetools",
	async execute(interaction, client) {
		if (!client.util.isInteractionOwner(interaction)) 
			return client.util.deny(interaction);

		await client.util.killPreviousMenu(interaction, client, MenuSystemNamespaces.HOME_BROWSE_TOOLS, ToolType.HOME);
		const database = client.database;
		const toolPages = buildPageSystem(interaction, client);
		const pageButtonRow = buildActionRow(client, toolPages);

		const actionRow = toolPages.getPageValue().slice();
		actionRow.push(pageButtonRow);

		database.updateEntry(
			interaction.user.id,
			{ 
				active_menus: {
					[ToolType.HOME]: {
						[MenuSystemNamespaces.HOME_BROWSE_TOOLS + interaction.message.id]: interaction.token
					}
				} as DatabaseUpdateObject
			}
		);
		
		await interaction.reply({
			embeds: buildEmbed(interaction, client),
			components: actionRow,
		});
	},
} as Button;

//Code Snippets
const buildEmbed = (interaction: ButtonInteraction, client: Bot) => {
	const embed = client.util.shortEmbed("Below is a list of all available tools.", true, { boldPunctuation: true }) as EmbedBuilderWithData;
		
	return embed
		.createDataField(EmbedBuilderWithData.defaultURL)
		.appendStringValue(interaction.user.id)
		.build();
}

const buildPageSystem = (interaction: ButtonInteraction, client: Bot) => {
	const toolPages = PageSystem.existsKey(interaction.user.id, PageSystemNamespaces.BROWSE_TOOLS)
		? PageSystem.from(
			interaction.user.id, 
			PageSystemNamespaces.BROWSE_TOOLS
		) as PageSystem<ActionRowBuilder<ButtonBuilder>>
		: new PageSystem<ActionRowBuilder<ButtonBuilder>>(
			interaction.user.id,
			PageSystemNamespaces.BROWSE_TOOLS,
			3
		);

	toolPages.setElements(client.tools.map((tool, index) =>
		new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setCustomId("display-tool-" + index)
				.setDisabled(true)
				.setLabel((tool.name + ":").padEnd(client.util.densityFunction.longestToolName, "᲼"))
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(("home-usetool-" + ((index + 1) % 4 === 0 ? 4 : (index + 1) % 4)) as string)
				.setLabel("Use")
				.setStyle(ButtonStyle.Primary)
		)
	));

	return toolPages;
}

const buildActionRow = (client: Bot, pageSystem: PageSystem<ActionRowBuilder<ButtonBuilder>>) => {
	const prevButton = new ButtonBuilder()
		.setCustomId("home-prev")
		.setEmoji(client.util.componentEmoji("1165724070336270336"))
		.setLabel("Prev")
		.setDisabled(!pageSystem.copy().prevPage().existsPage())
		.setStyle(ButtonStyle.Secondary);

	const pageButton = new ButtonBuilder()
		.setCustomId("display-page")
		.setLabel(`「${pageSystem.getPageIndex() + 1}/${pageSystem.copy().getTotalPages()}」`)
		.setDisabled(true)
		.setStyle(ButtonStyle.Primary)

	const nextButton = new ButtonBuilder()
		.setCustomId("home-next")
		.setEmoji(client.util.componentEmoji("1165724045073977354"))
		.setLabel("Next")
		.setDisabled(!pageSystem.copy().nextPage().existsPage())
		.setStyle(ButtonStyle.Secondary);

	return new ActionRowBuilder<ButtonBuilder>().setComponents(prevButton, pageButton, nextButton);
}