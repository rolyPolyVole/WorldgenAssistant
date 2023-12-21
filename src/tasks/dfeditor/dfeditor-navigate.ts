import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction } from "discord.js";
import { EmbedBuilderWithData } from "../../types/classes";
import { DatabaseJSONObject, DatafieldEmbed, EventList, InteractionTask, InteractionTaskMap, NavigationDirection, StringKeyObject } from "../../types/types";
import { getEnabledButtonMap } from "../../types/functions";
import { Bot } from "main";
import { DatabaseManager } from "database/manager";

export default {
    vertical: {
        async run(interaction, client, direction: NavigationDirection) {
            const database = client.database;
            let entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

            const location = entry.density_function.location.split(".");
            const JSONdata = JSON.parse(entry.density_function.json as string) as StringKeyObject;
            const objectAtLocation = client.objectUtil.navigateObject(JSONdata, location.slice(0, -1)?.join(".") as string);
            
            const data = {
                objectAtLocation: objectAtLocation,
                location: location,
                direction: direction,
                database: database
            };

            entry = handleVerticalNavigation(interaction, data);
            client.eventManager.emit(EventList.LOCATION_UPDATE, interaction.user.id, { navigation: false, function: true, main: true });
                
            await interaction.message.edit({
                embeds: buildEmbed(interaction, client, entry),
                components: buildActionRows(interaction, client, JSONdata, entry)
            });

            return interaction.deferUpdate();
        }
    } as InteractionTask<ButtonInteraction>,
    horizontal: {
        async run(interaction, client, direction: NavigationDirection) {
            const database = client.database;
            let entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

            const location = entry.density_function.location.split(".");
            const JSONdata = JSON.parse(entry.density_function.json as string) as StringKeyObject;
            const objectAtLocation = client.objectUtil.navigateObject(JSONdata, location?.join(".") as string);

            const data = {
                objectAtLocation: objectAtLocation,
                location: location,
                direction: direction,
                database: database
            };

            entry = handleHorizontalNavigation(interaction, data);
            client.eventManager.emit(EventList.LOCATION_UPDATE, interaction.user.id, { navigation: false, function: true, main: true });
                
            await interaction.message.edit({
                embeds: buildEmbed(interaction, client, entry),
                components: buildActionRows(interaction, client, JSONdata, entry)
            });

            return interaction.deferUpdate();
        },
    } as InteractionTask<ButtonInteraction>
} as InteractionTaskMap;

//Code Snippets
const buildActionRows = (interaction: ButtonInteraction, client: Bot, data: StringKeyObject, entry: DatabaseJSONObject) => {
    const actionRows = interaction.message.components;

    const enabledButtonMap = getEnabledButtonMap(
        client,
        data,
        entry.density_function.location
    );

    return [
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents(actionRows[0].components
            .map((c, i) => ButtonBuilder.from(c as APIButtonComponent).setDisabled(!enabledButtonMap[i]))),
        new ActionRowBuilder<ButtonBuilder>()
            .setComponents(actionRows[1].components
            .map((c, i) => ButtonBuilder.from(c as APIButtonComponent).setDisabled(!enabledButtonMap[i + 3])))
    ];
}

const buildEmbed = (interaction: ButtonInteraction, client: Bot, entry: DatabaseJSONObject) => {
    return EmbedBuilderWithData
        .fromAPIEmbed(
            interaction.message.embeds[0], 
            interaction.message.embeds[1] as DatafieldEmbed
        )
        .setFields({
            name: "You're currently in:",
            value: client.objectUtil.formatObjectPath(client, entry)
        })
        .build();
}

const handleVerticalNavigation = (
    interaction: ButtonInteraction,
    data: { 
        readonly objectAtLocation: StringKeyObject, 
        readonly location: string[], 
        readonly direction: NavigationDirection, 
        readonly database: DatabaseManager 
    }
): DatabaseJSONObject => {
    const entries = Object.entries(data.objectAtLocation);
    const index = entries.findIndex(([key]) => key === data.location.slice().pop()) + (data.direction === 1 ? -1 : 1);
    const nextKey = entries[index][0];

    const updatedEntry = data.database.updateEntry(
        interaction.user.id, 
        {
            density_function: {
                location: [...data.location?.slice(0, -1) as string[], nextKey].join(".")
            }
        } as DatabaseJSONObject
    );

    return updatedEntry as DatabaseJSONObject;
}

const handleHorizontalNavigation = (
    interaction: ButtonInteraction, 
    data: {
        readonly objectAtLocation: StringKeyObject, 
        readonly location: string[], 
        readonly direction: NavigationDirection, 
        readonly database: DatabaseManager
    }
): DatabaseJSONObject => {
    const entries = Object.entries(data.objectAtLocation ?? {});
    const nextKey = entries[0]?.[0];

    const updatedEntry = data.database.updateEntry(
        interaction.user.id,
        {
            density_function: {
                location: 
                    data.direction === 3 
                     ? [...data.location as string[] || null, nextKey].filter((path) => !!path).join(".")
                     : data.location?.slice(0, -1).join(".")
            }
        } as DatabaseJSONObject
    );

    return updatedEntry as DatabaseJSONObject;
}