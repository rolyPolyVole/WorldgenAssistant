import { Button, NavigationDirection } from "../../../types/types";
import navigate from "../../../tasks/dfeditor/dfeditor-navigate";

export default {
    id: "dfeditor-navigate-in",
    async execute(interaction, client) {
        if (!client.util.isInteractionOwner(interaction))
            return client.util.deny(interaction);
        
        await navigate.horizontal.run(interaction, client, NavigationDirection.In);
    }
} as Button;