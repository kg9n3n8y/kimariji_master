import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  clearTestHomeResult,
  peekTestHomeResult,
} from '@/features/beginner/beginnerSession';
import type { BeginnerTestHomeState } from '@/features/beginner/types';
import {
  loadOneMinuteBest,
  ONE_MINUTE_MIN_LEARNED,
} from '@/features/one-minute/oneMinuteStorage';
import { HowToModal } from '@/features/home/HowToModal';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { useLearned } from '@/stores/LearnedContext';
import styles from '@/features/home/HomePage.module.css';

const TOTAL_FUDA = 100;
const SHARE_URL = 'https://kg9n3n8y.github.io/kimariji_master/';
const COPY_FEEDBACK_MS = 2000;

export function HomePage() {
  const { learnedCount } = useLearned();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const [celebration] = useState<BeginnerTestHomeState | null>(
    () => peekTestHomeResult(),
  );
  const [meterCount, setMeterCount] = useState(() => {
    const pending = peekTestHomeResult();
    return pending ? pending.previousLearnedCount : learnedCount;
  });

  useEffect(() => {
    if (!celebration) {
      setMeterCount(learnedCount);
      return;
    }

    clearTestHomeResult();

    const timer = window.setTimeout(() => {
      setMeterCount(learnedCount);
    }, 80);

    return () => window.clearTimeout(timer);
    // テスト直後の1回だけメーターをアニメーション
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!celebration) {
      setMeterCount(learnedCount);
    }
  }, [celebration, learnedCount]);

  const oneMinuteBest = loadOneMinuteBest();
  const oneMinuteReady = learnedCount >= ONE_MINUTE_MIN_LEARNED;
  const oneMinuteRemaining = Math.max(0, ONE_MINUTE_MIN_LEARNED - learnedCount);
  const checkReady = learnedCount > 0;
  const allLearned = learnedCount >= TOTAL_FUDA;
  const meterPercent = (meterCount / TOTAL_FUDA) * 100;
  const newlyLearned = celebration
    ? learnedCount - celebration.previousLearnedCount
    : 0;

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current !== null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setUrlCopied(true);
      if (copyFeedbackTimerRef.current !== null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
      }
      copyFeedbackTimerRef.current = window.setTimeout(() => {
        copyFeedbackTimerRef.current = null;
        setUrlCopied(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      window.alert('URLのコピーに失敗しました。');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>決まり字マスター</h1>
          <p className={styles.progress} aria-live="polite">
            覚えた: {meterCount} / {TOTAL_FUDA} 首
            {celebration && newlyLearned > 0 && (
              <span className={styles.progressGain}>+{newlyLearned} 首</span>
            )}
          </p>
        </div>
      </header>

      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={`${styles.progressFill} ${celebration ? styles.progressFillAnimate : ''}`}
          style={{ width: `${meterPercent}%` }}
        />
      </div>

      <div className={styles.modeGrid}>
        <Link
          className={`${styles.card} ${styles.cardBeginner}`}
          to="/beginner"
        >
          <span className={styles.cardIcon} aria-hidden="true">
            🌱
          </span>
          <span className={styles.cardTitle}>
            {allLearned ? 'おてがる復習' : '５首おぼえる'}
          </span>
          <span className={styles.cardCaption}>
            {allLearned ? '5首の復習テスト' : '5首ずつ覚えてテスト'}
          </span>
        </Link>

        <Link className={`${styles.card} ${styles.cardStudy}`} to="/study">
          <span className={styles.cardIcon} aria-hidden="true">
            📚
          </span>
          <span className={styles.cardTitle}>選んで学ぶ</span>
          <span className={styles.cardCaption}>自分で札を選んで学習</span>
        </Link>

        {checkReady ? (
          <Link className={`${styles.card} ${styles.cardCheck}`} to="/check">
            <span className={styles.cardIcon} aria-hidden="true">
              🎴
            </span>
            <span className={styles.cardTitle}>札流しモード</span>
            <span className={styles.cardCaption}>
              {allLearned
                ? '上下が逆向きの札も混ざるよ'
                : '今までに覚えた札を確認'}
            </span>
          </Link>
        ) : (
          <div
            className={`${styles.card} ${styles.cardCheck} ${styles.cardDisabled}`}
            aria-disabled="true"
          >
            <span className={styles.cardIcon} aria-hidden="true">
              🎴
            </span>
            <span className={styles.cardTitle}>札流しモード</span>
            <span className={styles.cardCaption}>覚えた札が必要です</span>
          </div>
        )}

        {oneMinuteReady ? (
          <Link className={`${styles.card} ${styles.cardOneMinute}`} to="/one-minute">
            <span className={styles.cardIcon} aria-hidden="true">
              ⏱
            </span>
            <span className={styles.cardTitle}>1分間確認</span>
            <span className={styles.cardCaption}>
              {oneMinuteBest > 0
                ? `ベスト: ${oneMinuteBest}点`
                : '60秒チャレンジ'}
            </span>
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

        <button
          type="button"
          className={`${styles.card} ${styles.cardUtility} ${styles.cardHowTo}`}
          aria-haspopup="dialog"
          aria-expanded={howToOpen}
          onClick={() => setHowToOpen(true)}
        >
          <span className={styles.cardIcon} aria-hidden="true">
            📖
          </span>
          <span className={styles.cardTitle}>使い方</span>
        </button>

        <button
          type="button"
          className={`${styles.card} ${styles.cardUtility} ${styles.cardSettings}`}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <span className={styles.cardIcon} aria-hidden="true">
            ⚙️
          </span>
          <span className={styles.cardTitle}>設定</span>
        </button>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.copyUrlButton}
          onClick={() => void handleCopyUrl()}
          aria-label={`アプリのURL（${SHARE_URL}）をコピー`}
        >
          {urlCopied ? 'コピーしました！' : '📋 URLをコピー'}
        </button>
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
      </footer>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <HowToModal open={howToOpen} onClose={() => setHowToOpen(false)} />
    </div>
  );
}
