import {
	AnySelectMenuInteraction,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ChannelSelectMenuBuilder,
	ChatInputCommandInteraction,
	ClientEvents,
	ContextMenuCommandBuilder,
	Embed,
	MentionableSelectMenuBuilder,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	RoleSelectMenuBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	Snowflake,
	StringSelectMenuBuilder,
	UserContextMenuCommandInteraction,
	UserSelectMenuBuilder,
} from "discord.js";
import { Bot } from "../main";

/*
*
* Types
*
*/

//Discord API
export type AnyInteraction =
	| ChatInputCommandInteraction
	| ButtonInteraction
	| ModalSubmitInteraction
	| AnySelectMenuInteraction
	| MessageContextMenuCommandInteraction
	| UserContextMenuCommandInteraction
	| AutocompleteInteraction

export type AnyMessageComponentInteraction =
	| ButtonInteraction
	| AnySelectMenuInteraction

export type AnyMessageComponent = ButtonBuilder|StringSelectMenuBuilder|RoleSelectMenuBuilder|UserSelectMenuBuilder|ChannelSelectMenuBuilder|MentionableSelectMenuBuilder;

export type Command = {
	readonly data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	readonly description?: string;
	execute(
		interaction: ChatInputCommandInteraction,
		client: Bot
	): Promise<unknown>|unknown;
};

export type APICommand =
    | SlashCommandBuilder
    | ContextMenuCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type Event = {
	readonly custom: false;
	readonly once: boolean;
	readonly type: keyof ClientEvents;
	execute(
		client: Bot,
		...args: ClientEvents[keyof ClientEvents]
	): Promise<unknown>;
};

export type CustomEvent = {
	readonly custom: true;
	readonly once: boolean;
	readonly type: keyof CustomEvents;
	execute(
		client: Bot,
		...args: CustomEvents[keyof CustomEvents]
	): Promise<unknown>
}

export type AnyEvent = Event|CustomEvent;

export type Button = {
	readonly id: string;
	execute(interaction: ButtonInteraction, client: Bot): Promise<unknown>;
};

export type Menu = {
	readonly id: string;
	execute(
		interaction: AnySelectMenuInteraction,
		client: Bot
	): Promise<unknown>;
};

export type Modal = {
	readonly id: string;
	execute(interaction: ModalSubmitInteraction, client: Bot): Promise<unknown>;
};

//Interaction Tasks
export type InteractionTask<InteractionType = AnyInteraction> = {
	run(
		interaction: InteractionType,
		client: Bot,
		...args: any[]
	): Promise<unknown>|unknown
}

export type InteractionTaskMap = {
	readonly [key: string]: InteractionTask<AnyInteraction>
}

//Database
export type DatabaseJSONObject = {
	density_function: {
		json: string,
		location: string,
		modal_value: Nullable<DensityFunctionType>
	};
	active_menus: {
		[key: string]: {
			main: string,
			[key: Snowflake]: string
		}
	}
    [key: string]: JSONAllowed;
};

export type DatabaseUpdateObject = Record<
	keyof DatabaseJSONObject|"$replace", 
	JSONAllowed
>;

//Embed Builder
export type DatafieldEmbed = Embed & {
	readonly title: "DATAFIELD_EMBED";
	readonly url: string;
}

export type ProfileMapObject = {
	[key: Snowflake]: string;
};

//Objects & JSON
export type JSONAllowed =
  | null
  | string
  | number
  | boolean
  | JSONAllowed[]
  | { [key: string]: JSONAllowed };

export type BotTool = {
    readonly name: string;
    readonly enabled: boolean;
    readonly beta: boolean;
}

export type DensityFunction = {
	readonly [key: string]: any,
	readonly constant: boolean
	readonly menu: {
		readonly label: string;
		readonly description: string|undefined;
		readonly value: string;
		readonly emoji: string|undefined;
	};
	readonly properties: {
		readonly [key: string]: {
			readonly name: string,
			readonly placeholder: string,
			readonly required: boolean,
			readonly length: number,
			readonly default: string,
			readonly takes: string
		}
	};
}

