import { AttachmentBuilder, bold, messageLink } from "discord.js";
import { Button } from "../../../types/types";

export default {
	id: "dfeditor-download",
	async execute(interaction, client) {
		if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
		
		const file = new AttachmentBuilder(Buffer.from(client.database.getEntry(interaction.user.id)?.density_function.json as string))
			.setName("density_function.json")
			.setDescription("Here you go, your generated JSON file!");

		const message = await interaction.user.send({
			files: [file],
		});

		const embed = client.util.shortEmbed(
			`Here you go, ${bold(`@${interaction.user.username}`)}! Go check your [Messages](${messageLink(message.channel.id, message.id)})!`,
			false
		);

		await interaction.reply({
			embeds: [embed],
		});
	},
} as Button;
