export type OneMinuteResultState = {
  score: number;
  previousBest: number;
  isNewBest: boolean;
};

export type OneMinuteHistoryEntry = {
  score: number;
  playedAt: string;
};
