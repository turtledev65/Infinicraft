import config from "../config";
import type { Item } from "../types";
import { DEFAULT_MODEL, query } from "../utils/hugging-face";
import { addItem, getItem } from "../utils/indexeddb";
import { isCharAlphanumeric, isCharSign, isCharWhitespace } from "../utils/str";

function parseItem(str: string) {
    const out = { emoji: "", name: "" } as Item;

    for (const ch of str) {
        if (isCharWhitespace(ch) || isCharSign(ch)) continue;

        if (isCharAlphanumeric(ch)) {
            out.name += ch.toLowerCase();;
        } else {
            out.emoji += ch;
        }
    }

    return out;
}

function getRecipe(item1: Item, item2: Item): [number, number] {
    let id1 = item1.id;
    let id2 = item2.id;
    if (id1 > id2) {
        const tmp = id1;
        id1 = id2;
        id2 = tmp;
    }

    return [id1, id2];
}

export async function getExistingCombination(item1: Item, item2: Item) {
    console.log(
        `Searching for existing combination of ${item1.emoji} ${item1.name} ${item2.emoji} ${item2.name}...`,
    );

    const recipe = getRecipe(item1, item2);
    let out: Item | null = null;
    try {
        out = await getItem(recipe);
        console.log(`Found ${out.emoji} ${out.name}`);
    } catch (err) {
        console.log(err);
    }

    return out;
}

export async function getNewCombination(item1: Item, item2: Item) {
    console.log(
        `Generating new combination between ${item1.emoji} ${item1.name} and ${item2.emoji} ${item2.name}...`,
    );
    const response = await query({
        messages: [{ role: "user", content: config.prompt(item1, item2) }],
        model: DEFAULT_MODEL,
    });
    if (response === undefined || response.choices.length === 0) {
        console.log("Could not find combination");
        return null;
    }

    console.log("Api response: ", response.choices[0].message.content);
    const { emoji, name } = parseItem(response.choices[0].message.content);
    console.log(`Found ${emoji} ${name}`);

    // Save to db
    const recipe = getRecipe(item1, item2);
    const newItem = { emoji, name, recipe } as Item;
    const id = await addItem(newItem);

    return { ...newItem, id };
}
