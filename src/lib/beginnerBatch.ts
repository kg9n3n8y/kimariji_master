import type { Fuda } from '@/types/fuda';
import { pickRandomBatch } from '@/lib/quiz';

export const BEGINNER_BATCH_SIZE = 5;
export const REVIEW_BATCH_MAX = 3;
export const REVIEW_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** 未覚え札を studyOrder 昇順で最大 count 首選ぶ */
export function pickNewLearnBatch(
  unlearned: readonly Fuda[],
  count = BEGINNER_BATCH_SIZE,
): Fuda[] {
  return [...unlearned]
    .sort((a, b) => a.studyOrder - b.studyOrder)
    .slice(0, Math.min(count, unlearned.length));
}

/**
 * 覚えた札のうち、最後の学習から intervalMs 以上経過したものを
 * 学習日時が古い順に最大 maxCount 首選ぶ
 */
export function pickReviewBatch(
  learned: readonly Fuda[],
  learnedAt: Readonly<Record<string, number>>,
  options?: {
    now?: number;
    maxCount?: number;
    intervalMs?: number;
  },
): Fuda[] {
  const now = options?.now ?? Date.now();
  const maxCount = options?.maxCount ?? REVIEW_BATCH_MAX;
  const intervalMs = options?.intervalMs ?? REVIEW_INTERVAL_MS;

  return [...learned]
    .filter((fuda) => {
      const at = learnedAt[String(fuda.no)] ?? 0;
      return now - at >= intervalMs;
    })
    .sort((a, b) => {
      const atA = learnedAt[String(a.no)] ?? 0;
      const atB = learnedAt[String(b.no)] ?? 0;
      return atA - atB;
    })
    .slice(0, maxCount);
}

/**
 * 100首完走後の復習テスト用。
 * 6時間以上前に覚えた札を古い順に優先し、不足分はランダムで5首まで補充。
 * 該当札がなければ覚えた札からランダム5首。
 */
export function pickPracticeTestBatch(
  learned: readonly Fuda[],
  learnedAt: Readonly<Record<string, number>>,
  options?: {
    now?: number;
    count?: number;
    intervalMs?: number;
  },
): Fuda[] {
  const now = options?.now ?? Date.now();
  const count = options?.count ?? BEGINNER_BATCH_SIZE;
  const intervalMs = options?.intervalMs ?? REVIEW_INTERVAL_MS;

  const reviewEligible = [...learned]
    .filter((fuda) => {
      const at = learnedAt[String(fuda.no)] ?? 0;
      return now - at >= intervalMs;
    })
    .sort((a, b) => {
      const atA = learnedAt[String(a.no)] ?? 0;
      const atB = learnedAt[String(b.no)] ?? 0;
      return atA - atB;
    });

  if (reviewEligible.length === 0) {
    return pickRandomBatch(learned, count);
  }

  const picked = reviewEligible.slice(0, count);
  if (picked.length >= count) {
    return picked;
  }

  const pickedNos = new Set(picked.map((f) => f.no));
  const remaining = learned.filter((f) => !pickedNos.has(f.no));
  const fill = pickRandomBatch(remaining, count - picked.length);
  return [...picked, ...fill];
}
