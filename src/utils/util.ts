import { Chalk } from "chalk";
import {
	APIMessageComponentEmoji,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionWebhook,
	Message,
	MessageComponentInteraction,
	Snowflake,
	bold,
	inlineCode} from "discord.js";
import { EmbedBuilderWithData, EmbedBuilderWithUtil, TimeLogger } from "../types/classes";
import { AnyMessageComponentInteraction, DatabaseJSONObject, DensityFunction, MenuSystemNamespaces, Nullable, StringKeyObject, ToolType } from "../types/types";
import { Bot } from "../main";

/**
 * Utility to fill embed values
 */
export enum EmbedUtil {
	/**
	 * Transparent stripe colour
	 */
	TransparentColour = "#2b2d31",
	/**
	 * JSON icon thumbnail
	 */
	Thumbnail = "https://cdn.discordapp.com/emojis/1163975647912271993.png?size=160&quality=lossless",
	/**
	 * Info footer icon
	 */
	InfoIcon = "https://cdn.discordapp.com/emojis/1165718669582676030.png?size=64&quality=lossless",
	/**
	 * Homepage icon
	 */
	HomeIcon = "https://cdn.discordapp.com/emojis/1163980339979489370.png?size=160&quality=lossless",
	/**
	 * Computer icon
	 */
	CodingIcon = "https://cdn.discordapp.com/emojis/1164957585347199098.png?size=160&quality=lossless",
	/**
	 * Maple leaf icon
	 */
	MapleIcon = "https://cdn.discordapp.com/emojis/1163975650999283722.png?size=160&quality=lossless",
	/**
	 * Developer Icon
	 */
	DevIcon = "https://cdn.discordapp.com/emojis/1163983964340486155.png?size=160&quality=lossless",
	/**
	 * Guide Icon
	 */
	GuideIcon = "https://cdn.discordapp.com/emojis/1166111530148958299.png?size=160&quality=lossless",
	/**
	 * Emerald Icon
	 */
	EmeraldIcon = "https://cdn.discordapp.com/emojis/1165725299368001627.png?size=160&quality=lossless"
};

/**
 * List of formatted emoji
 */
export enum EmojiUtil {
	/**
	 * Add Emoji
	 */
	AddEmoji = "<:add:1163975336493584404>",	
	/**
	 * Editor Emoji
	 */
	EditingEmoji = "<:editing:1163975340201353326>",
	/**
	 * Candle Cake Emoji
	 */
	CandleCakeEmoji = "<:candle_cake:1163975555192979577>",
	/**
	 * Emerald Emoji
	 */
	EmeraldEmoji = "<:emerald:1165725299368001627>",
	/**
	 * Envelope Emoji
	 */
	EnvelopeEmoji = "<:envelope:1163975203479638097>",
	/**
	 * Feedback Emoji
	 */
	FeedbackEmoji = "<:feedback:1163975344924131499>",
	/**
	 * Join Arrow Emoji
	 */
	ArrowEmoji = "<:join_arrow:1165719410137366528>",
	/**
	 * JSON Icon Emoji
	 */
	JSONEmoji = "<:json_icon:1163975647912271993>",
	/**
	 * Success Emoji
	 */
	SuccessEmoji = "<a:success:1165734125047652367>",
	/**
	 * Navigation Emoji
	 */
	NavigationEmoji = "<:route:1163975347725930547>",
	/**
	 * Wumpus Emoji
	 */
	WumpusEmoji = "<:support:1165725907298816070>",
	/**
	 * Donation Coffee Emoji
	 */
	CoffeeEmoji = "<:donation_coffee:1163975505905725502>",
	/**
	 * Developer Badge Emoji
	 */
	DeveloperEmoji = "<:developer_badge:1163983964340486155>",
	/**
	 * Label Emoji
	 */
	LabelEmoji = "<:label:1165421705427177523>",
	/**
	 * Tools Emoji
	 */
	ToolEmoji = "<:blurple_tools:1167609249610862733>",
	/**
	 * Typescript Emoji
	 */
	TypescriptEmoji = "<:typescript_icon:1163975677771526196>",
	/**
	 * Density Function Emoji
	 */
	DensityFunctionEmoji = "<:density_function:1168178623363153960>",
	/**
	 * Eye of Ender Emoji
	 */
	EnderEyeEmoji = "<:ender_eye:1165701513675546806>",
	/**
	 * Closed Emoji
	 */
	ClosedEmoji = "<:close:1163975338766897224>",
	/**
	 * Task Emoji
	 */
	TaskEmoji = "<:task:1163983438488014888>",
	/**
	 * Urgent Emoji
	 */
	UrgentEmoji = "<:urgent:1164932584615190568>"
}

