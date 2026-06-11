import { describe, expect, it } from 'vitest';
import { formatCheckFinishMessage, formatDuration } from '@/lib/formatTime';

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(4500)).toBe('4秒');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125000)).toBe('2分05秒');
  });
});

describe('formatCheckFinishMessage', () => {
  it('matches v1 alert style', () => {
    expect(formatCheckFinishMessage(125000)).toBe('終わりです。2分5秒でした！');
  });
});
