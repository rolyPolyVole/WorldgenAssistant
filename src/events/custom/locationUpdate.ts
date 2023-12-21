import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, InteractionWebhook, Message, codeBlock } from "discord.js";
import { CustomEvent, DatabaseJSONObject, DatafieldEmbed, MenuSystemNamespaces, StringKeyObject, ToolType } from "../../types/types";
import { EmbedBuilderWithData } from "../../types/classes";
import { Bot } from "main";
import { getCenteredObjectSnippet, getEnabledButtonMap } from "../../types/functions";


export default {
    type: "densityFunctionLocationUpdate",
    custom: true,
    once: false,
    async execute(client, userId: string, update: { readonly navigation: boolean, readonly function: boolean, readonly main: boolean }) {
        const database = client.database;
        const entry = database.getEntry(userId) as DatabaseJSONObject;

        handleMainMenus(client, entry, update);
        handleNavigationMenus(client, entry, update);
        handleFunctionEditingMenus(client, entry, update);
    },
} as CustomEvent;

//Code Snippets
const handleNavigationMenus = async (client: Bot, entry: DatabaseJSONObject, update: StringKeyObject) => {
    const navigationMenuToken = findActiveMenu(entry, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_NAVIGATE);

    if (!(navigationMenuToken && update.navigation)) return;

    try {
        const interactionResponse = new InteractionWebhook(client, client.user.id, navigationMenuToken);
        const message = await interactionResponse.fetchMessage("@original");

        await interactionResponse.editMessage(
            "@original",
            {
                content: message.content,
                embeds: buildUpdatedEmbed(client, message, entry).build(),
                components: buildActionRows(client, message, entry)
            }
        );
    } catch {};
}

const handleFunctionEditingMenus = async (client: Bot, entry: DatabaseJSONObject, update: StringKeyObject) => {
    const functionMenuToken = findActiveMenu(entry, MenuSystemNamespaces.DENSITY_FUNCTION_OPERATOR_ADD);

    if (!(functionMenuToken && update.function)) return;

    try {
        const interactionResponse = new InteractionWebhook(client, client.user.id, functionMenuToken);
        const message = await interactionResponse.fetchMessage("@original");

        await interactionResponse.editMessage(
            "@original",
            {
                embeds: buildUpdatedEmbed(client, message, entry).build()
            }
        );
    } catch {};
}

const handleMainMenus = async (client: Bot, entry: DatabaseJSONObject, update: StringKeyObject) => {
    const menuToken = entry.active_menus?.[ToolType.DENSITY_FUNCTION_EDITOR]?.main;

    if (!(menuToken && update.main)) return;

    try {
        const interactionResponse = new InteractionWebhook(client, client.user.id, menuToken)
        const message = await interactionResponse.fetchMessage("@original");

        const embed = buildUpdatedEmbed(client, message, entry)
            .setDescription(
                codeBlock(
                    "json",
                    getCenteredObjectSnippet(
                        entry.density_function.json as string, 
                        entry.density_function.location as string
                    )
                )
            )
            .build();

        await interactionResponse.editMessage(
            "@original",
            {
                embeds: embed
            }
        )
    } catch (e) { console.log(e) };
}


const buildUpdatedEmbed = (client: Bot, message: Message, entry: DatabaseJSONObject) => {
    return EmbedBuilderWithData
        .fromAPIEmbed(
            message.embeds[0],
            message.embeds[1] as DatafieldEmbed
        )
        .setFields(
            {
                name: "You're currently in:",
                value: client.objectUtil.formatObjectPath(client, entry)
            }
        );
}

const buildActionRows = (client: Bot, message: Message, entry: DatabaseJSONObject) => {
    const actionRows = message.components;
    const JSONdata = JSON.parse(entry.density_function.json);

    const enabledButtonMap = getEnabledButtonMap(
        client,
        JSONdata,
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

const findActiveMenu = (entry: DatabaseJSONObject, namespace: MenuSystemNamespaces) => {
    const key = Object
        .keys(entry.active_menus[ToolType.DENSITY_FUNCTION_EDITOR])
        .find((id) => id.startsWith(namespace));
    return key ? entry.active_menus[ToolType.DENSITY_FUNCTION_EDITOR][key] : undefined;
}