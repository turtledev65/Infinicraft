export type Item = {
    emoji: string;
    name: string;
    id: number;
    recipe?: [number, number];
};


export type PlacedItem = {
    x: number;
    y: number;
    item: Item;
    id: number;
}


export type Config = {
    startingItems: Item[];
};
