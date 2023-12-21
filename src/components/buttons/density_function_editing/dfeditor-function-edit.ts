import { ButtonInteraction, ModalBuilder, TextInputStyle, inlineCode } from "discord.js";
import { Bot } from "main";
import { ModalInputBuilder } from "../../../types/classes";
import { Button, DatabaseJSONObject, DensityFunction, StringKeyObject } from "../../../types/types";
import { EmojiUtil } from "../../../utils/util";


export default {
    id: "dfeditor-function-edit",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;
        const location = entry.density_function.location;

        const objectAtLocation = client.objectUtil.navigateObject(
            JSON.parse(entry.density_function.json),
            location
        ) as StringKeyObject;

        if (!(objectAtLocation instanceof Object)) {
            return interaction.reply({
                ephemeral: true,
                embeds: buildEmbed(client, location)
            });
        }

        const densityFunction = client.densityFunctions.find(
            (df) => df.menu.value === objectAtLocation?.type
        ) as DensityFunction;

        database.updateEntry(
            interaction.user.id,
            {
                density_function: {
                    modal_value: densityFunction.menu.value
                }
            }
        );

        if (densityFunction.constant) {
            await handleConstantFunction(interaction, densityFunction);
        } else {
            await handleDynamicFunction(interaction, client, densityFunction);
        };
    },
} as Button;

//Code Snippets
const handleConstantFunction = async (interaction: ButtonInteraction, densityFunction: DensityFunction) => {
    await interaction.showModal(buildConstantModal(densityFunction));
}

const handleDynamicFunction = async (interaction: ButtonInteraction, client: Bot, densityFunction: DensityFunction) => {
    await interaction.showModal(buildDynamicModal(client, densityFunction));
}

const buildConstantModal = (densityFunction: DensityFunction) => {
    const modal = buildModalHeader(densityFunction.menu.value);

    modal.addComponents(
        new ModalInputBuilder()
            .setCustomId("type-input")
            .setLabel("Type")
            .setValue(densityFunction.menu.value)
            .setRequired(true)
            .setMaxLength(1000)
            .setPlaceholder("Edit constant density function value")
            .build()
    );
    
    return modal;
}

const buildDynamicModal = (client: Bot, densityFunction: DensityFunction) => {
    const modal = buildModalHeader(densityFunction.menu.value);

    Object.values(densityFunction.properties).forEach((property) => {
		modal.addComponents(
			new ModalInputBuilder()
                .setCustomId(`${property.name}-input`)
                .setLabel(client.util.capitaliseFirst(property.name))
                .setMaxLength(Math.max(1000, property.length))
                .setPlaceholder(client.util.nullString(property.placeholder))
                .setRequired(property.required)
                .setStyle(TextInputStyle.Short)
                .setValue(client.util.nullString(property.default))
                .build()
		);
	});

    return modal;
}

const buildModalHeader = (val: string) => {
    return new ModalBuilder()
        .setTitle(`Selected: ${val}`)
        .setCustomId("dfeditor-function-submit");
}

const buildEmbed = (client: Bot, location: string) => {
    return client.util.miniEmbed(
        `The property ${inlineCode(location.split(".").pop() as string)} does not have a density function value.`, 
        EmojiUtil.ClosedEmoji
    )
}