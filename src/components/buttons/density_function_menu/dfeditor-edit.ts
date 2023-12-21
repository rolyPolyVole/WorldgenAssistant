import { Bot } from "main";
import { EmbedBuilderWithData, MenuTimeout } from "../../../types/classes";
import { Button, MenuSystemNamespaces, ToolType } from "../../../types/types";

import {
	ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonInteraction,
} from "discord.js";

import menuTimeout from "../../../tasks/embeds/menus/menu-timeout";

export default {
	id: "dfeditor-edit",
	async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction)) 
            return client.util.deny(interaction);

        const database = client.database;
        client.util.killPreviousMenu(interaction, client, MenuSystemNamespaces.DENSITY_FUNCTION_MENU_EDIT, ToolType.DENSITY_FUNCTION_EDITOR);

        database.updateEntry(
            interaction.user.id,
            {
                active_menus: {
                    [ToolType.DENSITY_FUNCTION_EDITOR]: {
                       [MenuSystemNamespaces.DENSITY_FUNCTION_MENU_EDIT + interaction.message.id]: interaction.token
                    }
                }
            }
        );

        await interaction.reply({
            embeds: buildEmbed(interaction, client),
            components: buildActionRows(client)
        });

        new MenuTimeout(interaction.message.id, MenuSystemNamespaces.DENSITY_FUNCTION_MENU_EDIT)
            .setTimeout(async () => {
                await menuTimeout.run(interaction, client, ToolType.DENSITY_FUNCTION_EDITOR, MenuSystemNamespaces.DENSITY_FUNCTION_MENU_EDIT);
            });
	},
} as Button;

//Code Snippets
const buildEmbed = (interaction: ButtonInteraction, client: Bot) => {
    return (client.util.shortEmbed("Edit your density function using the buttons below. Browse the docs for\n information about every function.", true, { boldPunctuation: false }) as EmbedBuilderWithData)
        .createDataField(EmbedBuilderWithData.defaultURL)
        .appendStringValue(interaction.user.id)
        .build();
}

const buildActionRows = (client: Bot) => {
    const add = new ButtonBuilder()
        .setCustomId("dfeditor-function-add")
        .setLabel("Add Function")
        .setEmoji(client.util.componentEmoji("1163975336493584404"))
        .setStyle(ButtonStyle.Primary);
    const edit = new ButtonBuilder()
        .setCustomId("dfeditor-function-edit")
        .setLabel("Edit Function")
        .setEmoji(client.util.componentEmoji("1163975340201353326"))
        .setStyle(ButtonStyle.Primary);
    const discard = new ButtonBuilder()
        .setCustomId("dfeditor-function-delete")
        .setLabel("Delete")
        .setEmoji(client.util.componentEmoji("1163965675811901540"))
        .setStyle(ButtonStyle.Secondary);
    const navigate = new ButtonBuilder()
        .setCustomId("dfeditor-navigate")
        .setLabel("Navigate")
        .setEmoji(client.util.componentEmoji("1163975347725930547"))
        .setStyle(ButtonStyle.Secondary);
    const close = new ButtonBuilder()
        .setCustomId("dfeditor-close")
        .setEmoji(client.util.componentEmoji("1163975338766897224"))
        .setStyle(ButtonStyle.Secondary);

    return [ 
        new ActionRowBuilder<ButtonBuilder>().setComponents(add, edit, discard),
        new ActionRowBuilder<ButtonBuilder>().setComponents(navigate, close)
    ];
}