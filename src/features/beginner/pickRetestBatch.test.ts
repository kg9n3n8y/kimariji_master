import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import type { QuizAnswerRecord } from '@/features/quiz/QuizPlayer';
import { pickRetestBatch } from '@/features/beginner/pickRetestBatch';

function record(no: number, isCorrect: boolean): QuizAnswerRecord {
  const correct = fudalist.find((f) => f.no === no)!;
  return { correct, selected: null, isCorrect };
}

describe('pickRetestBatch', () => {
  it('merges incorrect answers from main and review without duplicates', () => {
    const main = [record(1, true), record(2, false), record(3, false)];
    const review = [record(2, false), record(4, false)];

    expect(pickRetestBatch(main, review).map((f) => f.no)).toEqual([2, 3, 4]);
  });

  it('returns empty when all answers are correct', () => {
    const main = [record(1, true), record(2, true)];
    expect(pickRetestBatch(main, [])).toEqual([]);
  });
});
