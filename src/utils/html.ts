import { checkAABB, Vector2 } from "./math";

export function querrySelectorOrThrow<T extends Element>(
    selector: string,
    target?: Element,
) {
    let searchElem = target ?? document;
    const out = searchElem.querySelector<T>(selector);
    if (out === null) {
        throw new Error(`Failed to find ${selector} in ${searchElem.nodeName}`);
    }

    return out;
}

export function querrySelectorAllOrThrow<T extends Element>(
    selector: string,
    target?: Element,
) {
    let searchElem = target ?? document;
    const out = searchElem.querySelectorAll<T>(selector);
    if (out.length === 0) {
        throw new Error(`Failed to find ${selector} in ${searchElem.nodeName}`);
    }

    return out;
}

export function getElementPosition(elem: HTMLElement) {
    const rect = elem.getBoundingClientRect();
    return new Vector2(rect.x, rect.y);
}

export function getElementDimensions(elem: HTMLElement) {
    return new Vector2(elem.clientWidth, elem.clientHeight);
}

const mousePos = Vector2.empty();
document.addEventListener("pointermove", ev => {
    mousePos.x = ev.clientX;
    mousePos.y = ev.clientY;
});
export function getPointerPosition() {
    return mousePos;
}

export function checkCollision(elem1: HTMLElement, elem2: HTMLElement) {
    return checkAABB(
        getElementPosition(elem1),
        getElementDimensions(elem1),
        getElementPosition(elem2),
        getElementDimensions(elem2),
    );
}
