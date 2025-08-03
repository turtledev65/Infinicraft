import { initDB } from "../utils/indexeddb";
import { initPlacedItems, Sidebar, } from "./sidebar";

export async function startGame() {
    await initDB()

    const sidebar = new Sidebar();
    await sidebar.init();
    await initPlacedItems(sidebar.elem, sidebar.containerElem);
}
