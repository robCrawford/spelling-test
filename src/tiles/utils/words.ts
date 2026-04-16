const fisherYatesShuffle = (arr: string[]): string[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const shuffleNotInOrder = (letters: string[]): string[] => {
  if (letters.length <= 1) return [...letters];
  let result: string[];
  do {
    result = fisherYatesShuffle(letters);
  } while (result.every((l, i) => l === letters[i]));
  return result;
};
