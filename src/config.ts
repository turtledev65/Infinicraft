import type { Config, Item } from "./types";

const config: Readonly<Config> = {
    startingItems: [
        { emoji: "💧", name: "water", id: 0 },
        { emoji: "🔥", name: "fire", id: 1 },
        { emoji: " 🌍", name: "earth", id: 2 },
    ],
    prompt: (item1: Item, item2: Item) => `I will give you 2 words and I want you to give me the most plausible outcome of combining these 2 things, even if it's impossible. I want you to only repsond with one word, which is the answer I'm seeking and a string of highly prefferably one emoji which represents the generated word. The emoji/s should be the first things and then a space, followed by the word I'm seeking. NOTHING MORE. The emoji cannot be something that represents one of the original word, it needs to represent the word that is the combination of those 2. I will also give you the emojis that the original words use, but YOU CANNOT USE THEM AT ALL. ALSO DO NOT GIVE ME JUST AN EMOJI, I ALSO WANT TEXT. The 2 words are "${item1.emoji} ${item1.name}" and "${item2.emoji} ${item2.name}"`
}
export default config;
