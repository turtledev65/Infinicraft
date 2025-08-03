import config from "../config";
import type { Item, PlacedItem } from "../types";

let db: IDBDatabase | null = null;

export function initDB() {
    return new Promise<void>((rez, rej) => {
        const request = window.indexedDB.open(config.dbName, config.dbVersion);

        request.onerror = () => {
            console.error("Failed to open database");
            rej();
        }

        request.onsuccess = () => {
            db = request.result;
            console.log("Database initialized");
            rez();
        }

        request.onupgradeneeded = () => {
            const db = request.result;
            const itemsStore = db.createObjectStore("items", { autoIncrement: true });
            itemsStore.createIndex("recipe", "recipe", { unique: true });
            config.startingItems.forEach(item => {
                itemsStore.add(item, item.id);
            });

            db.createObjectStore("placedItems", { autoIncrement: true });
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
        req.onerror = () => {
            rej(req.error);
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

        const req = store.index("recipe").openCursor();
        req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) {
                const currItem = cursor.value;
                if (currItem.recipe[0] === recipe[0] && currItem.recipe[1] === recipe[1]) {
                    rez(currItem);
                }
                cursor.continue();
            } else {
                rej("Item not found");
                return;
            }
        }
        req.onerror = () => {
            rej(req.error);
        }
    })
}

export function getAllPlacedItems() {
    return new Promise<PlacedItem[]>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
            return;
        }

        const store = getObjectStore("placedItems", "readonly");
        if (store === null) {
            return;
        }

        const req = store.getAll();
        req.onerror = () => {
            rej(req.error);
        }
        req.onsuccess = () => {
            rez(req.result);
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

        const req = store.add(item);
        req.onerror = () => {
            rej(req.error);
        }
        req.onsuccess = () => {
            const id = req.result as number;
            store.put({ ...item, id }, id);
            rez(id);
        }
    })
}

export function addPlacedItem(item: PlacedItem) {
    return new Promise<number>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
        }

        const store = getObjectStore("placedItems", "readwrite");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const req = store.add(item);
        req.onerror = () => {
            rej(req.error);
        }
        req.onsuccess = () => {
            const id = req.result as number;
            store.put({ ...item, id }, id);
            rez(id);
        }
    });
}

export function removePlacedItem(id: number) {
    return new Promise<void>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
        }

        const store = getObjectStore("placedItems", "readwrite");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const req = store.delete(id);
        req.onerror = () => {
            rej(req.error);
        }
        req.onsuccess = () => {
            rez();
        }
    })
}

export function updatePlacedItem(newItem: PlacedItem, id: number) {
    return new Promise<void>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
        }

        const store = getObjectStore("placedItems", "readwrite");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const req = store.put(newItem, id);
        req.onerror = () => {
            rej(req.error);
        }
        req.onsuccess = () => {
            rez();
        }
    })
}

function getObjectStore(name: "items" | "placedItems", mode: "readonly" | "readwrite") {
    if (db === null) {
        console.error("DB not initialized");
        return null;
    }

    const tx = db.transaction(name, mode);
    return tx.objectStore(name);
}
