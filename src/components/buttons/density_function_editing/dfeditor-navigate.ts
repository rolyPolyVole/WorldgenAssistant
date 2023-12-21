import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { EmbedBuilderWithData, MenuTimeout } from "../../../types/classes";
import { Button, DatabaseJSONObject, MenuSystemNamespaces, StringKeyObject, ToolType } from "../../../types/types";
import { EmbedUtil } from "../../../utils/util";
import { getEnabledButtonMap } from "../../../types/functions";
import { Bot } from "main";
import menuTimeout from "../../../tasks/embeds/menus/menu-timeout";

export default {
    id: "dfeditor-navigate",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction)) 
            return client.util.deny(interaction);

        await client.util.killPreviousMenu(interaction, client, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_NAVIGATE, ToolType.DENSITY_FUNCTION_EDITOR);
        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

        database.updateEntry(
            interaction.user.id,
            {
                active_menus: {
                    [ToolType.DENSITY_FUNCTION_EDITOR]: {
                        [MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_NAVIGATE + interaction.message.id]: interaction.token
                    }
                }
            }
        );

        await interaction.reply({
            content: "**TIP:** Actions such as adding a function are performed at the current location.",
            embeds: buildEmbed(interaction, client, entry),
            components: buildActionRows(client, entry)
        });

        new MenuTimeout(interaction.message.id, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_NAVIGATE)
            .setTimeout(async () => {
                await menuTimeout.run(interaction, client, ToolType.DENSITY_FUNCTION_EDITOR, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_NAVIGATE);
        });
    },
} as Button;

const buildEmbed = (interaction: ButtonInteraction, client: Bot, entry: DatabaseJSONObject) => {
    return new EmbedBuilderWithData()
        .setDescription("Use the arrows below to navigate through your density function file. The field below shows where you are currently at within the file. <:route:1163975347725930547>")
        .setColor(EmbedUtil.TransparentColour)
        .setDefaultFooter()
        .setTimestamp()
        .setFields(
            {
                name: "You're currently in:",
                value: client.objectUtil.formatObjectPath(client, entry)
            }
        )

        .createDataField(EmbedBuilderWithData.defaultURL)
        .appendStringValue(interaction.user.id)
        .build();
}

const buildActionRows = (client: Bot, entry: DatabaseJSONObject) => {
    const inButton = new ButtonBuilder()
        .setCustomId("dfeditor-navigate-in")
        .setEmoji(client.util.componentEmoji("1165722119083135136"))
        .setStyle(ButtonStyle.Primary);
    const outButton = new ButtonBuilder()
        .setCustomId("dfeditor-navigate-out")
        .setEmoji(client.util.componentEmoji("1165724096424857813"))
        .setStyle(ButtonStyle.Primary);
    const upButton = new ButtonBuilder()
        .setCustomId("dfeditor-navigate-up")
        .setEmoji(client.util.componentEmoji("1165722216915279972"))
        .setStyle(ButtonStyle.Primary);
    const downButton = new ButtonBuilder()
        .setCustomId("dfeditor-navigate-down")
        .setEmoji(client.util.componentEmoji("1165722262930989197"))
        .setStyle(ButtonStyle.Primary);
    const closeButton = new ButtonBuilder()
        .setCustomId("dfeditor-close")
        .setEmoji(client.util.componentEmoji("1163975338766897224"))
        .setStyle(ButtonStyle.Secondary);
    const refreshButton = new ButtonBuilder()
        .setCustomId("dfeditor-navigate-refresh")
        .setEmoji(client.util.componentEmoji("1165725004965629952"))
        .setStyle(ButtonStyle.Secondary);

    const enabledButtonMap = getEnabledButtonMap(
        client,
        JSON.parse(entry.density_function.json as string) as StringKeyObject,
        entry.density_function.location
    );  

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents([outButton, inButton, refreshButton]
            .map((c, i) => c.setDisabled(!enabledButtonMap[i]))),
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents([upButton, downButton, closeButton]
            .map((c, i) => c.setDisabled(!enabledButtonMap[i + 3])))
    ];
}