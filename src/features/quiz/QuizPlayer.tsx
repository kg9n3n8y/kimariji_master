import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { BackNavButton } from '@/components/BackNavButton';
import {
  ProgressBadge,
  type ProgressBadgeTheme,
} from '@/components/ProgressBadge';
import { goroSlideUrl } from '@/lib/assets';
import { preloadQuizQuestionImages, quizChoiceImageUrl } from '@/lib/quiz';
import {
  playCorrectSound,
  playIncorrectSound,
  unlockAudio,
} from '@/lib/sound';
import type { Fuda, QuizQuestion } from '@/types/fuda';
import styles from '@/features/quiz/QuizPlayer.module.css';

const FEEDBACK_MS = 500;

export type QuizAnswerRecord = {
  correct: Fuda;
  selected: Fuda | null;
  isCorrect: boolean;
};

type QuizPlayerProps = {
  questions: QuizQuestion[];
  scoreLabel?: string;
  progressLabel?: string;
  progressPrefix?: string;
  /** 初心者モードの進捗バッジ配色 */
  progressTheme?: ProgressBadgeTheme;
  timerSlot?: ReactNode;
  /** 初心者モード用: スコア非表示・進捗をヘッダー右上・トップ戻る */
  layout?: 'default' | 'beginner';
  onBackToTop?: () => void;
  /** 最終問の正誤表示後、完了コールバックまでの待機（0 で即時） */
  finalFeedbackMs?: number;
  /** 不正解時に語呂確認後に手動で次へ進む */
  incorrectAdvance?: 'auto' | 'manual';
  onAnswer?: (record: QuizAnswerRecord) => void;
  onComplete: (records: QuizAnswerRecord[]) => void;
};

type Phase = 'answering' | 'feedback' | 'incorrect-review';

