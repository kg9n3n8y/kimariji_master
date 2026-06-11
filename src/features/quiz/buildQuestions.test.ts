import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import { buildQuestionsForBatch } from '@/features/quiz/buildQuestions';

describe('buildQuestionsForBatch', () => {
  it('creates one question per batch item when possible', () => {
    const batch = fudalist.slice(0, 5);
    const unlearned = fudalist.slice(5, 30);
    const questions = buildQuestionsForBatch(batch, unlearned);
    expect(questions).toHaveLength(5);
    questions.forEach((q) => {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map((f) => f.no)).size).toBe(4);
    });

    const correctNos = questions.map((q) => q.correct.no);
    expect(new Set(correctNos).size).toBe(correctNos.length);
  });
});
