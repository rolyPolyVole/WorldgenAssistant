import { DatabaseManager } from "../../../database/manager";
import { ActionRowBuilder, ButtonBuilder, ButtonComponent, Message, StringSelectMenuBuilder, StringSelectMenuComponent } from "discord.js";
import { AnyMessageComponent, AnyMessageComponentInteraction, DatabaseJSONObject, DatafieldEmbed, InteractionTask, MenuSystemNamespaces, ToolType } from "../../../types/types";
import { EmbedBuilderWithData } from "../../../types/classes";
import { EmojiUtil } from "../../../utils/util";


export default {
    async run(interaction, client, toolType: ToolType, menuType: MenuSystemNamespaces) {
        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

        delete entry.active_menus[toolType][menuType + interaction.message.id];
        updateDatabase(database, entry, interaction.user.id);

        const message = await interaction.fetchReply();

        await interaction.editReply({
            content: null,
            embeds: buildUpdatedEmbed(message),
            components: buildUpdatedActionRow(message)
        });
    },
} as InteractionTask<AnyMessageComponentInteraction>;

//Code snippets
const updateDatabase = (database: DatabaseManager, entry: DatabaseJSONObject, id: string) => {
    database.updateEntry(
        id,
        {
            active_menus: {
                ...entry.active_menus,
                $replace: true
            }
        }
    );
}

const buildUpdatedActionRow = (message: Message) => {
    return message.components.map((row) =>
        new ActionRowBuilder<AnyMessageComponent>().setComponents(
            ...row.components.map((component) =>
                component instanceof ButtonComponent
                    ? component.customId === "dfeditor-close"
                        ? ButtonBuilder.from(component as ButtonComponent).setDisabled(false)
                        : ButtonBuilder.from(component as ButtonComponent).setDisabled(true)
                    : StringSelectMenuBuilder.from(component as StringSelectMenuComponent).setDisabled(true)
            )
        )
    );
}

const buildUpdatedEmbed = (message: Message) => {
    return EmbedBuilderWithData
        .fromAPIEmbed(message.embeds[0], message.embeds[1] as DatafieldEmbed)
        .setDescription(`${EmojiUtil.UrgentEmoji} This menu has been timed out.`)
        .build();
}