/**
 * Class with many utility methods. For easy access, the util class has been assigned to \<Bot\>.util
 */
export class Util {
	constructor() {}

	//Util properties
	public readonly densityFunction = {
		longestToolName: 0,
	};

	/**
	 * Logs a message to the console with a chalk decoration.
	 * @param msg The message.
	 * @param chalk The chalk decoration.
	 */
	public log(msg: string, chalk: Chalk): void {
		console.log(chalk(msg));
	}

	public getTimeLogger(file: string): TimeLogger {
		return new TimeLogger(file);
	}

	public shortEmbed(
		msg: string,
		data?: boolean,
		options?: { boldPunctuation: boolean }
	): EmbedBuilder | EmbedBuilderWithData {
		const embed = new EmbedBuilderWithData()
			.setDescription(msg)
			.setColor(EmbedUtil.TransparentColour)
			.setFooter({
				text: "Have fun developing!",
				iconURL: EmbedUtil.DevIcon,
			})
			.boldPunctuation(options?.boldPunctuation)
			.setTimestamp();

		return data ? embed : (embed as EmbedBuilderWithUtil);
	}

	public miniEmbed(msg: string, emoji: EmojiUtil|string = "", format: string = "") {
		return [
			new EmbedBuilder()
			.setColor(EmbedUtil.TransparentColour)
			.setDescription(`${format} ${emoji} ${msg}`)
		];
	}

	public componentEmoji(
		emoji: string,
		animated: boolean = false
	): APIMessageComponentEmoji {
		return {
			name: "_" as string,
			id: emoji as Snowflake,
			animated: animated,
		} as APIMessageComponentEmoji;
	}

	public isInteractionOwner(interaction: AnyMessageComponentInteraction): boolean {
		return EmbedBuilderWithData.retrieveStringValue(interaction.message.embeds[1], 0) === interaction.user.id;
	}

	public async deny(
		interaction: ChatInputCommandInteraction | MessageComponentInteraction
	): Promise<void> {
		interaction.replied
			? await interaction.followUp({
					content: "This menu belongs to someone else.",
					ephemeral: true,
			  })
			: await interaction.reply({
					content: "This menu belongs to someone else.",
					ephemeral: true,
			});
			
		if (interaction.isAnySelectMenu()) {
			await interaction.message.edit({});
		}
	}

	public capitaliseFirst(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	public parseIntString(str: string): string|number {
		return /^-?\d+$/.test(str) ? Number.parseInt(str) : str;
	}

	public nullString(input: any): string {
		return typeof input === "string" ? input : "";
	}

	public async updateMessage(interaction: AnyMessageComponentInteraction): Promise<Message<boolean>> {
		return await interaction.message.edit({});
	}

	public async killPreviousMenu(interaction: AnyMessageComponentInteraction, client: Bot, namespace: MenuSystemNamespaces, menuType: ToolType): Promise<boolean> {
		const database = client.database;
		const entry = database.getEntry(interaction.user.id) as DatabaseJSONObject;

		const key = namespace + interaction.message.id;
		const interactionToken = entry?.active_menus[menuType]?.[key];

		for (const k in entry.active_menus[menuType]) {
			if (k.startsWith(namespace) && k !== key) {
				this.deleteInteraction(client, entry.active_menus[menuType][k]);
			}
			if (k.startsWith(namespace)) {
				delete entry.active_menus[menuType][k];
			}
		}

		database.updateEntry(
			interaction.user.id,
			{
				active_menus: {
					[menuType]: {
						...entry.active_menus[menuType],
						$replace: true
					}
				}
			}
		);

		if (!interactionToken) return false;

		this.deleteInteraction(client, interactionToken);
		return true;
	}

	public async deleteInteraction(client: Bot, token: Snowflake): Promise<boolean|void> {
		if (!token) return;

		try {
			const response = new InteractionWebhook(client, client.user.id, token);
			await response.deleteMessage("@original");
		} catch {};

		return true;
	}
};

/**
 * Utility class for objects, json and density functions
 */
export class ObjectUtil {
	constructor () {};

