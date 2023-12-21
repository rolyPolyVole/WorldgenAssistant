import {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	Snowflake,
} from "discord.js";
import { APICommand, BotTool, Button, Command, DensityFunction, Menu, Modal, Nullable } from "./types/types";
import { ObjectUtil, Util } from "./utils/util";
import chalk from "chalk";
import dotenv from "dotenv";
import { DatabaseManager } from "./database/manager";
import fs from "fs";
import { EventManager } from "./types/classes";

dotenv.config();

export class Bot extends Client<true> {
	constructor(intents?: GatewayIntentBits[], partials?: Partials[]) {
		super({
			intents: intents ?? (Object.keys(GatewayIntentBits) as unknown as GatewayIntentBits[]),
			partials: partials ?? (Object.keys(Partials) as unknown as Partials[]),
		});

		this.defaultBotToken = process.env.BOT_TOKEN as Snowflake;
		this.clientId = process.env.CLIENT_ID as Snowflake;
		this.util = new Util();
		this.objectUtil = new ObjectUtil();
		this.eventManager = new EventManager();
		this.database = new DatabaseManager(process.env.DATABASE_DIRECTORY_NAMESPACE as Snowflake);
	}

	public handleCommands!: () => Promise<void> | unknown;
	public handleEvents!: () => Promise<void> | unknown;
	public handleComponents!: () => Promise<void> | unknown;

	public async activate(token?: string): Promise<void> {
		this.util.log("Starting Program...", chalk.magenta);

    	await this.database.initialise();
		await this.handleCommands();
		await this.handleComponents();
		await this.handleEvents();
		await this.login(token || this.defaultBotToken);
	}

	public async registerHandlers(): Promise<this> {
		let client: this = this;
		client = (await import("./utils/handlers/commandHandler")).default(client) as this;
		client = (await import("./utils/handlers/eventHandler")).default(client) as this;
		client = (await import("./utils/handlers/componentHandler")).default(client) as this;
		return client as this;
	}

  	public registerTools(): this {
		const tools = JSON.parse(fs.readFileSync("config/bot/tools.json", "utf-8")) as Object;
	
    	for (const tool in tools) {
      		this.tools.push(tools[tool as keyof typeof tools] as unknown as BotTool);
    	}

		this.util.densityFunction.longestToolName = Math.max(...Object.values(tools).map((v: BotTool) => v.name.length));
    	return this;
  	}

	public registerDensityFunctions(): this {
		const operators = JSON.parse(fs.readFileSync("config/density_function/functions.json", "utf-8")) as Object;

		for (const operator in operators) {
			this.densityFunctions.push(operators[operator as keyof typeof operators] as unknown as DensityFunction)
		}

		return this;
	}

	public util: Util;
	public objectUtil: ObjectUtil;
	public database: DatabaseManager;
	public eventManager: EventManager;
	public commandArray: APICommand[] = [];
	public commands: Collection<string, Command> = new Collection();
	public buttons: Collection<string, Button> = new Collection();
	public menus: Collection<string, Menu> = new Collection();
	public modals: Collection<string, Modal> = new Collection();
	public onlineTimestamp: Nullable<BigInt> = null;
  	public tools: BotTool[] = [];
	public densityFunctions: DensityFunction[] = [];
	public defaultBotToken: string;
	public clientId: Snowflake;
}

(async () => {
	const client = await new Bot().registerTools().registerDensityFunctions().registerHandlers();
	await client.activate();
})();