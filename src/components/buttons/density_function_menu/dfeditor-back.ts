import { Button } from "../../../types/types";

import {
	ButtonBuilder,
    ActionRowBuilder,
	EmbedBuilder,
} from "discord.js";

export default {
	id: "dfeditor-back",
	async execute(interaction, client) {
		if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
		
        //optimise
		const embed = await (await import("../../../tasks/embeds/commands/dfeditor")).default.embed.run(interaction, client) as EmbedBuilder[];
		const button = await (await import("../../../tasks/embeds/commands/dfeditor")).default.button.run(interaction, client) as ButtonBuilder;

        await interaction.message.edit({
            embeds: embed,
            components: [new ActionRowBuilder<ButtonBuilder>().setComponents(button)]
        });

        return interaction.deferUpdate();
	},
} as Button;
