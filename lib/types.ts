export type LetterEntry = {
  word: string;
  phoneme: string;
  emoji: string;
  color: string;
  filterTheme: {
    shape: string;
    primaryColor: string;
    accentColor: string;
    eyeColor: string;
  };
};

export type NumberEntry = {
  word: string;
  objects: string[];
  color: string;
  funFact: string;
};
