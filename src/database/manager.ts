import { Snowflake } from "discord.js";
import fs from "fs";
import {
	DatabaseJSONObject,
	DatabaseUpdateObject,
	JSONAllowed,
	Nullable,
	ProfileMapObject,
	StringKeyObject,
} from "../types/types";

/**
 * A class to manage everything related to the local JSON database.
 */
export class DatabaseManager {
	/**
	 * Creates a new database directory with a unique namespace.
	 * @param namespace The directory name of the database. This must be unique to all other databases and database managers.
	 */
	constructor(namespace: string) {
		if (DatabaseManager.namespaces.includes(namespace))
			throw new Error(`Duplicate use of database namespace ${namespace}.`);

		this.namespacePath = `./dist/database/${namespace}`;
		DatabaseManager.namespaces.push(namespace);
	}

	protected static readonly namespaces: string[] = [];
	protected readonly profileMap: Map<Snowflake, string> = new Map<Snowflake, string>();
	protected readonly namespacePath: string;

	/**
	 * Initialises the manager, creating the directory with the specified namespace and a profile map file to store the locations of all JSON files. If the profile map file already exists, it loads the local profile map with all its data.
	 * @returns {Promise<void>}
	 */
	public async initialise(): Promise<void> {
		if (!fs.existsSync(this.namespacePath))
			fs.mkdirSync(this.namespacePath);

		if (!this.existsFile(`${this.namespacePath}/profileMap.json`))
			fs.writeFileSync(
				`${this.namespacePath}/profileMap.json`,
				JSON.stringify({}, null, 2)
			);

		const profileMapJSON = JSON.parse(
			fs.readFileSync(`${this.namespacePath}/profileMap.json`, "utf-8")
		);
		for (const id in profileMapJSON) {
			this.updateProfileMap(id, profileMapJSON[id]);
		}
		
		this.profileMap.forEach((_val, key) => {
			this.updateEntry(
				key, 
				{ 
					active_menus: { 
						$replace: true 
					}
				}
			);
		});
	}

	/**
	 * Adds a new entry to the database and returns it.
	 * @param {Snowflake} id The id of the new entry. Best practise is to use a discord id accessible through the discord API. Must be unique.
	 * @param {string} fileName The name of the JSON file. Must be unique and must not be called profileMap. The .json extension is applied automatically.
	 * @param {DatabaseJSONObject} content The content of the JSON file.
	 * @returns {DatabaseJSONObject} The newly added entry.
	 */
	public createEntry(
		id: Snowflake,
		fileName: string,
		content: DatabaseJSONObject|StringKeyObject,
	): DatabaseJSONObject|StringKeyObject {

		if (this.profileMap.has(id))
			throw new Error("The specified id already has an associated file.");

		if (this.existsFile(`${this.namespacePath}/${fileName}.json`))
			throw new Error("There is already a file with the same name.");

		fs.writeFileSync(
			`${this.namespacePath}/${fileName}.json`,
			JSON.stringify(content, null, 2)
		);
		this.updateProfileMap(id, fileName);
		return content;
	}

	/**
	 * Adds a new entry to the database, overriding any entry with the same id.
	 * @param {Snowflake} id The id of the entry. Best practise is to use a discord id accessible through the discord API.
	 * @param {string} fileName The name of the JSON file. Must be unique and must not be called profileMap. The .json extension is applied automatically.
	 * @param {DatabaseJSONObject} content The content of the JSON file.
	 * @returns {Nullable<DatabaseJSONObject>} The replaced JSON content, if applicable. Otherwise returns null.
	 */
	public createEntryOverwrite(
		id: Snowflake,
		fileName: string,
		content: DatabaseJSONObject
	): Nullable<DatabaseJSONObject> {
		if (this.existsFile(`${this.namespacePath}/${fileName}.json`))
			throw new Error("There is already a file with the same name.");

		let overwritten = null;
		if (this.profileMap.has(id)) overwritten = this.getEntry(id);

		fs.writeFileSync(
			`${this.namespacePath}/${fileName}.json`,
			JSON.stringify(content, null, 2)
		);

		this.updateProfileMap(id, fileName);
		return overwritten;
	}

