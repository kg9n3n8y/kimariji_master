import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  clearCheckCompleteResult,
  peekCheckCompleteResult,
} from '@/features/check/checkSession';
import { formatCheckFinishMessage, formatDuration } from '@/lib/formatTime';
import styles from '@/features/check/CheckResultPage.module.css';

export function CheckResultPage() {
  const result = peekCheckCompleteResult();

  useEffect(() => {
    if (result) {
      clearCheckCompleteResult();
    }
  }, [result]);

  if (!result) {
    return <Navigate to="/check" replace />;
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>
        {formatCheckFinishMessage(result.timeMs)}
      </h1>
      <p className={styles.detail}>
        <strong>{result.cards}</strong> 枚 / {formatDuration(result.timeMs)}
      </p>

      <Link className={styles.primary} to="/check">
        もう一度
      </Link>
      <Link className={styles.secondary} to="/">
        ホームへ
      </Link>
    </section>
  );
}
