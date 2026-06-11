import { describe, expect, it } from 'vitest';
import {
  detectPwaInstallPlatform,
  getPwaInstallInstructions,
} from '@/pwa/pwaInstall';

describe('detectPwaInstallPlatform', () => {
  it('iOS を判定する', () => {
    expect(
      detectPwaInstallPlatform(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'iPhone',
        5,
      ),
    ).toBe('ios');
  });

  it('Android を判定する', () => {
    expect(
      detectPwaInstallPlatform(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
        'Linux armv8l',
        5,
      ),
    ).toBe('android');
  });

  it('デスクトップを判定する', () => {
    expect(
      detectPwaInstallPlatform(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'MacIntel',
        0,
      ),
    ).toBe('desktop');
  });
});

describe('getPwaInstallInstructions', () => {
  it('プラットフォーム別の案内文を返す', () => {
    expect(getPwaInstallInstructions('ios')).toContain('ホーム画面に追加');
    expect(getPwaInstallInstructions('android')).toContain('インストール');
    expect(getPwaInstallInstructions('desktop')).toContain('アドレスバー');
  });
});
