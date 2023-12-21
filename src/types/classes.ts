import { APIEmbed, APIEmbedField, ActionRowBuilder, Awaitable, Embed, EmbedBuilder, EmbedData, TextInputBuilder } from "discord.js";
import { CustomEvents, DatafieldEmbed, MenuSystemNamespaces, Nullable, PageSystemNamespaces } from "./types";
import { EmbedUtil } from "../utils/util";
import EventEmitter from "node:events";
import chalk from "chalk";

export class EmbedBuilderWithUtil extends EmbedBuilder {
	constructor(data?: APIEmbed | EmbedData | undefined) {
		super(data);
	}

	private boldPunctuationText(text: string): string {
		const emojiOrHyperlink = (text.match(/<[^>]+>|(\([^)]+\))/g) ?? []) as string[];

		emojiOrHyperlink?.forEach((match, index) => {
			text = text.replace(match, `##${index.toString()}##`);
		});

		text = text.replace(/[\-"'"]/g, '**$&**');
		return text.replace(/##(\d+)##/g, (match) => {
			return emojiOrHyperlink[Number.parseInt(match.slice(2, -2))] ?? "";
		});
	}

	public boldPunctuation(bold: boolean = true): this {
		if (!bold) return this;

		this.setDescription(
			this.boldPunctuationText(this.data.description ?? "")
		);
		this.setFields(
			this.data.fields?.map(
				(field) =>
					({
						name: field.name,
						value: this.boldPunctuationText(field.value),
					} as APIEmbedField)
			) ?? []
		);

		return this;
	}

	public setDefaultFooter(): this {
		return this.setFooter({ text: "Have fun developing!", iconURL: EmbedUtil.DevIcon });
	}
}

export class EmbedBuilderWithData extends EmbedBuilderWithUtil {
	/**
	 * A default URL used when you don't have any good Embed URLs for the datafield. Links to the bot's invitation page.
	 */
	public static readonly defaultURL: string = "https://discord.com/api/oauth2/authorize?client_id=1155496200615776327&permissions=416615361600&scope=applications.commands%20bot";
	protected static dataFieldId: string = "DATAFIELD_EMBED";
	protected dataField: Nullable<EmbedBuilder> = null;

	constructor(data?: APIEmbed | EmbedData | undefined) {
		super(data);
	}

	/**
	 * Creates a second embed with the same URL to hold string data.
	 * @param {string} url The URL of the datafield. If not specified, it uses the original embed's URL.
	 * @returns {this} The updated builder.
	 */
	public createDataField(url?: string): this {
		if (!url && !this.data.url)
			throw new Error("Embed must contain a URL to create a data field.");

		this.dataField = new EmbedBuilder()
			.setURL(url ?? (this.data.url as string))
			.setTitle(EmbedBuilderWithData.dataFieldId);
		if (!this.data.url) this.data.url = url;
		return this;
	}

	/**
	 * Adds a string value to the end of the datafield description.
	 * @param {string} val The string value.
	 * @returns {this} The updated builder.
	 */
	public appendStringValue(val: string): this {
		if (!this.dataField)
			throw new Error(
				"Failed to add string value: This embed does not have a data field."
			);

		this.dataField.setDescription(
			(this.dataField.data.description ?? "") + val + "\n"
		);
		return this;
	}

	/**
	 * Similar to the Array.splice method, but you can only modify 1 value at a time.
	 * @param index The index to replace.
	 * @param replace The replacement value. If not specified, it simply deletes the specified index.
	 * @returns {this} The updated builder.
	 */
	public spliceStringValue(index: number, replace?: string, options?: { appendWhenOutOfBounds: boolean }): this {
		if (!this.dataField)
			throw new Error("Failed to remove string value: This embed does not have a data field.");

		if (!(this.dataField.data.description as string).replace(/\n$/, "").split("\n")[index]) {
			if (options?.appendWhenOutOfBounds) return this.appendStringValue((replace as string) ?? "");
			else throw new Error(`This data field does not have a value for index ${index}.`);
		}

		const text = (this.dataField.data.description as string)
			.replace(/\n$/, "")
			.split("\n")
		text.splice(index, 1, replace ?? "");

		this.dataField.setDescription(text.join("\n"));
		return this;
	}

	/**
	 * Returns an array containing all embed(s).
	 * @returns {EmbedBuilder[]} The array of embed(s).
	 */
	public build(): EmbedBuilder[] {
		const embeds = [EmbedBuilder.from(this.data)];

		if (this.dataField) embeds.push(EmbedBuilder.from(this.dataField.data));
		return embeds;
	}

	public static fromAPIEmbed(embed: Embed, datafield: DatafieldEmbed): EmbedBuilderWithData {
		const output = new EmbedBuilderWithData(embed.data)
			.createDataField(datafield.data.url)

		datafield.data.description?.split("\n").forEach((val) => {
			output.appendStringValue(val);
		});
		return output;
	}

