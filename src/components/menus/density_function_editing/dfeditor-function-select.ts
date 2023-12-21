import {
	AnySelectMenuInteraction,
	ModalBuilder,
	TextInputStyle,
	inlineCode,
} from "discord.js";
import { DatabaseJSONObject, DensityFunction, DensityFunctionType, Menu, StringKeyObject } from "../../../types/types";
import { EmojiUtil } from "../../../utils/util";
import { Bot } from "../../../main";
import { EmbedBuilderWithData, ModalInputBuilder } from "../../../types/classes";
import { DatabaseManager } from "../../../database/manager";
import embed from "../../../tasks/embeds/menus/dfeditor-menu-refresh";

export default {
	id: "dfeditor-function-select",
	async execute(interaction, client) {
		if (!client.util.isInteractionOwner(interaction)) 
            return client.util.deny(interaction);

		const database = client.database;
		const entry = (database.getEntry(interaction.user.id) as DatabaseJSONObject).density_function as StringKeyObject;
		const location = entry.location.split(".") as string[];
		
		if (!takesDensityFunction(client, location, entry)) {
			await client.util.updateMessage(interaction);

			return interaction.reply({
				embeds: buildRejectionEmbed(client, location),
				ephemeral: true
			});
		}

		const embed = buildEmbed(interaction, client);
		const modal = buildModalHeader(interaction);
		const densityFunction = getSelectedDensityFunction(interaction.values[0], client);

		const data = {
			modal: modal,
			densityFunction: densityFunction,
			database: database
		}

		if (densityFunction.constant) {
			await handleConstantFunction(interaction, data);
		} else {
			await handleDynamicFunction(interaction, client, data)
		}

		await interaction.message.edit({
			embeds: embed
		});
	},
} as Menu;

//Code Snippets

const buildEmbed = (interaction: AnySelectMenuInteraction, client: Bot) => {
	return (embed.run(interaction, client) as EmbedBuilderWithData).build();
}

const buildRejectionEmbed = (client: Bot, location: string[]) => {
	return client.util.miniEmbed(
		`The property ${inlineCode(location.pop() as string)} does not take a density function.`,
		EmojiUtil.ClosedEmoji
	);
}

const takesDensityFunction = (client: Bot, location: string[], entry: StringKeyObject): boolean => {
	const objectAtLocation = client.objectUtil.navigateObject(
		JSON.parse(entry.json),
		location.slice(0, -1).join(".") || "@base"
	) as DensityFunction|StringKeyObject;

	if (Object.keys(objectAtLocation).length === 0) 
		return true;

	const currentProperty = getSelectedDensityFunction(objectAtLocation.type, client)
		?.properties
		?.[location.slice().pop() as string]
		?.takes;
	return currentProperty === EmojiUtil.DensityFunctionEmoji && objectAtLocation.type;
}

const buildModalHeader = (interaction: AnySelectMenuInteraction): ModalBuilder => {
	return new ModalBuilder()
		.setTitle(`Selected: ${interaction.values[0]}`)
		.setCustomId("dfeditor-function-submit");
}

const getSelectedDensityFunction = (val: string, client: Bot): DensityFunction => {
	return client.densityFunctions
        .find((df) => df.menu.value === val) as DensityFunction;
}

const handleConstantFunction = async (
	interaction: AnySelectMenuInteraction,
	data: {
		readonly modal: ModalBuilder
		readonly densityFunction: DensityFunction, 
		readonly database: DatabaseManager,
	}
) => {
	data.modal.addComponents(
        new ModalInputBuilder()
            .setCustomId("type-input")
            .setLabel("Type")
            .setValue(data.densityFunction.menu.value)
            .setRequired(true)
            .setMaxLength(1000)
            .setPlaceholder("Edit constant density function value")
            .build()
    );

	data.database.updateEntry(
		interaction.user.id,
		{
			density_function: {
				modal_value: interaction.values[0] as DensityFunctionType
			}
		}
	);

	await interaction.showModal(data.modal);
}

const handleDynamicFunction = async (
	interaction: AnySelectMenuInteraction, 
	client: Bot, 
	data: {
		readonly modal: ModalBuilder, 
		readonly densityFunction: DensityFunction, 
		readonly database: DatabaseManager
	}
) => {
	Object.values(data.densityFunction.properties).forEach((property) => {
		data.modal.addComponents(
			new ModalInputBuilder()
				.setCustomId(`${property.name}-input`)
				.setLabel(client.util.capitaliseFirst(property.name))
				.setMinLength(property.required ? 1 : 0)
				.setMaxLength(property.length ?? 1000)
				.setPlaceholder(property.placeholder ?? "")
				.setRequired(property.required)
				.setStyle(TextInputStyle.Short)
				.setValue(property.default as string ?? "")
				.build()
			)
	});

	data.database.updateEntry(
		interaction.user.id,
		{
			density_function: {
				modal_value: interaction.values[0] as DensityFunctionType
			}
		}
	);

	await interaction.showModal(data.modal);
}
