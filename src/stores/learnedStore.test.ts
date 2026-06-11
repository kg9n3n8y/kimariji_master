import { describe, expect, it } from 'vitest';
import { fudalist } from '@/data/fudalist';
import {
  applyLearnedToLetters,
  areLettersFullyLearned,
  isLetterFullyLearned,
  setAllLearnedState,
  setLearned,
} from '@/stores/learnedStore';

function emptyState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const fuda of fudalist) {
    state[String(fuda.no)] = false;
  }
  return state;
}

describe('learnedStore bulk helpers', () => {
  it('isLetterFullyLearned は文字に紐づく札がすべてオンなら true', () => {
    let state = emptyState();
    state = applyLearnedToLetters(state, ['あ'], true);
    expect(isLetterFullyLearned(state, 'あ')).toBe(true);
    expect(isLetterFullyLearned(state, 'む')).toBe(false);
  });

  it('areLettersFullyLearned は bundle 用に複数文字を判定できる', () => {
    let state = emptyState();
    state = applyLearnedToLetters(
      state,
      ['む', 'す', 'め', 'ふ', 'さ', 'ほ', 'せ'],
      true,
    );
    expect(
      areLettersFullyLearned(state, ['む', 'す', 'め', 'ふ', 'さ', 'ほ', 'せ']),
    ).toBe(true);
  });

  it('setAllLearnedState で全札を一括更新できる', () => {
    const allOn = setAllLearnedState(emptyState(), true);
    expect(Object.values(allOn).every(Boolean)).toBe(true);

    const allOff = setAllLearnedState(allOn, false);
    expect(Object.values(allOff).every((value) => value === false)).toBe(true);
  });

  it('applyLearnedToLetters は既存の他札の状態を維持する', () => {
    let state = setLearned(emptyState(), 1, true);
    state = applyLearnedToLetters(state, ['む'], true);
    expect(state['1']).toBe(true);
  });
});
