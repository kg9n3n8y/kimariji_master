import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { formatCheckFinishMessage, formatDuration } from '@/lib/formatTime';
import {
  clearCheckCompleteResult,
  peekCheckCompleteResult,
} from '@/features/check/checkSession';
import { loadCheckHistory } from '@/stores/checkHistoryStore';
import { useLearned } from '@/stores/LearnedContext';
import type { CheckHistoryEntry } from '@/types/fuda';
import styles from '@/features/check/CheckEntryPage.module.css';

export function CheckEntryPage() {
  const { learnedCount } = useLearned();
  const [history, setHistory] = useState<CheckHistoryEntry[]>(loadCheckHistory);
  const [celebration] = useState(() => peekCheckCompleteResult());

  useEffect(() => {
    if (!celebration) {
      return;
    }
    clearCheckCompleteResult();
    setHistory(loadCheckHistory());
  }, [celebration]);

  const canStart = learnedCount > 0;

  return (
    <section className={styles.page}>
      <PageHeader backTo="/" />

      <h1 className={styles.title}>決まり字チェック</h1>
      <p className={styles.summary}>
        {canStart
          ? `覚えた札: ${learnedCount} 枚`
          : 'チェックする札がありません'}
      </p>
      {!canStart && (
        <p className={styles.hint}>
          初心者モードで覚えた札が出題されます。
        </p>
      )}

      {celebration && (
        <div className={styles.celebration} aria-live="polite">
          <p className={styles.celebrationTitle}>
            {formatCheckFinishMessage(celebration.timeMs)}
          </p>
          <p className={styles.celebrationDetail}>
            {celebration.cards} 枚 / {formatDuration(celebration.timeMs)}
          </p>
        </div>
      )}

      {canStart ? (
        <Link className={styles.primary} to="/check/play">
          チェック開始
        </Link>
      ) : (
        <button type="button" className={styles.primary} disabled>
          チェック開始
        </button>
      )}

      <section className={styles.historyPanel}>
        <h2 className={styles.historyTitle}>直近の決まり字チェック</h2>
        <ul className={styles.historyList}>
          {history.length === 0 ? (
            <li className={styles.historyEmpty}>まだ記録がありません</li>
          ) : (
            history.map((entry, index) => (
              <li key={entry.recordedAt} className={styles.historyItem}>
                <span>{index + 1}回前</span>
                <span>
                  {formatDuration(entry.timeMs)}（{entry.cards}枚）
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </section>
  );
}
