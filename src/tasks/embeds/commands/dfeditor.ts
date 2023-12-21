import { ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilderWithData } from "../../../types/classes";
import { InteractionTask, InteractionTaskMap } from "../../../types/types";
import { EmbedUtil } from "../../../utils/util";


export default {
    embed: {
        run(interaction, _client) {
            const embed = new EmbedBuilderWithData()
                .setAuthor({ name: "Requested by " + interaction.user.displayName, iconURL: interaction.user.displayAvatarURL()})
                .setColor(EmbedUtil.TransparentColour)
                .setDescription("> Welcome to the density function editor Homepage!\n> This tool allows you to create, edit and visualise\n> Minecraft density functions. <:developer_badge:1163983964340486155>")
                .setFields(
                    {
                        name: "Getting Started :sparkles:",
                        value: "Clicking the button below will create an empty JSON file. More info will be provided after you do so."
                    },
                    {
                        name: "Feedback <:love_letter:1163975344924131499>",
                        value: "This tool is still under development. If you find any issues or have any feedback, tell us in our [Discord](https://discord.gg/7EF3VvjS4q)."
                    },
                )
                .setFooter({ text: "Made by rolyPolyVole", iconURL: EmbedUtil.MapleIcon })
                .setThumbnail(EmbedUtil.Thumbnail)
                .setTimestamp()
                .setTitle("Density Function Editor")
                .boldPunctuation()
                
                .createDataField(EmbedBuilderWithData.defaultURL)
                .appendStringValue(interaction.user.id)
                .build();

            return embed;
        },
    } as InteractionTask<ChatInputCommandInteraction|ButtonInteraction>,

    button: {
        run(_interaction, client) {
            const startButton = new ButtonBuilder()
                .setCustomId("dfeditor-start")
                .setLabel("Start")
                .setEmoji(client.util.componentEmoji("1165719410137366528"))
                .setStyle(ButtonStyle.Primary);
            
            const loadButton = new ButtonBuilder()
                .setCustomId("dfeditor-load")
                .setLabel("Load File")
                .setEmoji(client.util.componentEmoji("1163975349642727495"))
                .setStyle(ButtonStyle.Secondary);
            
            return [startButton, loadButton];
        },
    } as InteractionTask<ChatInputCommandInteraction|ButtonInteraction>
} as InteractionTaskMap;