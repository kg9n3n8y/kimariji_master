import { useCallback, useEffect, useRef, useState } from 'react';
import {
  detectPwaInstallPlatform,
  getPwaInstallInstructions,
  isBeforeInstallPromptEvent,
  markPwaInstallPromptSeen,
  shouldOfferPwaInstallPrompt,
  type BeforeInstallPromptEvent,
} from '@/pwa/pwaInstall';
import styles from '@/components/PwaInstallPrompt.module.css';

const SHOW_DELAY_MS = 900;

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const instructions = getPwaInstallInstructions(detectPwaInstallPlatform());

  const dismiss = useCallback(() => {
    markPwaInstallPromptSeen();
    setVisible(false);
  }, []);

  const scheduleShow = useCallback(() => {
    if (!shouldOfferPwaInstallPrompt() || isQuizActive) {
      return;
    }

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null;
      if (!shouldOfferPwaInstallPrompt() || isQuizActive) {
        return;
      }
      setVisible(true);
    }, SHOW_DELAY_MS);
  }, [isQuizActive]);

  useEffect(() => {
    if (!shouldOfferPwaInstallPrompt()) {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanNativeInstall(true);
      scheduleShow();
    };

    const onQuizState = (event: Event) => {
      const custom = event as CustomEvent<{ active: boolean }>;
      setIsQuizActive(custom.detail.active);
    };

    const onAppInstalled = () => {
      markPwaInstallPromptSeen();
      deferredPromptRef.current = null;
      setCanNativeInstall(false);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('quiz-active-change', onQuizState as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);
    scheduleShow();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener(
        'quiz-active-change',
        onQuizState as EventListener,
      );
      window.removeEventListener('appinstalled', onAppInstalled);
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, [scheduleShow]);

  useEffect(() => {
    if (!isQuizActive && shouldOfferPwaInstallPrompt() && !visible) {
      scheduleShow();
    }
    if (isQuizActive && showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, [isQuizActive, scheduleShow, visible]);

  const handleInstall = async () => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) {
      dismiss();
      return;
    }

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // prompt 非対応・ユーザー操作中断はそのまま閉じる
    } finally {
      deferredPromptRef.current = null;
      setCanNativeInstall(false);
      dismiss();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="閉じる"
        onClick={dismiss}
      />
      <div className={styles.sheetWrap}>
        <section
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <h2 id="pwa-install-title" className={styles.title}>
            📲 ホーム画面に追加しよう
          </h2>
          <p className={styles.lead}>オフラインでも練習できます</p>
          <p className={styles.steps}>{instructions}</p>
          <div className={styles.actions}>
            {canNativeInstall ? (
              <button
                type="button"
                className={styles.primary}
                onClick={() => void handleInstall()}
              >
                インストール
              </button>
            ) : (
              <button type="button" className={styles.primary} onClick={dismiss}>
                わかった
              </button>
            )}
            <button type="button" className={styles.secondary} onClick={dismiss}>
              後で
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
