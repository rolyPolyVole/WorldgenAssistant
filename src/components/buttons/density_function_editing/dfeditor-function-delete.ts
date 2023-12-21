import { inlineCode } from "discord.js";
import { Bot } from "main";
import { Button, DatabaseJSONObject, EventList } from "../../../types/types";
import { EmojiUtil } from "../../../utils/util";

export default {
    id: "dfeditor-function-delete",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
        
        const database = client.database;
        const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

        const JSONdata = JSON.parse(entry.density_function.json);
        const location = entry.density_function.location;
        const lastKey = location.split(".").pop();
        const valueAtLocation = client.objectUtil.navigateObject(JSONdata, location || "@base");

        if (valueAtLocation === null || client.objectUtil.isEmptyObject(valueAtLocation) || lastKey === "type")
            return interaction.reply({
                embeds: buildRejectionEmbed(client, location, lastKey === "type"),
                ephemeral: true
            });

        const updatedJSON = client.objectUtil.navigateObjectAndReplace(JSONdata, location || "@base", null) ?? {};
        database.updateEntry(
            interaction.user.id,
            {
                density_function: {
                    json: JSON.stringify(updatedJSON, null, 4)
                }
            }
        );

        client.eventManager.emit(EventList.LOCATION_UPDATE, interaction.user.id, { navigation: true, function: false, main: true });

        return interaction.reply({
            embeds: buildEmbed(client),
            ephemeral: true
        });
    },
} as Button;

//Code Snippets
const buildRejectionEmbed = (client: Bot, location: string, nonDeletableKey: boolean) => {
    return client.util.miniEmbed(
        `The property ${inlineCode(location.split(".").pop() || "Root Object")} ${nonDeletableKey ? "can't be deleted" : "doesn't have a value yet"}.`, 
        EmojiUtil.ClosedEmoji
    )
}

const buildEmbed = (client: Bot) => {
    return client.util.miniEmbed(
        "Your file has been updated.",
        EmojiUtil.SuccessEmoji
    );
}