	/**
	 * Deletes an entry from the database.
	 * @param {Snowflake} id The id of the entry.
	 * @returns {boolean} True if the entry was successfully deleted, false otherwise.
	 */
	public deleteEntry(id: Snowflake): boolean {
		const fileName: string | undefined = this.profileMap.get(id);
		if (!fileName) return false;

		try {
			fs.unlinkSync(`${this.namespacePath}/${fileName}.json`);
			this.updateProfileMap(id);
			return true;
		} catch (error: any) {
			if (error?.code === "ENOENT") return false;
			else throw error;
		}
	}

	/**
	 * Retrieves an entry from the database in an object format.
	 * @param {Snowflake} id The id of the entry.
	 * @returns {Nullable<DatabaseJSONObject>} The entry corresponding to the id, or null if it doesn't exist.
	 */
	public getEntry(id: Snowflake): Nullable<DatabaseJSONObject> {
		if (!this.existsEntry(id)) return null;

		return JSON.parse(
			fs.readFileSync(
				`${this.namespacePath}/${this.profileMap.get(id)}.json`,
				"utf-8"
			)
		) as DatabaseJSONObject;
	}

	/**
	 * Updates specified key-value pairs from an entry.
	 * @param {Snowflake} id The id of the entry.
	 * @param {Record<keyof DatabaseJSONObject, JSONAllowed>} update The object with key-value pairs to update.
	 * @returns {Nullable<DatabaseJSONObject>} The updated entry, or null if it doesn't exist.
	 */
	public updateEntry(
		id: Snowflake,
		update: Record<keyof DatabaseJSONObject, JSONAllowed>
	): Nullable<DatabaseJSONObject> {
		if (!this.existsEntry(id)) return null;

		const filePath = `${this.namespacePath}/${this.profileMap.get(id)}.json`;

		const JSONdata = JSON.parse(fs.readFileSync(filePath, "utf-8")) as DatabaseJSONObject;
		this.updateObject(JSONdata, update);

		fs.writeFileSync(filePath, JSON.stringify(JSONdata, null, 2), "utf-8");
		return JSONdata;
	}

	/**
	 * Returns whether an entry exists in the database.
	 * @param {Snowflake} id The id of the entry.
	 * @returns {boolean} Whether the entry exists.
	 */
	public existsEntry(id: Snowflake): boolean {
		return this.profileMap.has(id);
	}

	/**
	 * Updates both the local profile map and the global profile map file.
	 * @param {Snowflake} id The id of the entry.
	 * @param {string} fileName The file name of the entry.
	 * @returns {boolean} True if the profile map was successfully updated, false otherwise.
	 */
	protected updateProfileMap(id: Snowflake, fileName?: string): boolean {
		const profileMapJSON = JSON.parse(
			fs.readFileSync(`${this.namespacePath}/profileMap.json`, "utf-8")
		) as ProfileMapObject;

		if (fileName) {
			this.profileMap.set(id, fileName);

			profileMapJSON[id] = fileName;
			fs.writeFileSync(
				`${this.namespacePath}/profileMap.json`,
				JSON.stringify(profileMapJSON, null, 2)
			);
			return true;
		} else {
			delete profileMapJSON[id];
			return this.profileMap.delete(id);
		}
	}

	protected existsFile(path: string): boolean {
		try {
			const file = fs.statSync(path);

			if (file.isFile()) return true;
			return false;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT")
				return false;
			throw error;
		}
	}

	protected updateObject(obj: DatabaseJSONObject, update: DatabaseUpdateObject) {
		if (update?.$replace === true) obj = {} as DatabaseJSONObject;
		const remove = !!update?.$delete;

		for (const key in update) {
			if (key === "$replace") continue;
			if (key === "$delete") continue;

			if (typeof update[key] === "object") {
				if (!obj[key] || typeof obj[key] !== "object") {
					obj[key] = {};
				}
				obj[key] = this.updateObject(obj[key] as typeof obj, update[key] as typeof update);
			} else {
				remove
					? delete obj[key]
					: obj[key] = update[key];
			}

			if (update[key] === null) {
				obj[key] = null;
			}
		}

		return obj;
	}
}
