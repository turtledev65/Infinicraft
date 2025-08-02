export type Item = {
    emoji: string;
    name: string;
};

export type Combination = {
    idx1: number;
    idx2: number;
    resultIdx: number;
}

export type Config = {
    startingItems: Item[];
    startingCombinations?: Combination[];
};
