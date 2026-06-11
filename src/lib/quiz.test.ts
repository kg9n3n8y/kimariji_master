import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import {
  assignRandomReverseChoices,
  buildDistractorPool,
  buildOneMinuteQuestion,
  buildQuestion,
  gradeAnswer,
  pickRandomBatch,
  quizChoiceImageUrl,
  uniqueByNo,
} from '@/lib/quiz';
import { fudaImageUrl, fudaReverseImageUrl } from '@/lib/assets';

describe('uniqueByNo', () => {
  it('removes duplicate fuda by number', () => {
    const fuda = fudalist[0];
    const deduped = uniqueByNo([fuda, fuda, fudalist[1]]);
    expect(deduped).toHaveLength(2);
  });
});

describe('pickRandomBatch', () => {
  it('never returns duplicate fuda numbers even from a duplicated pool', () => {
    const fuda = fudalist[0];
    const batch = pickRandomBatch([fuda, fuda, fudalist[1], fudalist[2]], 3);
    expect(new Set(batch.map((f) => f.no)).size).toBe(batch.length);
  });

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

describe('buildOneMinuteQuestion', () => {
  it('creates a question from learned fuda only', () => {
    const learned = fudalist.slice(0, 8);
    const question = buildOneMinuteQuestion(learned);
    expect(question).not.toBeNull();
    expect(question!.choices).toHaveLength(4);
    expect(learned.some((f) => f.no === question!.correct.no)).toBe(true);
    for (const choice of question!.choices) {
      expect(learned.some((f) => f.no === choice.no)).toBe(true);
    }
  });

  it('returns null when learned pool is too small', () => {
    expect(buildOneMinuteQuestion(fudalist.slice(0, 3))).toBeNull();
  });

  it('can mark some choices as reversed when enabled', () => {
    const learned = fudalist.slice(0, 8);
    const question = buildOneMinuteQuestion(learned, { reverseEnabled: true });
    expect(question).not.toBeNull();
    expect(question!.reversedNos).toBeDefined();
    for (const no of question!.reversedNos ?? []) {
      expect(question!.choices.some((f) => f.no === no)).toBe(true);
    }
  });
});

describe('assignRandomReverseChoices', () => {
  it('leaves question unchanged when reverse is disabled', () => {
    const correct = fudalist[0];
    const question = buildQuestion(correct, fudalist.slice(1, 10));
    expect(question).not.toBeNull();
    expect(assignRandomReverseChoices(question!, false)).toEqual(question);
  });
});

describe('quizChoiceImageUrl', () => {
  it('uses reverse image when fuda is in reversedNos', () => {
    const fuda = fudalist[0];
    const question = {
      correct: fuda,
      choices: [fuda],
      reversedNos: new Set([fuda.no]),
    };
    expect(quizChoiceImageUrl(fuda, question)).toBe(fudaReverseImageUrl(fuda));
    expect(quizChoiceImageUrl(fuda, { ...question, reversedNos: undefined })).toBe(
      fudaImageUrl(fuda),
    );
  });
});
