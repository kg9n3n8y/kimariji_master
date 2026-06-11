import { Link } from 'react-router-dom';
import { useLearned } from '@/stores/LearnedContext';
import styles from '@/features/home/HomePage.module.css';

const ONE_MINUTE_MIN = 5;
const TOTAL_FUDA = 100;

export function HomePage() {
  const { learnedCount } = useLearned();
  const oneMinuteReady = learnedCount >= ONE_MINUTE_MIN;
  const oneMinuteRemaining = Math.max(0, ONE_MINUTE_MIN - learnedCount);
  const allLearned = learnedCount >= TOTAL_FUDA;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>決まり字マスター</h1>
          <p className={styles.progress}>
            覚えた: {learnedCount} / {TOTAL_FUDA} 首
          </p>
        </div>
        <button
          type="button"
          className={styles.settingsButton}
          aria-label="設定"
          disabled
          title="設定（実装予定）"
        >
          ⚙️
        </button>
      </header>

      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${(learnedCount / TOTAL_FUDA) * 100}%` }}
        />
      </div>

      <div className={styles.mainCards}>
        <Link
          className={`${styles.card} ${styles.cardBeginner}`}
          to="/beginner"
        >
          <span className={styles.cardIcon} aria-hidden="true">
            🌱
          </span>
          <span className={styles.cardTitle}>
            {allLearned ? '完走おめでとう！' : '初心者モード'}
          </span>
          <span className={styles.cardCaption}>
            {allLearned
              ? '1分間確認で復習しよう'
              : '5首ずつ覚えてテスト'}
          </span>
        </Link>

        {oneMinuteReady ? (
          <Link className={`${styles.card} ${styles.cardOneMinute}`} to="/one-minute">
            <span className={styles.cardIcon} aria-hidden="true">
              ⏱
            </span>
            <span className={styles.cardTitle}>1分間確認</span>
            <span className={styles.cardCaption}>60秒チャレンジ</span>
          </Link>
        ) : (
          <div
            className={`${styles.card} ${styles.cardOneMinute} ${styles.cardDisabled}`}
            aria-disabled="true"
          >
            <span className={styles.cardIcon} aria-hidden="true">
              ⏱
            </span>
            <span className={styles.cardTitle}>1分間確認</span>
            <span className={styles.cardCaption}>
              あと {oneMinuteRemaining} 首で解放
            </span>
          </div>
        )}
      </div>

      <div className={styles.subGrid}>
        <Link className={styles.subCard} to="/check">
          <span className={styles.subTitle}>決まり字チェック</span>
          <span className={styles.subCaption}>連続表示で確認</span>
        </Link>
        <Link className={styles.subCard} to="/study">
          <span className={styles.subTitle}>一覧で学ぶ</span>
          <span className={styles.subCaption}>分類別に復習</span>
        </Link>
      </div>

      <p className={styles.offlineNote}>
        ホーム画面に追加するとオフラインで利用できます
      </p>
      <p className={styles.credit}>
        作者：
        <a
          href="https://sites.google.com/view/hyakunin-issyu-oboekata/"
          target="_blank"
          rel="noopener noreferrer"
        >
          つばさ先輩
        </a>
      </p>
    </div>
  );
}
