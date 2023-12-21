import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction } from "discord.js";
import { EmbedBuilderWithData } from "../../../types/classes";
import { getEnabledButtonMap } from "../../../types/functions";
import { Button, DatabaseJSONObject, StringKeyObject } from "../../../types/types";
import { Bot } from "main";
import embed from "../../../tasks/embeds/menus/dfeditor-menu-refresh";


export default {
    id: "dfeditor-navigate-refresh",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const entry = client.database.getEntry(interaction.user.id) as DatabaseJSONObject;
        const JSONdata = JSON.parse(entry.density_function.json);

        await interaction.message.edit({
            embeds: buildEmbed(interaction, client),
            components: buildActionRows(interaction, client, JSONdata, entry)
        });

        return interaction.deferUpdate();
    },
} as Button;

//Code Snippets
const buildActionRows = (interaction: ButtonInteraction, client: Bot, data: StringKeyObject, entry: DatabaseJSONObject) => {
    const actionRows = interaction.message.components;

    const enabledButtonMap = getEnabledButtonMap(
        client,
        data,
        entry.density_function.location
    );

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents(actionRows[0].components
            .map((c, i) => ButtonBuilder.from(c as APIButtonComponent).setDisabled(!enabledButtonMap[i]))),
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents(actionRows[1].components
            .map((c, i) => ButtonBuilder.from(c as APIButtonComponent).setDisabled(!enabledButtonMap[i + 3])))
    ];
}

const buildEmbed = (interaction: ButtonInteraction, client: Bot) => {
    return (embed.run(interaction, client) as EmbedBuilderWithData).build();
}