import { Bot } from "main";
import { StringKeyObject } from "./types";

export const getEnabledButtonMap = (client: Bot, o: StringKeyObject, p: string): boolean[] => {
    const parentObj = client.objectUtil.navigateObject(o, p.split(".").slice(0, -1).join("."));
    const childObj = client.objectUtil.navigateObject(o, p);

    const parentKeys = Object.entries(typeof parentObj === "object" ? (parentObj ?? {}) : {}).map((entry) => entry[0]);
    const childKeys = Object.entries(typeof childObj === "object" ? (childObj ?? {}) : {}).map((entry) => entry[0]);

    const booleanArr: boolean[] = [];

    p.split(".").length > 0 && p
    ? booleanArr.push(true)
    : booleanArr.push(false);

    typeof childObj === "object" && childKeys.length > 0
    ? booleanArr.push(true)
    : booleanArr.push(false);

    booleanArr.push(true);

    parentKeys.findIndex((k) => k === p.split(".").pop()) > 0
    ? booleanArr.push(true)
    : booleanArr.push(false);

    parentKeys.findIndex((k) => k === p.split(".").pop()) !== (parentKeys.length - 1)
    ? booleanArr.push(true)
    : booleanArr.push(false);

    booleanArr.push(true);

    return booleanArr;
}

export const getCenteredObjectSnippet = (json: string, path: string, length: number = 55) => {
    const lines = json.split('\n');
    const halfColumn = Math.floor(length / 2);
    const index = getIndexFromPath(json, path);
    const start = Math.max(index - halfColumn, 0);

    return lines.map(line => 
        line.length >= start + length
            ? line.slice(start, start + length)
            : line.slice(start)
    ).join('\n');
}

const getIndexFromPath = (jsonString: string, path: string) => {
    const keys = path.split('.');
    let json = JSON.parse(jsonString);
  
    for (const key of keys) {
        if (json.hasOwnProperty(key)) {
            json = json[key];
        } else {
            return -1;
        }
    }
    const stringified = JSON.stringify(json);
  
    const searchLines = jsonString.split('\n');
    const searchLine = searchLines.find((line: string) => line.includes(stringified)) as string;
  
    const index = searchLine.indexOf(stringified);
  
    return index;
  }