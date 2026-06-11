export type Fuda = {
  no: number;
  kimariji: string;
  normal: string;
  reverse: string;
  goro: string;
  classification: string;
  upper: string;
  lower: string;
  author: string;
  goroImage: string;
  studyOrder: number;
};

export type QuizQuestion = {
  correct: Fuda;
  choices: Fuda[];
};

export type OneMinuteHistoryEntry = {
  score: number;
  playedAt: number;
};

export type CheckHistoryEntry = {
  timeMs: number;
  cards: number;
  recordedAt: number;
};
