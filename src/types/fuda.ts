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
  /** 取り札画像を逆向きで表示する選択肢（1分間確認など） */
  reversedNos?: ReadonlySet<number>;
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
