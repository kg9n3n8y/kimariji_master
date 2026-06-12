import type { QuizAnswerRecord } from '@/features/quiz/QuizPlayer';
import type { Fuda } from '@/types/fuda';

/** 5首テスト・復習テストで不正解だった札を、重複なく再出題用にまとめる */
export function pickRetestBatch(
  mainRecords: readonly QuizAnswerRecord[],
  reviewRecords: readonly QuizAnswerRecord[] = [],
): Fuda[] {
  const seen = new Set<number>();
  const result: Fuda[] = [];

  for (const record of [...mainRecords, ...reviewRecords]) {
    if (record.isCorrect || seen.has(record.correct.no)) {
      continue;
    }
    seen.add(record.correct.no);
    result.push(record.correct);
  }

  return result;
}
