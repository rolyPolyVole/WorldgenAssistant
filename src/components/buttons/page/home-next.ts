import { APIButtonComponent, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { Button, PageSystemNamespaces } from "../../../types/types";
import { EmbedBuilderWithData, PageSystem } from "../../../types/classes";


export default {
    id: "home-next",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const user = EmbedBuilderWithData.retrieveStringValue(
            interaction.message.embeds[1],
            0
        );

        const components = interaction.message.components;
        const toolPages = (PageSystem.from(user as string, PageSystemNamespaces.BROWSE_TOOLS) as PageSystem<ActionRowBuilder<ButtonBuilder>>).nextPage();
        const buttonArray = components[components.length - 1].components.map(button => ButtonBuilder.from(button as APIButtonComponent));
        
        buttonArray[0].setDisabled(!toolPages.copy().prevPage().existsPage());
        buttonArray[1].setLabel(`「${toolPages.getPageIndex() + 1}/${toolPages.getTotalPages()}」`);
        buttonArray[2].setDisabled(!toolPages.copy().nextPage().existsPage());

        const actionRow = toolPages.getPageValue().slice() as ActionRowBuilder<ButtonBuilder>[];
        actionRow.push(new ActionRowBuilder<ButtonBuilder>().setComponents(...buttonArray));

        await interaction.message.edit({
            components: actionRow
        });

        return interaction.deferUpdate();
    },
} as Button;