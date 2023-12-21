import { Button } from "../../../types/types";

export default {
    id: "dfeditor-close",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);

        return interaction.message.delete();
    },
} as Button;