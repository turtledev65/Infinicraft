export type Item = {
    emoji: string;
    name: string;
    id: number;
    recipe?: [number, number];
};

export type Config = {
    startingItems: Item[];
};
