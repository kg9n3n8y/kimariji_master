import { describe, expect, it } from 'vitest';
import { formatKimarijiButtonLabel } from '@/features/settings/formatKimarijiButtonLabel';

describe('formatKimarijiButtonLabel', () => {
  it('3文字ごとに改行する', () => {
    expect(formatKimarijiButtonLabel('わたのはらや')).toBe('わたの\nはらや');
  });

  it('3文字以下はそのまま', () => {
    expect(formatKimarijiButtonLabel('あし')).toBe('あし');
  });

  it('空文字はダッシュ', () => {
    expect(formatKimarijiButtonLabel('')).toBe('—');
  });
});
