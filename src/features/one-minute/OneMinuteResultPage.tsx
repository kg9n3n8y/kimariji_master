import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  clearOneMinuteResult,
  peekOneMinuteResult,
} from '@/features/one-minute/oneMinuteStorage';
import styles from '@/features/one-minute/OneMinuteResultPage.module.css';

export function OneMinuteResultPage() {
  const result = peekOneMinuteResult();

  useEffect(() => {
    if (result) {
      clearOneMinuteResult();
    }
  }, [result]);

  if (!result) {
    return <Navigate to="/one-minute" replace />;
  }

  const { score, previousBest, isNewBest } = result;

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>タイムアップ！</h1>
      <p className={styles.score}>
        60秒で <strong>{score}</strong> 点！
      </p>

      {isNewBest ? (
        <p className={styles.bestNew}>🎉 ベスト更新！</p>
      ) : previousBest > 0 ? (
        <p className={styles.best}>
          ベスト記録: {previousBest} 点
          {score < previousBest && `（あと ${previousBest - score} 点）`}
        </p>
      ) : null}

      <Link className={styles.primary} to="/one-minute">
        もう一度
      </Link>
      <Link className={styles.secondary} to="/">
        ホームへ
      </Link>
    </section>
  );
}