	/**
	 * Retrieves a string value based on the specified datafield and index.
	 * @param {EmbedBuilder} dataField The datafield embed.
	 * @param {number} index The index of the string value.
	 * @returns {Nullable<string>} The string value, or null if there is none.
	 */
	public static retrieveStringValue(
		dataField: Embed,
		index: number
	): Nullable<string> {
		if (
			!dataField.data.description ||
			dataField.data.title !== this.dataFieldId
		)
			return null;

		return dataField.data.description.replace(/\n$/, "").split("\n")[index] ?? null;
	}
}

export class PageSystem<T> {
	private static system: Map<string, PageSystem<any>> = new Map<
		string,
		PageSystem<any>
	>();
	public namespace: PageSystemNamespaces;
	private elements: T[] = [];
	private pages: T[][] = [];
	private key: string;
	private index: number = 0;
	private elementsPerPage: number;

	constructor(key: string, namespace: PageSystemNamespaces, elementsPerPage: number) {
		this.key = key;
		this.elementsPerPage = elementsPerPage;
		this.namespace = namespace;
		PageSystem.system.set(key + namespace, this);
	}

	public getPageIndex() {
		return this.index;
	}

	public nextPage(): this {
		this.index++;
		return this;
	}

	public prevPage(): this {
		this.index--;
		return this;
	}

	public flipPage(index: number): this {
		this.index = index;
		return this;
	}

	public getPageValue(index?: number): T[] {
		return this.pages[index ?? this.index];
	}

	public getTotalPages(): number {
		return this.pages.length;
	}

	public setPageValue(value: T[], index?: number): this {
		this.pages[index ?? this.index] = value;
		return this;
	}

	public setElements(value: T[]): this {
		this.elements = value;
		this.pages = this.format();
		return this;
	}

	public getKey(namespace: boolean = true): Nullable<string> {
		return namespace ? this.key + this.namespace : this.key;
	}

	public copy(): PageSystem<T> {
		return new PageSystem<T>("copy_" + this.key, this.namespace, this.elementsPerPage)
			.setElements(this.elements)
			.flipPage(this.index);
	}

	public existsPage(index?: number): boolean {
		return !!this.pages[index ?? this.index];
	}

	public delete(): boolean {
		return PageSystem.system.delete(this.key);
	}

	public static from(key: string, namespace: string): PageSystem<any> | undefined {
		return PageSystem.system.get(key + namespace);
	}

	public static existsKey(key: string, namespace: PageSystemNamespaces): boolean {
		return PageSystem.system.has(key + namespace);
	}

	private format(): T[][] {
		const result: T[][] = [];

		for (let i = 0; i < this.elements.length; i += this.elementsPerPage) {
			result.push(this.elements.slice(i, i + this.elementsPerPage));
		}

		return result;
	}
}

export class EventManager extends EventEmitter {
	public override on<K extends keyof CustomEvents>(
		event: K, 
		listener: (...args: CustomEvents[K]) => void
	): this {
		return super.on(event, listener as (...args: any[]) => void);
	}

	public override once<K extends keyof CustomEvents>(
		event: K, 
		listener: (...args: CustomEvents[K]) => void
	): this {
		return super.once(event, listener as (...args: any[]) => void);
	}
}

export class ModalInputBuilder extends TextInputBuilder {
	constructor() {
		super();
	}

	public build() {
		return new ActionRowBuilder<TextInputBuilder>().setComponents(this);
	}
}

export class TimeLogger {
    private start: number;
    private file: string;
    private pausedTime: number = 0;
    private pauseDate: number = 0;
    private paused: boolean = false;

    constructor(file: string = "File not specified") {
        this.start = Date.now();
        this.file = file;
    }

    public pause() {
        if (this.paused) return;

        this.pauseDate = Date.now();
        this.paused = true;
    }

    public resume() {
        if (!this.paused) return;

        this.pausedTime += Date.now() - this.pauseDate;
        this.paused = false;
    }

	public result() {
		const now = Date.now();
		const endTime = this.paused ? this.pauseDate : now;

		console.log(chalk.yellow(this.file), chalk.magenta("->"), chalk.blue(`Finished execution time recording, total duration of ${endTime - this.start - this.pausedTime}ms!\n`));
	}
}

export class MenuTimeout {
	public readonly id: string;
	private timeout: Nullable<NodeJS.Timeout> = null;
	private static timeoutMap: Map<string, MenuTimeout> = new Map();

	constructor(id: string, namespace: MenuSystemNamespaces) {
		const fullId = namespace + id;
		this.id = fullId;

		if (MenuTimeout.timeoutMap.has(fullId))
			MenuTimeout.timeoutMap.get(fullId)?.clearTimeout();

		MenuTimeout.timeoutMap.set(this.id, this);
	}

	public setTimeout(callback: (...args: any[]) => Awaitable<void>, timeout: number = 600000, ...args: readonly any[]) {
		this.timeout = setTimeout(
			callback,
			timeout,
			args
		);
	}

	public clearTimeout() {
		if (!this.timeout) return;

		clearTimeout(this.timeout);
		MenuTimeout.timeoutMap.delete(this.id);
	}
}

