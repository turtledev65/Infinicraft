import type { Item } from "../types";
import { checkCollision, getElementDimensions, getPointerPosition, querrySelectorOrThrow } from "../utils/html";
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

    constructor(item: Item, dragging: boolean = false) {
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
