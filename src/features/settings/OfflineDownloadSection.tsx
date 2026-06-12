import { useMemo, useState } from 'react';
import {
  downloadOfflineAssets,
  getOfflineAssetCount,
  isAssetPrecacheDone,
} from '@/pwa/precacheAssets';
import styles from '@/features/settings/OfflineDownloadSection.module.css';

export function OfflineDownloadSection() {
  const skipInDev = import.meta.env.DEV;
  const assetCount = useMemo(() => getOfflineAssetCount(), []);
  const [downloaded, setDownloaded] = useState(
    () => !skipInDev && isAssetPrecacheDone(),
  );
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'downloading'>('idle');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const downloading = phase !== 'idle';
  const percent =
    progress && progress.total > 0 ?
      Math.round((progress.done / progress.total) * 100)
    : 0;

  const handleDownload = () => {
    if (skipInDev || downloading) {
      return;
    }

    setPhase('waiting');
    setProgress(null);

    void downloadOfflineAssets({
      force: downloaded,
      onPhase: (nextPhase) => {
        setPhase(nextPhase === 'waiting-sw' ? 'waiting' : 'downloading');
      },
      onProgress: (done, total) => {
        setProgress({ done, total });
      },
    })
      .catch(() => {
        // 一部失敗しても再試行できるようにする
      })
      .finally(() => {
        setDownloaded(isAssetPrecacheDone());
        setPhase('idle');
        setProgress(null);
      });
  };

  const buttonLabel =
    phase === 'waiting' ? '準備中…'
    : phase === 'downloading' ? 'ダウンロード中…'
    : downloaded ? '再ダウンロード'
    : 'ダウンロード';

  return (
    <div className={styles.card}>
      <div className={styles.text}>
        <h3 className={styles.title}>オフライン用データ</h3>
        <p className={styles.caption}>
          札画像など {assetCount} 件を端末に保存して、オフラインでも使えるようにします。
        </p>
        {skipInDev ?
          <p className={styles.note}>開発環境では利用できません。</p>
        : downloaded && !downloading ?
          <p className={styles.status}>ダウンロード済み</p>
        : null}
        {phase === 'waiting' ?
          <p className={styles.progressText} aria-live="polite">
            準備を開始しています…
          </p>
        : null}
        {phase === 'downloading' && progress ?
          <>
            <p className={styles.progressText} aria-live="polite">
              {progress.done} / {progress.total}（{percent}%）
            </p>
            <div className={styles.bar} aria-hidden="true">
              <div
                className={styles.barFill}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        : null}
      </div>
      <button
        type="button"
        className={styles.button}
        onClick={handleDownload}
        disabled={skipInDev || downloading}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
