import { ModalSubmitInteraction } from "discord.js";
import { DatabaseJSONObject, DensityFunction, Modal, StringKeyObject } from "../../../types/types";
import { EmojiUtil } from "../../../utils/util";
import { DatabaseManager } from "database/manager";
import { Bot } from "main";


export default {
    id: "dfeditor-function-edit-modal",
    async execute(interaction, client) {
        const database = client.database;
        updateDatabase(interaction, client, database);

        return interaction.reply({
            embeds: buildEmbed(client),
            ephemeral: true
        });
    },
} as Modal;

//Code Snippets
const updateDatabase = (interaction: ModalSubmitInteraction, client: Bot, database: DatabaseManager) => {
    const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

    const functionType = entry.density_function.modal_value as string;
    const densityFunction = client.densityFunctions.find((df) => df.menu.label === functionType) as DensityFunction;

    if (densityFunction.constant) {
        handleConstantFunction(interaction, client, database);
    } else {
        const data = { 
            args: densityFunction.properties, 
            functionType: functionType, 
            database: database 
        };

        handleDynamicFunction(interaction, client, data);
    }
}

const handleDynamicFunction = (
    interaction: ModalSubmitInteraction, 
    client: Bot, 
    data: {
        readonly args: StringKeyObject,
        readonly functionType: string,
        readonly database: DatabaseManager
    }
) => {
    const entry = data.database.getEntry(interaction.user.id) as DatabaseJSONObject;
    const JSONdata = { type: data.functionType } as StringKeyObject;

    const { parseIntString } = client.util;

    Object.keys(data.args).forEach((arg) => {
        if (arg === "xz/y_scale") {
            JSONdata.xz_scale = parseIntString(interaction.fields.getTextInputValue(`${data.args[arg].name}-input`).split(" ")[0] || "");
            JSONdata.y_scale = parseIntString(interaction.fields.getTextInputValue(`${data.args[arg].name}-input`).split(" ")[1] || "");
            return;
        };
        JSONdata[arg] = parseIntString(interaction.fields.getTextInputValue(`${data.args[arg].name}-input`)) || null;
    });

    const updatedJSON = client.objectUtil.navigateObjectAndReplace(
        JSON.parse(entry.density_function.json), 
        entry.density_function.location || "@base",
        JSONdata
    );

    data.database.updateEntry(
        interaction.user.id,
        {
            density_function: {
                json: JSON.stringify(updatedJSON, null, 4)
            }
        }
    );
}

const handleConstantFunction = (interaction: ModalSubmitInteraction, client: Bot, database: DatabaseManager) => {
    const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

    const type = interaction.fields.getTextInputValue("type-input");
    const JSONdata = { type: type } as StringKeyObject;

    const updatedJSON = client.objectUtil.navigateObjectAndReplace(
        JSON.parse(entry.density_function.json),
        entry.density_function.location || "@base",
        JSONdata
    );

    database.updateEntry(
        interaction.user.id,
        {
            density_function: {
                json: JSON.stringify(updatedJSON, null, 4)
            }
        }
    );
}

const buildEmbed = (client: Bot) => {
    return client.util.miniEmbed(
        "Your file has been updated.",
        EmojiUtil.SuccessEmoji
    );
}