	/**
	 * Navigates to a part of an object based on the given path and replaces that property with the provided replacement.
	 * @param {StringKeyObject} obj The object to navigate and replace
	 * @param {string} path The path, a list of keys seperated by a dot
	 * @param {any} replacement The value to insert at the given path
	 * @param {string} splitter Defaults to a dot, the splitter used to split your path string
	 * @returns {StringKeyObject} The updated object
	 */
	public navigateObjectAndReplace(
		obj: StringKeyObject,
		path: string|"@base",
		replacement: any|"@original",
		splitter: string = "."
	): StringKeyObject {
		const keys = path.split(splitter);
		let currentObj = obj;
		let lastKey = keys.pop();

		for (const key of keys) {
			if (!currentObj || typeof currentObj !== "object" || !(key in currentObj)) {
				return obj;
			}
			currentObj = currentObj[key];
		}

		if (replacement === "@original") return currentObj;
		if (path === "@base") return replacement;

		if (currentObj && typeof currentObj === "object" && lastKey) {
			currentObj[lastKey] = replacement;
		}

		return obj;
	}

	public navigateObject(
		obj: StringKeyObject,
		path: string|"@base",
		splitter: string = "."
	): any {
		if (path === "@base") return obj;

		const keys = path.split(splitter);
		let currentObj = obj;

		for (const key of keys) {
			if (!currentObj || typeof currentObj !== "object" || !(key in currentObj)) {
				return obj;
			}
			currentObj = currentObj[key];
		}

		return currentObj;
	}

	public formatObjectPath(client: Bot, entry: Nullable<DatabaseJSONObject>): string {
		if (!entry?.density_function.location) return EmojiUtil.EditingEmoji + " Root Object";

		const JSONdata = JSON.parse(entry.density_function.json as string) as StringKeyObject;

		const keys = entry.density_function.location
			.split(".")
			.map((key, index, arr) => {
				const data = this.navigateObject(
					JSONdata,
					arr.slice(0, index).join(".")
				) as StringKeyObject;

				const df = client.densityFunctions.find((df) => df.menu.value === data.type) as DensityFunction;
				const type = df.menu.value.replace("minecraft:", "");
				let str = `${bold(type)}${inlineCode("::")}**${key}`;

				if (index === arr.length - 1) {
					const emoji = df?.properties.hasOwnProperty(key) ? df.properties[key].takes : key === "type" ? EmojiUtil.TypescriptEmoji : EmojiUtil.EnderEyeEmoji;
					str += `:** ${emoji}`;
				} else {
					str += "**";
				}

				return str;
			});

		const path = ["", ...keys];
		return EmojiUtil.EditingEmoji + " Root Object" + path.join(" <:join_arrow:1165719410137366528> ");
	}

	public nullToUndefined(obj: StringKeyObject) {
		const result = {} as typeof obj;

		Object.keys(obj).forEach((k) => {
			result[k] = obj[k] ?? undefined;
		});

		return result;
	}

	public isEmptyObject(obj: StringKeyObject): boolean {
		return obj
			&& typeof obj === "object"
			&& obj.constructor === Object
			&& Object.keys(obj).length === 0;
	}
};
