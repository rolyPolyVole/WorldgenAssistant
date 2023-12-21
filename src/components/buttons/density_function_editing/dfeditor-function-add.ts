import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, SelectMenuComponentOptionData, StringSelectMenuBuilder } from "discord.js";
import { EmbedBuilderWithData, MenuTimeout, PageSystem } from "../../../types/classes";
import { Button, DatabaseJSONObject, MenuSystemNamespaces, PageSystemNamespaces, ToolType } from "../../../types/types";
import { EmbedUtil } from "../../../utils/util";
import { Bot } from "main";
import menuTimeout from "../../../tasks/embeds/menus/menu-timeout";


export default {
    id: "dfeditor-function-add",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction)) 
            return client.util.deny(interaction);

        client.util.killPreviousMenu(interaction, client, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_ADD, ToolType.DENSITY_FUNCTION_EDITOR);

        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;
        const menuPages = buildPageSystem(interaction, client);
        
        database.updateEntry(
            interaction.user.id,
            {
                active_menus: {
                    [ToolType.DENSITY_FUNCTION_EDITOR]: {
                        [MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_ADD + interaction.message.id]: interaction.token
                    }
                }
            }
        );

        await interaction.reply({
            embeds: buildEmbed(interaction, client, entry),
            components: buildActionRows(client, menuPages)
        });

        new MenuTimeout(interaction.message.id, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_ADD)
            .setTimeout(async () => {
                await menuTimeout.run(interaction, client, ToolType.DENSITY_FUNCTION_EDITOR, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_ADD);
            });
    },
} as Button;

//Code Snippets
const buildEmbed = (interaction: ButtonInteraction, client: Bot, entry: DatabaseJSONObject) => {
    return new EmbedBuilderWithData()
        .setDescription("Use the select menu below to insert a density function in the\n currently selected location. <:developer_badge:1163983964340486155>")
        .setFields(
            {
                name: "You're currently in:",
                value: client.objectUtil.formatObjectPath(client, entry)
            }
        )
        .setColor(EmbedUtil.TransparentColour)
        
        .createDataField(EmbedBuilderWithData.defaultURL)
        .appendStringValue(interaction.user.id)
        .build();
}

const buildPageSystem = (interaction: ButtonInteraction, client: Bot) => {
    const functionPages = PageSystem.existsKey(interaction.user.id, PageSystemNamespaces.BROWSE_OPERATORS)
        ? PageSystem.from(
            interaction.user.id,
            PageSystemNamespaces.BROWSE_OPERATORS
        ) as PageSystem<SelectMenuComponentOptionData>
        : new PageSystem<SelectMenuComponentOptionData>(
            interaction.user.id, 
            PageSystemNamespaces.BROWSE_OPERATORS, 
            8
        );

    return functionPages.setElements(
        client.densityFunctions.map((df) => 
            client.objectUtil.nullToUndefined(df.menu) as unknown as SelectMenuComponentOptionData
        )
    );
}

const buildActionRows = (client: Bot, pageSystem: PageSystem<SelectMenuComponentOptionData>) => {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("dfeditor-function-select")
        .setMaxValues(1)
        .setPlaceholder("Select a function...")
        .setOptions(
            pageSystem.getPageValue()
        );

    const prevButton = new ButtonBuilder()
        .setCustomId("dfeditor-function-prev")
        .setLabel("Prev")
        .setDisabled(!pageSystem.copy().prevPage().existsPage())
        .setEmoji(client.util.componentEmoji("1165724070336270336"))
        .setStyle(ButtonStyle.Secondary);

    const pageButton = new ButtonBuilder()
        .setCustomId("display-page")
        .setLabel(`「${pageSystem.getPageIndex() + 1}/${pageSystem.copy().getTotalPages()}」`)
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary);

    const nextButton = new ButtonBuilder()
        .setCustomId("dfeditor-function-next")
        .setLabel("Next")
        .setDisabled(!pageSystem.copy().nextPage().existsPage())
        .setEmoji(client.util.componentEmoji("1165724045073977354"))
        .setStyle(ButtonStyle.Secondary);
    
    const closeButton = new ButtonBuilder()
        .setCustomId("dfeditor-close")
        .setEmoji(client.util.componentEmoji("1163975338766897224"))
        .setStyle(ButtonStyle.Secondary);

    return [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(menu),
        new ActionRowBuilder<ButtonBuilder>().setComponents(prevButton, pageButton, nextButton, closeButton)
    ];
}