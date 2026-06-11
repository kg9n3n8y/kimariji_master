import type { Fuda, QuizQuestion } from '@/types/fuda';
import { fudaImageUrl, fudaReverseImageUrl } from '@/lib/assets';
import { shuffleArray } from '@/lib/shuffle';

/** 歌番号で重複を除く（プールに同一札が複数含まれる場合のガード） */
export function uniqueByNo(fudaList: readonly Fuda[]): Fuda[] {
  const seen = new Set<number>();
  const result: Fuda[] = [];
  for (const fuda of fudaList) {
    if (!seen.has(fuda.no)) {
      seen.add(fuda.no);
      result.push(fuda);
    }
  }
  return result;
}

export function pickRandomBatch(pool: readonly Fuda[], count: number): Fuda[] {
  if (count <= 0 || pool.length === 0) {
    return [];
  }
  const unique = uniqueByNo(pool);
  return shuffleArray(unique).slice(0, Math.min(count, unique.length));
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

  const combined = uniqueByNo([...fromBatch, ...fromUnlearned]);
  if (combined.length >= 3) {
    return combined;
  }

  const combinedNos = new Set(combined.map((f) => f.no));
  const fromAll = all.filter(
    (f) => f.no !== excludeNo && !combinedNos.has(f.no),
  );

  return uniqueByNo([...combined, ...fromAll]);
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

  const choices = uniqueByNo([correct, ...distractors]);
  if (choices.length < distractorCount + 1) {
    return null;
  }

  return {
    correct,
    choices: shuffleArray(choices),
  };
}

export function gradeAnswer(correctNo: number, selectedNo: number): boolean {
  return correctNo === selectedNo;
}

/** 各選択肢を独立に50%の確率で逆向き表示にする */
export function assignRandomReverseChoices(
  question: QuizQuestion,
  reverseEnabled: boolean,
): QuizQuestion {
  if (!reverseEnabled) {
    return question;
  }

  const reversedNos = new Set<number>();
  for (const fuda of question.choices) {
    if (Math.random() < 0.5) {
      reversedNos.add(fuda.no);
    }
  }

  return { ...question, reversedNos };
}

export function quizChoiceImageUrl(
  fuda: Fuda,
  question: QuizQuestion,
): string {
  if (question.reversedNos?.has(fuda.no)) {
    return fudaReverseImageUrl(fuda);
  }
  return fudaImageUrl(fuda);
}

/** 1分間確認モード: 覚えた札から正解1枚 + 覚えた札プールからダミー3枚 */
export function buildOneMinuteQuestion(
  learned: readonly Fuda[],
  options?: { reverseEnabled?: boolean },
): QuizQuestion | null {
  if (learned.length < 4) {
    return null;
  }

  const [correct] = pickRandomBatch(learned, 1);
  if (!correct) {
    return null;
  }

  const pool = learned.filter((f) => f.no !== correct.no);
  const question = buildQuestion(correct, pool);
  if (!question) {
    return null;
  }

  return assignRandomReverseChoices(
    question,
    options?.reverseEnabled ?? false,
  );
}
