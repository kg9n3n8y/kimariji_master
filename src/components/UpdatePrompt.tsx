import { useEffect, useState } from 'react';
import { applyPwaUpdate } from '@/pwa/registerPwa';
import styles from '@/components/UpdatePrompt.module.css';

export function UpdatePrompt() {
  const [visible, setVisible] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);

  useEffect(() => {
    const onNeedRefresh = () => {
      if (!isQuizActive) {
        setVisible(true);
      }
    };

    const onQuizState = (event: Event) => {
      const custom = event as CustomEvent<{ active: boolean }>;
      setIsQuizActive(custom.detail.active);
      if (!custom.detail.active) {
        // プレイ終了後に保留していた更新があれば表示
        window.dispatchEvent(new Event('pwa-check-pending-update'));
      }
    };

    window.addEventListener('pwa-need-refresh', onNeedRefresh);
    window.addEventListener('quiz-active-change', onQuizState as EventListener);

    return () => {
      window.removeEventListener('pwa-need-refresh', onNeedRefresh);
      window.removeEventListener(
        'quiz-active-change',
        onQuizState as EventListener,
      );
    };
  }, [isQuizActive]);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.toast} role="status">
      <p className={styles.message}>新しいバージョンがあります</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setVisible(false)}
        >
          あとで
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => void applyPwaUpdate()}
        >
          更新
        </button>
      </div>
    </div>
  );
}