export function QuizPlayer({
  questions,
  scoreLabel,
  progressLabel,
  progressPrefix = '問題',
  progressTheme = 'main',
  timerSlot,
  layout = 'default',
  onBackToTop,
  finalFeedbackMs = FEEDBACK_MS,
  incorrectAdvance = 'auto',
  onAnswer,
  onComplete,
}: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [records, setRecords] = useState<QuizAnswerRecord[]>([]);
  const [selectedNo, setSelectedNo] = useState<number | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<QuizAnswerRecord | null>(
    null,
  );
  const [choicesReady, setChoicesReady] = useState(false);

  const current = questions[index];
  const correctCount = records.filter((r) => r.isCorrect).length;
  const progressText =
    progressLabel ?? `${progressPrefix} ${index + 1} / ${questions.length}`;
  const showQuizChoices = phase === 'answering' || phase === 'feedback';

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('quiz-active-change', { detail: { active: true } }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent('quiz-active-change', { detail: { active: false } }),
      );
    };
  }, []);

  useEffect(() => {
    if (questions.length === 0) {
      return;
    }

    void preloadQuizQuestionImages(questions[0]!);
    if (questions.length > 1) {
      void preloadQuizQuestionImages(questions[1]!);
    }
  }, [questions]);

  useEffect(() => {
    if (!current) {
      return;
    }

    let cancelled = false;
    setChoicesReady(false);

    void preloadQuizQuestionImages(current).then(() => {
      if (!cancelled) {
        setChoicesReady(true);
      }
    });

    const nextQuestion = questions[index + 1];
    if (nextQuestion) {
      void preloadQuizQuestionImages(nextQuestion);
    }

    return () => {
      cancelled = true;
    };
  }, [current, index, questions]);

  const goToNextQuestion = useCallback(
    (nextRecords: QuizAnswerRecord[]) => {
      if (index >= questions.length - 1) {
        if (finalFeedbackMs <= 0) {
          onComplete(nextRecords);
        } else {
          setTimeout(() => onComplete(nextRecords), finalFeedbackMs);
        }
        return;
      }

      setIndex((i) => i + 1);
      setPhase('answering');
      setSelectedNo(null);
      setPendingRecord(null);
    },
    [finalFeedbackMs, index, onComplete, questions.length],
  );

  const commitRecord = useCallback(
    (record: QuizAnswerRecord) => {
      const nextRecords = [...records, record];
      setRecords(nextRecords);
      goToNextQuestion(nextRecords);
    },
    [goToNextQuestion, records],
  );

  const handleSelect = (fuda: Fuda) => {
    if (phase !== 'answering' || !current) {
      return;
    }

    unlockAudio();
    const isCorrect = fuda.no === current.correct.no;
    setSelectedNo(fuda.no);
    setIsCorrectAnswer(isCorrect);
    setPhase('feedback');

    const record: QuizAnswerRecord = {
      correct: current.correct,
      selected: fuda,
      isCorrect,
    };

    if (isCorrect) {
      playCorrectSound();
      onAnswer?.(record);
      const nextRecords = [...records, record];
      setRecords(nextRecords);

      if (index >= questions.length - 1) {
        setTimeout(() => onComplete(nextRecords), finalFeedbackMs);
        return;
      }

      setTimeout(() => {
        setIndex((i) => i + 1);
        setPhase('answering');
        setSelectedNo(null);
      }, FEEDBACK_MS);
      return;
    }

    playIncorrectSound();
    onAnswer?.(record);

    if (incorrectAdvance === 'manual') {
      setPendingRecord(record);
      setTimeout(() => setPhase('incorrect-review'), FEEDBACK_MS);
      return;
    }

    setTimeout(() => commitRecord(record), FEEDBACK_MS);
  };

  const handleConfirmNext = () => {
    if (!pendingRecord) {
      return;
    }
    commitRecord(pendingRecord);
  };

  if (!current) {
    return null;
  }

  const goroImageUrl =
    current.correct.goroImage?.trim() ?
      goroSlideUrl(current.correct.goroImage.trim())
    : '';

  return (
    <div className={`${styles.player} ${styles.playerViewportFit}`}>
      {layout === 'beginner' ? (
        <header className={styles.beginnerHeader}>
          <BackNavButton label="トップ" onClick={() => onBackToTop?.()} />
          <ProgressBadge theme={progressTheme}>{progressText}</ProgressBadge>
        </header>
      ) : (
        <>
          <div className={styles.header}>
            {timerSlot}
            <div className={styles.score}>
              {scoreLabel ?? '正解'} {correctCount}
              <span className={styles.scoreDivider}>/</span>
              {questions.length}
            </div>
          </div>
          <p className={styles.progress}>{progressText}</p>
        </>
      )}

      {showQuizChoices && (
        <div className={styles.quizStage}>
          <h2 className={styles.kimariji}>{current.correct.kimariji}</h2>

          {!choicesReady ?
            <p className={styles.preparingChoices} aria-live="polite">
              札を準備中…
            </p>
          : <div className={styles.grid}>
              {current.choices.map((fuda) => {
                const isSelected = selectedNo === fuda.no;
                const isCorrectCard = fuda.no === current.correct.no;

                const showCorrectHighlight =
                  phase !== 'answering' && isCorrectCard;
                const showWrongHighlight =
                  phase !== 'answering' && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={`${index}-${fuda.no}`}
                    type="button"
                    className={[
                      styles.choice,
                      showCorrectHighlight ? styles.choiceCorrect : '',
                      showWrongHighlight ? styles.choiceWrong : '',
                      phase !== 'answering' ? styles.choiceLocked : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelect(fuda)}
                    disabled={phase !== 'answering'}
                  >
                    <img
                      src={quizChoiceImageUrl(fuda, current)}
                      alt={`取り札 ${fuda.no}番`}
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          }
        </div>
      )}

      {phase === 'feedback' && (
        <div
          className={`${styles.feedback} ${isCorrectAnswer ? styles.feedbackOk : styles.feedbackNg}`}
          aria-live="assertive"
        >
          <span className={styles.feedbackBadge}>
            {isCorrectAnswer ? '○ 正解！' : '× 不正解'}
          </span>
        </div>
      )}

      {phase === 'incorrect-review' && (
        <div className={styles.incorrectReview}>
          <h2 className={styles.kimariji}>{current.correct.kimariji}</h2>
          <div className={styles.goroSlide}>
            {goroImageUrl ? (
              <img
                className={styles.goroSlideImage}
                src={goroImageUrl}
                alt={`${current.correct.kimariji}の語呂合わせ`}
                draggable={false}
              />
            ) : (
              <p className={styles.goroSlideMissing}>
                この札の覚え方画像は登録されていません
              </p>
            )}
          </div>
          <p className={styles.incorrectReviewMessage}>
            語呂合わせを確認してから次へ進もう
          </p>
          <button
            type="button"
            className={styles.nextButton}
            onClick={handleConfirmNext}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
