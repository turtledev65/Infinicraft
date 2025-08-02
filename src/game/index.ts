import {
    checkCollision,
    getElementDimensions,
    getElementPosition,
    getPointerPosition,
    querrySelectorOrThrow,
} from "../utils/html";
import { DEFAULT_MODEL, query } from "../utils/hugging-face";
import { Graph, Vector2 } from "../utils/math";

export type Item = {
    emoji: string;
    name: string;
};

function compareItems(a: Item, b: Item) {
    return a.emoji === b.emoji && a.name === b.name;
}

function getExistingCombination(item1: Item, item2: Item) {
    console.log(
        `Searching for existing combination of ${item1.emoji} ${item1.name} ${item2.emoji} ${item2.name}...`,
    );

    const node1 = graphItems.getNode(item1);
    const node2 = graphItems.getNode(item2);
    if (!node1 || !node2) return null;

    let out: Item | null = null;
    let found = false;
    graphItems.dfs((item: Item) => {
        console.log("Dfs 1: ", item);
        graphItems.dfs((otherItem: Item) => {
            if (compareItems(item, otherItem)) {
                out = item;
                found = true;
                return null;
            }
        }, node2);
        if (found) {
            return null;
        }
    }, node1);

    if (!found) {
        console.log("Existing combination not found!");
    }

    return out as Item | null;
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

    const [emoji, name] = response.choices[0].message.content.split(" ");
    console.log(`Found ${emoji} ${name}`);

    return { emoji, name } as Item;
}

async function getCombination(item1: Item, item2: Item) {
    let out = getExistingCombination(item1, item2);
    if (!out) {
        out = await getNewCombination(item1, item2);
    }
    return out;
}

async function checkPlacedButtons() {
    for (const button of placedButtons) {
        for (const other of placedButtons) {
            if (other === button) continue;
            if (checkCollision(button.elem, other.elem)) {
                if (!button.dragging && !other.dragging) {
                    const newItem = await getCombination(button.item, other.item);
                    if (!newItem) {
                        continue;
                    }

                    graphItems.addEdge(button.item, newItem);
                    graphItems.addEdge(other.item, newItem);

                    const newSidebarButton = new SidebarItemButton(
                        newItem,
                        sidebar,
                        sidebarContainer,
                    );
                    newSidebarButton.addToSidebar();

                    const newDraggableButton = new DraggableItemButton(
                        newItem,
                        sidebar,
                        false,
                    );
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

/**
 * Base item button class that is inherited by all the other item buttons
 */
class BaseItemButton {
    elem: HTMLButtonElement;
    item: Item;

    constructor(item: Item) {
        this.elem = document.createElement("button");
        this.elem.className = "item-button";
        this.elem.innerText = `${item.emoji} ${item.name}`;
        this.item = item;
    }
}

/**
 * The item button that is in the sidebar
 */
class SidebarItemButton extends BaseItemButton {
    sidebar: HTMLElement;
    sidebarContainer: HTMLElement;

    timerId: ReturnType<typeof setTimeout> | undefined;

    constructor(item: Item, sidebar: HTMLElement, sidebarContainer: HTMLElement) {
        super(item);
        this.sidebar = sidebar;
        this.sidebarContainer = sidebarContainer;

        this.elem.addEventListener("pointerdown", () => {
            this.timerId = setTimeout(() => {
                this.handleStartDrag();
                this.timerId = undefined;
            }, 100);
        });
        this.elem.addEventListener("pointerup", () => {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        });
    }

    handleStartDrag() {
        const newButton = new DraggableItemButton(this.item, this.sidebar, true);
        newButton.addToBody();
    }

    addToSidebar() {
        this.sidebarContainer.appendChild(this.elem);
    }
}

/**
 * The item button that is draggable
 */
class DraggableItemButton extends BaseItemButton {
    dragging: boolean;
    offset: Vector2 = Vector2.empty();

    constructor(item: Item, sidebar: HTMLElement, dragging: boolean = false) {
        super(item);
        this.dragging = dragging;

        this.elem.classList.add("scale-0");
        this.elem.style.position = "fixed";
        if (this.dragging) {
            this.setPos(getPointerPosition());
        }

        this.elem.addEventListener("pointerdown", () => {
            this.dragging = true;
        });
        document.addEventListener("pointermove", ev => {
            if (!this.dragging) {
                return;
            }

            this.elem.style.position = "fixed";
            this.elem.style.zIndex = "30";
            this.setPos(new Vector2(ev.x, ev.y));
        });
        document.addEventListener("pointerup", () => {
            if (!this.dragging) {
                return;
            }
            this.dragging = false;
            this.elem.style.zIndex = "10";

            if (checkCollision(this.elem, sidebar)) {
                this.removeFromBody();
            }
        });
    }

    setPos(newPos: Vector2 | null) {
        if (newPos === null) {
            this.elem.style.left = "";
            this.elem.style.top = "";
            return;
        }

        const pos = newPos.diffed(this.offset);
        this.elem.style.left = `${pos.x}px`;
        this.elem.style.top = `${pos.y}px`;
    }

    addToBody() {
        document.body.appendChild(this.elem);
        this.offset = getElementDimensions(this.elem).divided(2);
        this.elem.classList.remove("scale-0");
        this.elem.classList.add("scale-100");
        placedButtons.push(this);
    }

    removeFromBody() {
        this.elem.classList.remove("scale-100");
        this.elem.classList.add("scale-0");
        for (let i = 0; i < placedButtons.length; i++) {
            if (placedButtons[i] === this) {
                placedButtons.splice(i, 1);
                break;
            }
        }

        const TRANSITION_DURATION_MS = 400;
        setTimeout(() => {
            document.body.removeChild(this.elem);
        }, TRANSITION_DURATION_MS);
    }
}

// Globals
const STARTING_ITEMS: Item[] = [
    { emoji: "💀", name: "skull" },
    { emoji: "💧", name: "water" },
] as const;
const graphItems = new Graph<Item>(compareItems);
for (const item of STARTING_ITEMS) {
    graphItems.addNode(item);
}

const placedButtons = [] as DraggableItemButton[];

const sidebar = querrySelectorOrThrow<HTMLElement>("#sidebar");
const sidebarContainer =
    querrySelectorOrThrow<HTMLElement>("#sidebar-container");

export function startGame() {
    graphItems.dfs(item => {
        const button = new SidebarItemButton(item, sidebar, sidebarContainer);
        button.addToSidebar();
    });
    requestAnimationFrame(checkPlacedButtons);
}
