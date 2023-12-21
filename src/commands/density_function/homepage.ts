import { ActionRowBuilder, ButtonStyle, SlashCommandBuilder, ButtonBuilder, ChatInputCommandInteraction, bold } from "discord.js";
import { Command, ToolType } from "../../types/types";
import { EmbedBuilderWithData } from "../../types/classes";
import { EmbedUtil } from "../../utils/util";
import { Bot } from "main";

export default {
    data: new SlashCommandBuilder()
        .setName("home")
        .setDescription("The homepage for the bot"),
    async execute(interaction, client) {
        const database = client.database;

        database.existsEntry(interaction.user.id)
            ? database.updateEntry(
                interaction.user.id,
                {
                    active_menus: {
                        [ToolType.HOME]: {
                            main: interaction.token
                        }
                    }
                }
            )
            : database.createEntry(
                interaction.user.id,
                interaction.user.username,
                {
                    active_menus: {
                        [ToolType.HOME]: {
                            main: interaction.token
                        }
                    }
                }
            );

        await interaction.reply({
            embeds: buildEmbed(interaction),
            components: buildActionRow(client)
        });
    },
} as Command;

//Code snippets
const buildEmbed = (interaction: ChatInputCommandInteraction) => {
    return new EmbedBuilderWithData()
        .setTitle("Homepage")
        .setAuthor({ name: "WorldGen Tools & Utility" })
        .setColor(EmbedUtil.TransparentColour)
        .setDescription("> Welcome to the bot's homepage! This is a essentially a\n> collection of every tool and docs that we provide,\n> as well as some other misc features. <:emerald:1165725299368001627>\n\n* <:support:1165725907298816070> The support server: [Join here](https://discord.gg/7EF3VvjS4q)!\n* <:candle_cake:1163975555192979577> Join our [Minecraft Server](https://discord.gg/SjAGgJaCYc)!\n* <:donation_coffee:1163975505905725502> Buy me a [coffee](https://ko-fi.com/rolypolyvole)!")
        .setFields(
            {
                name: "Tools & Utility <:developer_badge:1163983964340486155>",
                value: `Click ${bold("\"Browse Tools\"")} to get the full list of available tools. Next, press ${bold("\"Use\"")} on the tool that you would like to use.`
            },
            {
                name: "Info & Docs  <:envelope:1163975203479638097>",
                value: `Click ${bold("\"Browse Docs\"")} to open the documentation section. More information can be found there.`
            }
        )
        .setThumbnail(EmbedUtil.HomeIcon)
        .setFooter({ text: "Made by rolyPolyVole", iconURL: EmbedUtil.MapleIcon })
        .setTimestamp()
        
        .createDataField(EmbedBuilderWithData.defaultURL)
        .appendStringValue(interaction.user.id)
        .build();
}

const buildActionRow = (client: Bot) => {
    const toolsButton = new ButtonBuilder()
        .setCustomId("home-browsetools")
        .setLabel("Browse Tools")
        .setEmoji(client.util.componentEmoji("1165724773679112363"))
        .setStyle(ButtonStyle.Secondary);
    
    const docsButton = new ButtonBuilder()
        .setCustomId("home-browsedocs")
        .setLabel("Browse Docs")
        .setEmoji(client.util.componentEmoji("1163975203479638097"))
        .setStyle(ButtonStyle.Primary);

    return [
        new ActionRowBuilder<ButtonBuilder>().setComponents(toolsButton, docsButton)
    ];
}