import type { Fuda, QuizQuestion } from '@/types/fuda';
import { shuffleArray } from '@/lib/shuffle';

export function pickRandomBatch(pool: readonly Fuda[], count: number): Fuda[] {
  if (count <= 0 || pool.length === 0) {
    return [];
  }
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

export function buildDistractorPool(
  correct: Fuda,
  batch: readonly Fuda[],
  unlearned: readonly Fuda[],
  all: readonly Fuda[],
): Fuda[] {
  const excludeNo = correct.no;
  const fromBatch = batch.filter((f) => f.no !== excludeNo);
  const batchNos = new Set(fromBatch.map((f) => f.no));

  const fromUnlearned = unlearned.filter(
    (f) => f.no !== excludeNo && !batchNos.has(f.no),
  );

  const combined = [...fromBatch, ...fromUnlearned];
  if (combined.length >= 3) {
    return combined;
  }

  const combinedNos = new Set(combined.map((f) => f.no));
  const fromAll = all.filter(
    (f) => f.no !== excludeNo && !combinedNos.has(f.no),
  );

  return [...combined, ...fromAll];
}

export function buildQuestion(
  correct: Fuda,
  distractorPool: readonly Fuda[],
  distractorCount = 3,
): QuizQuestion | null {
  const distractors = pickRandomBatch(
    distractorPool.filter((f) => f.no !== correct.no),
    distractorCount,
  );

  if (distractors.length < distractorCount) {
    return null;
  }

  return {
    correct,
    choices: shuffleArray([correct, ...distractors]),
  };
}

export function gradeAnswer(correctNo: number, selectedNo: number): boolean {
  return correctNo === selectedNo;
}
