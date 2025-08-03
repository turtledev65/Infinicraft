import {
    checkCollision,
    getElementPosition,
} from "../utils/html";
import { initDB } from "../utils/indexeddb";
import { getExistingCombination, getNewCombination } from "./combination";
import { DraggableItemButton, initPlacedItems, placedButtons, Sidebar, SidebarItemButton } from "./sidebar";

//
// async function checkPlacedButtons() {
//     for (const button of placedButtons) {
//         for (const other of placedButtons) {
//             if (other === button) continue;
//             if (checkCollision(button.elem, other.elem)) {
//                 if (!button.dragging && !other.dragging) {
//                     let newItem = await getExistingCombination(button.item, other.item);
//                     let alreadyExists = true;
//                     if (!newItem) {
//                         newItem = await getNewCombination(button.item, other.item);
//                         alreadyExists = false;
//                     }
//                     if (!newItem) {
//                         continue;
//                     }
//
//
//                     if (!alreadyExists) {
//                         const newSidebarButton = new SidebarItemButton(newItem);
//                         newSidebarButton.addToSidebar();
//                     }
//
//                     const newDraggableButton = new DraggableItemButton(newItem, false);
//                     const pos = getElementPosition(button.elem);
//                     newDraggableButton.addToBody();
//                     newDraggableButton.addToDB();
//                     newDraggableButton.setPos(pos, true);
//
//                     button.removeFromBody();
//                     other.removeFromBody();
//                 } else {
//                     button.elem.classList.add("highlight");
//                     other.elem.classList.add("highlight");
//                 }
//             } else {
//                 button.elem.classList.remove("highlight");
//                 other.elem.classList.remove("highlight");
//             }
//         }
//     }
//
//     requestAnimationFrame(checkPlacedButtons);
// }


// Globals
export async function startGame() {
    await initDB()

    const sidebar = new Sidebar();
    await sidebar.init();
    await initPlacedItems(sidebar.elem, sidebar.containerElem);

    // requestAnimationFrame(checkPlacedButtons);
}
