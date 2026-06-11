import { STORAGE_KEYS } from '@/stores/storageKeys';

export type PwaInstallPlatform = 'ios' | 'android' | 'desktop' | 'other';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function isStandalonePwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isPwaInstallPromptSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.pwaInstallPromptSeen) === 'true';
  } catch {
    return false;
  }
}

export function markPwaInstallPromptSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.pwaInstallPromptSeen, 'true');
  } catch {
    // localStorage が使えない環境では何もしない
  }
}

export function shouldOfferPwaInstallPrompt(): boolean {
  return !isStandalonePwa() && !isPwaInstallPromptSeen();
}

export function detectPwaInstallPlatform(
  userAgent = navigator.userAgent,
  platform = navigator.platform,
  maxTouchPoints = navigator.maxTouchPoints,
): PwaInstallPlatform {
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1);

  if (isIOS) {
    return 'ios';
  }
  if (/Android/i.test(userAgent)) {
    return 'android';
  }
  if (/Windows|Macintosh|Linux/i.test(userAgent)) {
    return 'desktop';
  }
  return 'other';
}

export function getPwaInstallInstructions(platform: PwaInstallPlatform): string {
  switch (platform) {
    case 'ios':
      return '画面下の「共有」ボタン（□に↑）をタップ\n「ホーム画面に追加」を選んでください';
    case 'android':
      return 'ブラウザのメニュー（⋮）から\n「アプリをインストール」または「ホーム画面に追加」を選んでください';
    case 'desktop':
      return 'アドレスバー右側のインストールアイコン（⊕や↓）から\n「インストール」を選んでください';
    default:
      return 'ブラウザのメニューから\n「ホーム画面に追加」や「インストール」を探してください';
  }
}

export function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    'prompt' in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === 'function'
  );
}
