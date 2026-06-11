/** 1分間確認モード: 通常正解の基本点 */
export const ONE_MINUTE_BASE_POINTS = 10;

/** 連続正解ボーナス（2連続で+1、3連続で+2…）を加えた得点 */
export function scoreOneMinuteCorrect(streak: number): number {
  if (streak < 1) {
    return 0;
  }
  const bonus = streak >= 2 ? streak - 1 : 0;
  return ONE_MINUTE_BASE_POINTS + bonus;
}
