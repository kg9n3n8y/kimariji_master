import { useEffect, useState, type ReactNode } from 'react';
import {
  ensureOfflineAssetsCached,
  isAssetPrecacheDone,
} from '@/pwa/precacheAssets';
import styles from '@/components/AssetPrecacheGate.module.css';

type AssetPrecacheGateProps = {
  children: ReactNode;
};

export function AssetPrecacheGate({ children }: AssetPrecacheGateProps) {
  const skipInDev = import.meta.env.DEV;
  const [ready, setReady] = useState(skipInDev || isAssetPrecacheDone());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    if (skipInDev || ready) {
      return;
    }

    let cancelled = false;

    void ensureOfflineAssetsCached((done, total) => {
      if (!cancelled) {
        setProgress({ done, total });
      }
    })
      .catch(() => {
        // 一部失敗してもアプリは使えるようにする
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ready, skipInDev]);

  if (ready) {
    return children;
  }

  const percent =
    progress && progress.total > 0 ?
      Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <div className={styles.overlay} aria-live="polite" aria-busy="true">
        <div className={styles.panel}>
          <h1 className={styles.title}>オフライン用データを準備中</h1>
          <p className={styles.message}>
            札画像と語呂合わせスライドを端末に保存しています。初回のみ少し時間がかかります。
          </p>
          {progress ? (
            <>
              <p className={styles.progress}>
                {progress.done} / {progress.total}
              </p>
              <div className={styles.bar} aria-hidden="true">
                <div
                  className={styles.barFill}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </>
          ) : (
            <p className={styles.progress}>準備を開始しています…</p>
          )}
        </div>
      </div>
  );
}
