import data from "../../spelling/data";

import { deduplicate } from "../../utils";

// Entries here will be the only words tested
const tempOverrideWords: string[] = [];

const allWords = deduplicate(
  tempOverrideWords.length
    ? tempOverrideWords
    : [
        ...data.year1,
        ...data.year2,
        ...data.year3
        // ...data.year4,
      ]
);

export const getGameWord = (): string => allWords[Math.floor(Math.random() * allWords.length)];
