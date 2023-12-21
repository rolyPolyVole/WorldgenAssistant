import { APIButtonComponent, APISelectMenuComponent, ActionRowBuilder, ButtonBuilder, SelectMenuComponentOptionData, StringSelectMenuBuilder } from "discord.js";
import { Button, PageSystemNamespaces } from "../../../types/types";
import { EmbedBuilderWithData, PageSystem } from "../../../types/classes";


export default {
    id: "dfeditor-function-prev",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const user = EmbedBuilderWithData.retrieveStringValue(
            interaction.message.embeds[1],
            0
        );

        const components = interaction.message.components;
        const menuPages = (PageSystem.from(user as string, PageSystemNamespaces.BROWSE_OPERATORS) as PageSystem<SelectMenuComponentOptionData>).prevPage();
        const buttonArray = components[components.length - 1].components.map(button => ButtonBuilder.from(button as APIButtonComponent));
        
        buttonArray[0].setDisabled(!menuPages.copy().prevPage().existsPage());
        buttonArray[1].setLabel(`「${menuPages.getPageIndex() + 1}/${menuPages.getTotalPages()}」`);
        buttonArray[2].setDisabled(!menuPages.copy().nextPage().existsPage());

        const menuOptions = menuPages.getPageValue() as SelectMenuComponentOptionData[];

        await interaction.message.edit({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .setComponents(
                        StringSelectMenuBuilder
                            .from(components[0].components[0].data as APISelectMenuComponent)
                            .setOptions(menuOptions)
                    ),
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(buttonArray)
            ]
        });

        return interaction.deferUpdate();
    },
} as Button;