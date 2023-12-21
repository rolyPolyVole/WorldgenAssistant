import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, bold } from "discord.js";
import { EmbedBuilderWithData, PageSystem } from "../../../types/classes";
import { Button, PageSystemNamespaces } from "../../../types/types";
import { EmbedUtil, EmojiUtil } from "../../../utils/util";
import { Bot } from "main";


export default {
    id: "dfeditor-info",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const infoPages = PageSystem.existsKey(interaction.user.id, PageSystemNamespaces.DENSITY_FUNCTION_MENU_BROWSE_INFO)
            ? PageSystem.from(
                interaction.user.id, 
                PageSystemNamespaces.DENSITY_FUNCTION_MENU_BROWSE_INFO
            ) as PageSystem<EmbedBuilderWithData>
            : new PageSystem<EmbedBuilderWithData>(
                interaction.user.id,
                PageSystemNamespaces.DENSITY_FUNCTION_MENU_BROWSE_INFO,
                1
            );

        const embeds = buildGuideEmbeds(interaction);
        infoPages.setElements(embeds);

        await interaction.reply({
            embeds: infoPages.getPageValue()[0].build(),
            components: buildActionRow(client, infoPages)
        });
    },
} as Button;

//Code snippets
const buildGuideEmbeds = (interaction: ButtonInteraction) => {
    return [
        new EmbedBuilderWithData()
            .setAuthor({ name: "Tool Guides #1 - Density Functions" })
            .setColor(EmbedUtil.TransparentColour)
            .setDescription(`> Here is a quick tutorial on how to use the density function\n> editor. This guide briefly explains the features of this tool\n> and its uses. ${EmojiUtil.DensityFunctionEmoji}\n\n*  ${EmojiUtil.WumpusEmoji} For support, join the [support server](https://discord.gg/7EF3VvjS4q)\n* ${EmojiUtil.ArrowEmoji} To start editing, press ${bold("\"Edit JSON\"")}\n`)
            .setFields(
                {
                    name: `${EmojiUtil.AddEmoji} Adding Functions`,
                    value: `Clicking ${bold("\"Add Function\"")} will prompt you with a selection of density functions. This inserts the new function and replaces existing code.`
                },
                {
                    name: `${EmojiUtil.EditingEmoji} Editing Functions`,
                    value: `Clicking ${bold("\"Edit Function\"")} will let you edit the properties of the function at your current location.`
                }
            )
            .setFooter({ text: "Made by rolyPolyVole", iconURL: EmbedUtil.MapleIcon })
            .setThumbnail(EmbedUtil.GuideIcon)
            .setTimestamp()
            .setTitle("Density Function Tutorial")

            .createDataField(EmbedBuilderWithData.defaultURL)
            .appendStringValue(interaction.user.id)
    ];
}

const buildActionRow = (client: Bot, pageSystem: PageSystem<EmbedBuilderWithData>) => {
    return [
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId("dfeditor-info-prev")
                    .setLabel("Prev")
                    .setDisabled(!pageSystem.copy().prevPage().existsPage())
                    .setEmoji(client.util.componentEmoji("1165724070336270336"))
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("display-page")
                    .setLabel(`「${pageSystem.getPageIndex() + 1}/${pageSystem.copy().getTotalPages()}」`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("dfeditor-info-next")
                    .setLabel("Next")
                    .setDisabled(!pageSystem.copy().nextPage().existsPage())
                    .setEmoji(client.util.componentEmoji("1165724045073977354"))
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("dfeditor-close")
                    .setEmoji(client.util.componentEmoji("1163975338766897224"))
                    .setStyle(ButtonStyle.Secondary)
            )
    ]
}