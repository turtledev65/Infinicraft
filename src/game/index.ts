import type { Item } from "../types";
import {
    checkCollision,
    getElementPosition,
} from "../utils/html";
import { DEFAULT_MODEL, query } from "../utils/hugging-face";
import { addItem, getAllItems, getItem, initDB } from "../utils/indexeddb";
import { isCharAlphanumeric, isCharSign, isCharWhitespace } from "../utils/str";
import { DraggableItemButton, placedButtons, SidebarItemButton } from "./sidebar";

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

async function getExistingCombination(item1: Item, item2: Item) {
    console.log(
        `Searching for existing combination of ${item1.emoji} ${item1.name} ${item2.emoji} ${item2.name}...`,
    );

    let id1 = item1.id;
    let id2 = item2.id;
    if (id1 > id2) {
        const tmp = id1;
        id1 = id2;
        id2 = tmp;
    }

    let out: Item | null = null;
    try {
        out = await getItem([id1, id2]);
        console.log(`Found ${out.emoji} ${out.name}`);
    } catch (err) {
        console.log(err);
    }

    return out;
}

async function getNewCombination(item1: Item, item2: Item) {
    console.log(
        `Generating new combination between ${item1.emoji} ${item1.name} and ${item2.emoji} ${item2.name}...`,
    );
    const prompt = `I will give you 2 words and I want you to give me the most plausible outcome of combining these 2 things, even if it's impossible. I want you to only repsond with one word, which is the answer I'm seeking and a string of highly prefferably one emoji which represents the generated word. The emoji/s should be the first things and then a space, followed by the word I'm seeking. NOTHING MORE. The emoji cannot be something that represents one of the original word, it needs to represent the word that is the combination of those 2. I will also give you the emojis that the original words use, but YOU CANNOT USE THEM AT ALL. ALSO DO NOT GIVE ME JUST AN EMOJI, I ALSO WANT TEXT. The 2 words are "${item1.emoji} ${item1.name}" and "${item2.emoji} ${item2.name}"`;
    const response = await query({
        messages: [{ role: "user", content: prompt }],
        model: DEFAULT_MODEL,
    });
    if (response === undefined || response.choices.length === 0) {
        console.log("Could not find combination");
        return null;
    }

    console.log("Api response: ", response.choices[0].message.content);
    const { emoji, name } = parseItem(response.choices[0].message.content);
    console.log(`Found ${emoji} ${name}`);

    // The saved ids should always be saved in ascending order
    let id1 = item1.id;
    let id2 = item2.id;
    if (id1 > id2) {
        const tmp = id1;
        id1 = id2;
        id2 = tmp;
    }
    const recipe = [id1, id2];

    // Save to db
    const newItem = { emoji, name, recipe } as Item;
    const id = await addItem(newItem);

    return { ...newItem, id };
}

async function checkPlacedButtons() {
    for (const button of placedButtons) {
        for (const other of placedButtons) {
            if (other === button) continue;
            if (checkCollision(button.elem, other.elem)) {
                if (!button.dragging && !other.dragging) {
                    let newItem = await getExistingCombination(button.item, other.item);
                    let alreadyExists = true;
                    if (!newItem) {
                        newItem = await getNewCombination(button.item, other.item);
                        alreadyExists = false;
                    }
                    if (!newItem) {
                        continue;
                    }


                    if (!alreadyExists) {
                        const newSidebarButton = new SidebarItemButton(newItem);
                        newSidebarButton.addToSidebar();
                    }

                    const newDraggableButton = new DraggableItemButton(newItem, false);
                    const pos = getElementPosition(button.elem);
                    newDraggableButton.setPos(pos);
                    newDraggableButton.addToBody();

                    button.removeFromBody();
                    other.removeFromBody();
                } else {
                    button.elem.classList.add("highlight");
                    other.elem.classList.add("highlight");
                }
            } else {
                button.elem.classList.remove("highlight");
                other.elem.classList.remove("highlight");
            }
        }
    }

    requestAnimationFrame(checkPlacedButtons);
}


// Globals
export async function startGame() {
    await initDB()
    const items = await getAllItems();
    for (const item of items) {
        const button = new SidebarItemButton(item);
        button.addToSidebar();
    }

    requestAnimationFrame(checkPlacedButtons);
}
