import { Bot } from "main";
import { Button, DatabaseUpdateObject, EventList } from "../../../types/types";
import { EmojiUtil } from "../../../utils/util";


export default {
    id: "dfeditor-clear",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
        
        client.database.updateEntry(
            interaction.user.id,
            {
                density_function: {
                    json: "{}",
                    location: "",
                    modal_value: null
                }
            } as DatabaseUpdateObject
        );

        client.eventManager.emit(EventList.LOCATION_UPDATE, interaction.user.id, { navigation: true, function: true, main: true });

        await interaction.reply({
            embeds: buildEmbed(client),
            ephemeral: true
        });
    },
} as Button;

//Code snippets
const buildEmbed = (client: Bot) => {
    return client.util.miniEmbed(
        "Your density function file has been cleared!",
        EmojiUtil.SuccessEmoji
    );
}