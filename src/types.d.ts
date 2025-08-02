export type Item = {
    emoji: string;
    name: string;
    id?: number;
};

export type Combination = {
    id1: number;
    id2: number;
    resultId: number;
}

export type Config = {
    startingItems: Item[];
    startingCombinations?: Combination[];
};
