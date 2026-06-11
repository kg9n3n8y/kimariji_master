import { describe, expect, it } from 'vitest';
import { scoreOneMinuteCorrect } from '@/features/one-minute/oneMinuteScoring';

describe('scoreOneMinuteCorrect', () => {
  it('1連続正解は10点', () => {
    expect(scoreOneMinuteCorrect(1)).toBe(10);
  });

  it('連続正解ボーナスを加算する', () => {
    expect(scoreOneMinuteCorrect(2)).toBe(11);
    expect(scoreOneMinuteCorrect(3)).toBe(12);
    expect(scoreOneMinuteCorrect(4)).toBe(13);
  });

  it('0以下の連続数は0点', () => {
    expect(scoreOneMinuteCorrect(0)).toBe(0);
    expect(scoreOneMinuteCorrect(-1)).toBe(0);
  });
});
