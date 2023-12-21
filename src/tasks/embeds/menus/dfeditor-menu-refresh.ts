import { EmbedBuilderWithData } from "../../../types/classes";
import { AnyMessageComponentInteraction, DatafieldEmbed, InteractionTask } from "../../../types/types";


export default {
    run(interaction, client) {
        const database = client.database;
        const entry = database.getEntry(interaction.user.id);
        
        return EmbedBuilderWithData.fromAPIEmbed(interaction.message.embeds[0], interaction.message.embeds[1] as DatafieldEmbed)
            .setFields(
                {
                    name: "You're currently in:",
                    value: client.objectUtil.formatObjectPath(client, entry)
                }
            );
    },
} as InteractionTask<AnyMessageComponentInteraction>