import type { Item, PlacedItem } from "../types";
import { checkCollision, getElementDimensions, getElementPosition, getPointerPosition, querrySelectorOrThrow } from "../utils/html";
import { addPlacedItem, getAllItems, getAllPlacedItems, removePlacedItem, updatePlacedItem } from "../utils/indexeddb";
import { Vector2 } from "../utils/math";
import { getExistingCombination, getNewCombination } from "./combination";

// Globals
export const placedButtons = [] as DraggableItemButton[];

/**
 * Base item button class that is inherited by all the other item buttons
 */
export class BaseItemButton {
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
export class SidebarItemButton extends BaseItemButton {
    timerId: ReturnType<typeof setTimeout> | undefined;
    sidebar: HTMLElement;
    sidebarContainer: HTMLElement;

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
        const newButton = new DraggableItemButton(this.item, this.sidebar, this.sidebarContainer, true);
        newButton.addToBody();
        newButton.scaleUp();
    }

    addToSidebar() {
        this.sidebarContainer.appendChild(this.elem);
    }
}


/**
 * The item button that is draggable
 */
export class DraggableItemButton extends BaseItemButton {
    dragging: boolean;
    offset: Vector2 = Vector2.empty();
    id: number | null = null;

    sidebar: HTMLElement;
    sidebarContainer: HTMLElement;

    constructor(item: Item, sidebar: HTMLElement, sidebarContainer: HTMLElement, dragging: boolean = false, id: number | null = null) {
        super(item);
        this.sidebar = sidebar;
        this.sidebarContainer = sidebarContainer;

        this.dragging = dragging;
        this.id = id;

        this.elem.classList.add("scale-0");
        this.elem.style.position = "fixed";
        if (this.dragging) {
            this.setPos(getPointerPosition());
        }

        this.elem.addEventListener("pointerdown", () => this.handleStartDrag());
        document.addEventListener("pointermove", ev => this.handleDrag(ev));
        document.addEventListener("pointerup", ev => this.handleStopDrag(ev));
    }

    private handleStartDrag() {
        this.dragging = true;
    }

    private handleDrag(ev: PointerEvent) {
        if (!this.dragging) {
            return;
        }

        this.elem.style.position = "fixed";
        this.elem.style.zIndex = "50";
        this.setPos(new Vector2(ev.x, ev.y));
    }

    private async handleStopDrag(ev: PointerEvent) {
        if (!this.dragging) {
            return;
        }
        this.dragging = false;
        this.elem.style.zIndex = "0";

        let isInDB = true;
        if (this.id === null) {
            isInDB = false;
        }

        if (checkCollision(this.elem, this.sidebar)) {
            this.scaleDown().then(() => { this.removeFromBody() })
            if (isInDB) {
                this.removeFromDB();
            }
            return;
        }

        if (!isInDB) {
            await this.addToDB();
            await checkPlacedButtons(this.sidebar, this.sidebarContainer);
            return;
        }
        this.setPos(new Vector2(ev.x, ev.y), isInDB);
        await checkPlacedButtons(this.sidebar, this.sidebarContainer);
    }

    async setPos(newPos: Vector2 | null, updateDB: boolean = false) {
        if (newPos === null) {
            this.elem.style.left = "";
            this.elem.style.top = "";
            return;
        }

        const pos = newPos.diffed(this.offset);
        this.elem.style.left = `${pos.x}px`;
        this.elem.style.top = `${pos.y}px`;


        if (updateDB) {
            await this.updateInDB();
        }

    }

    addToBody() {
        document.body.appendChild(this.elem);
        this.offset = getElementDimensions(this.elem).divided(2);
    }

    removeFromBody() {
        document.body.removeChild(this.elem);
    }

    scaleUp() {
        const TRANSITION_DURATION_MS = 400;
        return new Promise<void>((rez) => {
            this.elem.classList.remove("scale-0");
            this.elem.classList.add("scale-100");
            setTimeout(rez, TRANSITION_DURATION_MS);
        })
    }

    scaleDown() {
        const TRANSITION_DURATION_MS = 400;
        return new Promise<void>((rez) => {
            this.elem.classList.remove("scale-100");
            this.elem.classList.add("scale-0");
            setTimeout(rez, TRANSITION_DURATION_MS);
        })
    }

    async addToDB() {
        if (this.id !== null) {
            return;
        }

        const pos = getElementPosition(this.elem);
        try {
            const id = await addPlacedItem({ x: pos.x, y: pos.y, item: this.item } as PlacedItem);
            this.id = id;
            placedButtons.push(this);
        } catch (err) {
            console.log(err);
        }
    }

    async removeFromDB() {
        if (this.id === null) {
            return;
        }

        try {
            await removePlacedItem(this.id);
            for (let i = 0; i < placedButtons.length; i++) {
                if (placedButtons[i] === this) {
                    placedButtons.splice(i, 1);
                }
            }
            this.id = null
        } catch (err) {
            console.log(err);
        }
    }

    async updateInDB() {
        if (this.id === null) {
            return;
        }

        try {
            const pos = getElementPosition(this.elem);
            await updatePlacedItem({ x: pos.x, y: pos.y, id: this.id, item: this.item }, this.id);
        } catch (err) {
            console.log(err);
        }
    }
}

export async function initPlacedItems(sidebar: HTMLElement, sidebarContainer: HTMLElement) {
    const placedItems = await getAllPlacedItems();
    for (const i of placedItems) {
        const button = new DraggableItemButton(i.item, sidebar, sidebarContainer, false, i.id);
        button.addToBody();
        button.scaleUp();
        button.setPos(new Vector2(i.x, i.y));
    }
}

export async function checkPlacedButtons(sidebar: HTMLElement, sidebarContainer: HTMLElement) {
    for (const button of placedButtons) {
        for (const other of placedButtons) {
            if (other === button) continue;
            if (button.dragging || other.dragging) continue;

            if (checkCollision(button.elem, other.elem)) {
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
                    const newSidebarButton = new SidebarItemButton(newItem, sidebar, sidebarContainer);
                    newSidebarButton.addToSidebar();
                }


                const newDraggableButton = new DraggableItemButton(newItem, sidebar, sidebarContainer);
                const pos = getElementPosition(button.elem);
                newDraggableButton.addToBody();
                newDraggableButton.scaleUp();
                await newDraggableButton.addToDB();
                newDraggableButton.setPos(pos, true);

                await Promise.all([button.scaleDown(), other.scaleDown()]);
                button.removeFromBody();
                other.removeFromBody();

                button.removeFromDB();
                other.removeFromDB();
            }
        }
    }
}

/**
 * Class that manages the sidebar
 */
export class Sidebar {
    elem: HTMLElement;
    containerElem: HTMLElement;

    constructor() {
        this.elem = querrySelectorOrThrow<HTMLElement>("#sidebar");
        this.containerElem =
            querrySelectorOrThrow<HTMLElement>("#sidebar-container");
    }

    async init() {
        const sidebarItems = await getAllItems();
        for (const item of sidebarItems) {
            const button = new SidebarItemButton(item, this.elem, this.containerElem);
            button.addToSidebar();
        }
    }
}
