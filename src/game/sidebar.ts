import type { Item, PlacedItem } from "../types";
import { checkCollision, getElementDimensions, getElementPosition, getPointerPosition, querrySelectorOrThrow } from "../utils/html";
import { addPlacedItem, removePlacedItem, updatePlacedItem } from "../utils/indexeddb";
import { Vector2 } from "../utils/math";

// Globals
export const placedButtons = [] as DraggableItemButton[];
const sidebar = querrySelectorOrThrow<HTMLElement>("#sidebar");
const sidebarContainer =
    querrySelectorOrThrow<HTMLElement>("#sidebar-container");

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

    constructor(item: Item) {
        super(item);

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
        const newButton = new DraggableItemButton(this.item, true);
        newButton.addToBody();
    }

    addToSidebar() {
        sidebarContainer.appendChild(this.elem);
    }
}


/**
 * The item button that is draggable
 */
export class DraggableItemButton extends BaseItemButton {
    dragging: boolean;
    offset: Vector2 = Vector2.empty();
    id: number | null = null;

    constructor(item: Item, dragging: boolean = false, id: number | null = null) {
        super(item);
        this.dragging = dragging;
        this.id = id;

        this.elem.classList.add("scale-0");
        this.elem.style.position = "fixed";
        if (this.dragging) {
            this.setPos(getPointerPosition(), true);
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
            this.setPos(new Vector2(ev.x, ev.y), true);
        });
        document.addEventListener("pointerup", () => {
            if (!this.dragging) {
                return;
            }
            this.dragging = false;
            this.elem.style.zIndex = "10";

            if (checkCollision(this.elem, sidebar)) {
                this.removeFromBody();
                return;
            }


            this.addToDB();
        });
    }

    setPos(newPos: Vector2 | null, updateDB: boolean = false) {
        if (newPos === null) {
            this.elem.style.left = "";
            this.elem.style.top = "";
            return;
        }

        const pos = newPos.diffed(this.offset);
        this.elem.style.left = `${pos.x}px`;
        this.elem.style.top = `${pos.y}px`;


        if (updateDB) {
            this.updateInDB();
        }

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

        this.removeFromDB();
    }

    async addToDB() {
        if (this.id !== null) {
            return;
        }

        const pos = getElementPosition(this.elem);
        try {
            const id = await addPlacedItem({ x: pos.x, y: pos.y, item: this.item } as PlacedItem);
            this.id = id;
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
