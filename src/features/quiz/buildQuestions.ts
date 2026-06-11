import { fudalist } from '@/data/fudalist';
import type { Fuda, QuizQuestion } from '@/types/fuda';
import {
  buildDistractorPool,
  buildQuestion,
} from '@/lib/quiz';
import { shuffleArray } from '@/lib/shuffle';

export function buildQuestionsForBatch(
  batch: readonly Fuda[],
  unlearned: readonly Fuda[],
): QuizQuestion[] {
  const order = shuffleArray(batch);
  const questions: QuizQuestion[] = [];

  for (const correct of order) {
    const pool = buildDistractorPool(correct, batch, unlearned, fudalist);
    const question = buildQuestion(correct, pool);
    if (question) {
      questions.push(question);
    }
  }

  const correctNos = questions.map((q) => q.correct.no);
  if (new Set(correctNos).size !== correctNos.length) {
    throw new Error('出題リストに重複した正解札が含まれています');
  }

  return questions;
}

/** 復習テスト: 覚えた札プールからダミーを抽選 */
export function buildQuestionsForReview(
  reviewBatch: readonly Fuda[],
  learned: readonly Fuda[],
): QuizQuestion[] {
  const order = shuffleArray(reviewBatch);
  const questions: QuizQuestion[] = [];

  for (const correct of order) {
    const pool = learned.filter((f) => f.no !== correct.no);
    const question = buildQuestion(correct, pool);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/** 100首完走後: 覚えた札プールからダミーを抽選 */
export function buildQuestionsForPractice(
  batch: readonly Fuda[],
  learned: readonly Fuda[],
): QuizQuestion[] {
  const order = shuffleArray(batch);
  const questions: QuizQuestion[] = [];

  for (const correct of order) {
    const pool = learned.filter((f) => f.no !== correct.no);
    const question = buildQuestion(correct, pool);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}
