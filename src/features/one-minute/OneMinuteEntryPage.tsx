import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useLearned } from '@/stores/LearnedContext';
import {
  loadOneMinuteBest,
  ONE_MINUTE_MIN_LEARNED,
} from '@/features/one-minute/oneMinuteStorage';
import styles from '@/features/one-minute/OneMinuteEntryPage.module.css';

export function OneMinuteEntryPage() {
  const { learnedCount } = useLearned();
  const best = loadOneMinuteBest();
  const remaining = Math.max(0, ONE_MINUTE_MIN_LEARNED - learnedCount);

  if (learnedCount < ONE_MINUTE_MIN_LEARNED) {
    return (
      <section className={styles.page}>
        <PageHeader backTo="/" />
        <h1 className={styles.title}>1分間確認</h1>
        <p className={styles.message}>
          100首すべて覚えると挑戦できます。
          <br />
          あと {remaining} 首です。
        </p>
        <Link className={styles.primary} to="/beginner">
          初心者モードで学ぶ
        </Link>
        <Link className={styles.secondary} to="/">
          ホームへ
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <PageHeader backTo="/" />
      <h1 className={styles.title}>1分間確認</h1>
      <p className={styles.message}>
        60秒でどれだけ得点できるかチャレンジ！
        <br />
        覚えた札からランダムに出題します。
      </p>
      {best > 0 && (
        <p className={styles.best}>ベスト記録: {best} 点</p>
      )}
      <Link className={styles.primary} to="/one-minute/play">
        スタート
      </Link>
    </section>
  );
}
