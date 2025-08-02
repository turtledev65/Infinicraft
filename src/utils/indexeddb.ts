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
            db.createObjectStore("items", { autoIncrement: true });
        }
    })

}


export function getAllItems() {
    const store = getObjectStore("items", "readonly");
    if (store === null) {
        console.error("Store not found");
        return [];
    }

    return store.getAll();
}

export function addItem(item: Item) {
    return new Promise<void>((rez, rej) => {
        if (db === null) {
            rej("DB not initialized");
        }

        const store = getObjectStore("items", "readwrite");
        if (store === null) {
            rej("Store not found");
            return;
        }

        const request = store.add(item, item.name);
        request.onerror = (e) => {
            rej(e.target?.error);
        }
        request.onsuccess = () => {
            rez();
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
