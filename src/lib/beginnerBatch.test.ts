import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import {
  pickNewLearnBatch,
  pickPracticeTestBatch,
  pickReviewBatch,
  REVIEW_INTERVAL_MS,
} from '@/lib/beginnerBatch';

describe('pickNewLearnBatch', () => {
  it('selects unlearned fuda in ascending studyOrder', () => {
    const unlearned = [...fudalist].sort((a, b) => b.studyOrder - a.studyOrder);
    const batch = pickNewLearnBatch(unlearned, 5);
    expect(batch).toHaveLength(5);

    for (let i = 1; i < batch.length; i += 1) {
      expect(batch[i]!.studyOrder).toBeGreaterThanOrEqual(
        batch[i - 1]!.studyOrder,
      );
    }

    const expected = [...unlearned]
      .sort((a, b) => a.studyOrder - b.studyOrder)
      .slice(0, 5)
      .map((f) => f.no);
    expect(batch.map((f) => f.no)).toEqual(expected);
  });

  it('returns all items when fewer than count', () => {
    const unlearned = fudalist.slice(0, 3);
    expect(pickNewLearnBatch(unlearned, 5)).toHaveLength(3);
  });
});

describe('pickReviewBatch', () => {
  const now = 1_000_000_000_000;

  it('picks oldest learned fuda after interval', () => {
    const learned = fudalist.slice(0, 5);
    const learnedAt: Record<string, number> = {
      '1': now - REVIEW_INTERVAL_MS - 1000,
      '2': now - REVIEW_INTERVAL_MS - 500,
      '3': now - 1000,
      '4': now - REVIEW_INTERVAL_MS - 2000,
      '5': now - REVIEW_INTERVAL_MS - 1500,
    };

    const review = pickReviewBatch(learned, learnedAt, { now, maxCount: 3 });
    expect(review.map((f) => f.no)).toEqual([4, 5, 1]);
  });

  it('treats missing learnedAt as eligible for review', () => {
    const learned = fudalist.slice(0, 2);
    const review = pickReviewBatch(learned, {}, { now });
    expect(review).toHaveLength(2);
  });
});

describe('pickPracticeTestBatch', () => {
  const now = 1_000_000_000_000;

  it('prioritizes oldest fuda learned 24h+ ago', () => {
    const learned = fudalist.slice(0, 8);
    const learnedAt: Record<string, number> = {
      '1': now - REVIEW_INTERVAL_MS - 5000,
      '2': now - REVIEW_INTERVAL_MS - 4000,
      '3': now - REVIEW_INTERVAL_MS - 3000,
      '4': now - REVIEW_INTERVAL_MS - 2000,
      '5': now - REVIEW_INTERVAL_MS - 1000,
      '6': now - 1000,
      '7': now - 1000,
      '8': now - 1000,
    };

    const batch = pickPracticeTestBatch(learned, learnedAt, { now });
    expect(batch.map((f) => f.no)).toEqual([1, 2, 3, 4, 5]);
  });

  it('fills remaining slots randomly when review pool is smaller than 5', () => {
    const learned = fudalist.slice(0, 6);
    const learnedAt: Record<string, number> = {
      '1': now - REVIEW_INTERVAL_MS - 2000,
      '2': now - REVIEW_INTERVAL_MS - 1000,
      '3': now - 1000,
      '4': now - 1000,
      '5': now - 1000,
      '6': now - 1000,
    };

    const batch = pickPracticeTestBatch(learned, learnedAt, { now });
    expect(batch).toHaveLength(5);
    expect(batch[0]!.no).toBe(1);
    expect(batch[1]!.no).toBe(2);
    expect(new Set(batch.map((f) => f.no)).size).toBe(5);
  });

  it('picks random batch when no fuda are review-eligible', () => {
    const learned = fudalist.slice(0, 10);
    const learnedAt: Record<string, number> = Object.fromEntries(
      learned.map((fuda) => [String(fuda.no), now - 1000]),
    );

    const batch = pickPracticeTestBatch(learned, learnedAt, { now });
    expect(batch).toHaveLength(5);
    expect(new Set(batch.map((f) => f.no)).size).toBe(5);
  });
});