//Utility
export type Nullable<T> = T|null;


/*
*
* Enumerators
*
*/

//General
export enum ToolType {
	HOME = "home",
	DENSITY_FUNCTION_EDITOR = "density_function_editor",
	SPLINE_EDITOR = "spline_editor",
	NOISE_EDITOR = "noise_editor",
	HEX_UTIL = "hex_util"
}


//Density Function
export enum DensityFunctionType {
	ABS = "minecraft:abs",
	ADD = "minecraft:add",
	BEARDIFIER = "minecraft:beardifier",
	BLEND_ALPHA = "minecraft:blend_alpha",
	BLEND_DENSITY = "minecraft:blend_density",
	BLEND_OFFSET = "minecraft:blend_offset",
	CACHE_2D = "minecraft:cache_2d",
	CACHE_ALL_IN_CELL = "minecraft:cache_all_in_cell",
	CACHE_ONCE = "minecraft:cache_once",
	CLAMP = "minecraft:clamp",
	CONSTANT = "minecraft:constant",
	CUBE = "minecraft:cube",
	END_ISLANDS = "minecraft:end_islands",
	FLAT_CACHE = "minecraft:flat_cache",
	HALF_NEGATIVE = "minecraft:half_negative",
	INTERPOLATED = "minecraft:interpolated",
	MAX = "minecraft:max",
	MIN = "minecraft:min",
	MUL = "minecraft:mul",
	NOISE = "minecraft:noise",
	OLD_BLENDED_NOISE = "minecraft:old_blended_noise",
	QUARTER_NEGATIVE = "minecraft:quarter_negative",
	RANGE_CHOICE = "minecraft:range_choice",
	SHIFT = "minecraft:shift",
	SHIFT_A = "minecraft:shift_a",
	SHIFT_B = "minecraft:shift_b",
	SHIFTED_NOISE = "minecraft:shifted_noise",
	SPLINE = "minecraft:spline",
	SQUARE = "minecraft:square",
	WEIRD_SCALED_SAMPLER = "minecraft:weird_scaled_sampler",
	Y_CLAMPED_GRADIENT = "minecraft:y_clamped_gradient"
};

//Interaction Tasks

/**
 * Up = 1
 * 
 * Down = 2
 * 
 * In = 3
 * 
 * Out = 4
 */
export enum NavigationDirection {
	Up = 1,
	Down = 2,
	In = 3,
	Out = 4
}

//Paging System
export enum PageSystemNamespaces {
	BROWSE_TOOLS = "home_browse_tools_id=",
	BROWSE_OPERATORS = "home_browse_operators_id=",
	DENSITY_FUNCTION_MENU_BROWSE_INFO = "density_function_menu_browse_info_id="
}

//Single-Menu System
export enum MenuSystemNamespaces {
	HOME_BROWSE_TOOLS = "home_browse_tools_id=",
	
	DENSITY_FUNCTION_MENU_EDIT = "density_function_menu_edit_id=",
	DENSITY_FUNCTION_MENU_INFO = "density_function_menu_info_id=",

	DENSITY_FUNCTION_OPERATOR_ADD = "density_function_operator_add_id=",
	DENSITY_FUNCTION_OPERATOR_EDIT = "density_function_operator_navigate_id=",
	DENSITY_FUNCTION_OPERATOR_NAVIGATE = "density_function_operator_navigate_id="
}

//Custom Events
export enum EventList {
	LOCATION_UPDATE = "densityFunctionLocationUpdate"
}

/*
*
* Interfaces
*
*/

export interface CustomEvents {
	densityFunctionLocationUpdate: [user: Snowflake, update: { navigation: boolean, function: boolean, main: boolean }];
}

//Utility
export interface StringKeyObject {
	[key: string]: any
}