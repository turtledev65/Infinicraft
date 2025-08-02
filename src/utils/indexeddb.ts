import config from "../config";
import type { Item } from "../types";

let db: IDBDatabase | null = null;

const name = "Infinicraft";
const version = 3;

export function initDB() {
    return new Promise<undefined>((rez, rej) => {
        const request = window.indexedDB.open(name, version);

        request.onerror = () => {
            console.error("Failed to open database");
            rej();
        }

        request.onsuccess = () => {
            db = request.result;
            console.log("Database initialized");
            rez(undefined);
        }

        request.onupgradeneeded = () => {
            const db = request.result;
            const itemsStore = db.createObjectStore("items", { autoIncrement: true });
            itemsStore.createIndex("recipe", "recipe", { unique: true });

            config.startingItems.forEach(item => {
                itemsStore.add(item, item.id);
            });
        }
    })

}

export function getAllItems() {
    return new Promise<Item[]>((rez, rej) => {
        const store = getObjectStore("items", "readonly");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const req = store.getAll();
        req.onerror = (e) => {
            rej(e.target?.error);
        }
        req.onsuccess = () => {
            rez(req.result);
        }
    })
}

export function getItem(recipe: [number, number]) {
    return new Promise<Item>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
            return;
        }

        const store = getObjectStore("items", "readonly");
        if (store === null) {
            return;
        }

        const request = store.index("recipe").openCursor();
        request.onsuccess = (e) => {
            const cursor = request.result;
            console.log(cursor);
            if (cursor) {
                const currItem = cursor.value;
                console.log(currItem);
                if (currItem.recipe[0] === recipe[0] && currItem.recipe[1] === recipe[1]) {
                    rez(currItem);
                }
                cursor.continue();
            } else {
                rej("Item not found");
                return;
            }
        }
        request.onerror = (e) => {
            rej(e.target?.error);
        }
    })
}

export function addItem(item: Item) {
    return new Promise<number>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
        }

        const store = getObjectStore("items", "readwrite");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const request = store.add(item);
        request.onerror = (e) => {
            rej(e.target?.error);
        }
        request.onsuccess = (e) => {
            rez(e.target?.result);
        }
    })
}

function getObjectStore(name: string, mode: "readonly" | "readwrite") {
    if (db === null) {
        console.error("DB not initialized");
        return null;
    }

    const tx = db.transaction(name, mode);
    return tx.objectStore(name);
}
