import { Button, NavigationDirection } from "../../../types/types";
import navigate from "../../../tasks/dfeditor/dfeditor-navigate";

export default {
    id: "dfeditor-navigate-up",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
        
        await navigate.vertical.run(interaction, client, NavigationDirection.Up);
    }
} as Button;