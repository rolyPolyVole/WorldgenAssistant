import { EmbedBuilderWithData } from "../../../types/classes";
import { Button, DatabaseJSONObject } from "../../../types/types";
import { ButtonInteraction, codeBlock } from "discord.js";
import embed from "../../../tasks/embeds/menus/dfeditor-menu-refresh";
import { Bot } from "main";
import { getCenteredObjectSnippet } from "../../../types/functions";

export default {
    id: "dfeditor-refresh",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

        await interaction.message.edit({
            embeds: buildEmbed(interaction, client, entry)
        });

        return interaction.deferUpdate();
    },
} as Button;

//Code snippets
const buildEmbed = (interaction: ButtonInteraction, client: Bot, entry: DatabaseJSONObject) => {
    return (embed.run(interaction, client) as EmbedBuilderWithData)
        .setDescription(
            codeBlock(
                "json", 
                getCenteredObjectSnippet(
                    entry.density_function.json as string, 
                    entry.density_function.location as string
                )
            )
        )
        .build();
}