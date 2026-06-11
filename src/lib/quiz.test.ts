import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import {
  buildDistractorPool,
  buildQuestion,
  gradeAnswer,
  pickRandomBatch,
} from '@/lib/quiz';

describe('pickRandomBatch', () => {
  it('returns at most count items', () => {
    const batch = pickRandomBatch(fudalist, 5);
    expect(batch).toHaveLength(5);
  });

  it('returns all items when pool is smaller than count', () => {
    const pool = fudalist.slice(0, 3);
    const batch = pickRandomBatch(pool, 5);
    expect(batch).toHaveLength(3);
  });
});

describe('buildQuestion', () => {
  it('creates 4 unique choices including correct', () => {
    const correct = fudalist[0];
    const pool = fudalist.slice(1, 20);
    const question = buildQuestion(correct, pool);
    expect(question).not.toBeNull();
    expect(question!.choices).toHaveLength(4);
    const nos = question!.choices.map((f) => f.no);
    expect(new Set(nos).size).toBe(4);
    expect(nos).toContain(correct.no);
  });

  it('returns null when distractors are insufficient', () => {
    const correct = fudalist[0];
    const question = buildQuestion(correct, []);
    expect(question).toBeNull();
  });
});

describe('buildDistractorPool', () => {
  it('prefers batch members then unlearned', () => {
    const batch = fudalist.slice(0, 2);
    const correct = batch[0];
    const unlearned = fudalist.slice(2, 10);
    const pool = buildDistractorPool(correct, batch, unlearned, fudalist);
    expect(pool.length).toBeGreaterThanOrEqual(3);
    expect(pool.every((f) => f.no !== correct.no)).toBe(true);
  });
});

describe('gradeAnswer', () => {
  it('matches by fuda number', () => {
    expect(gradeAnswer(1, 1)).toBe(true);
    expect(gradeAnswer(1, 2)).toBe(false);
  });
});
