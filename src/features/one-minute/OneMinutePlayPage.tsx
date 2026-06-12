import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Fuda, QuizQuestion } from '@/types/fuda';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BackNavButton } from '@/components/BackNavButton';
import { buildOneMinuteQuestion, quizChoiceImageUrl } from '@/lib/quiz';
import {
  playCorrectSound,
  playIncorrectSound,
  unlockAudio,
} from '@/lib/sound';
import { useLearned } from '@/stores/LearnedContext';
import {
  ONE_MINUTE_DURATION_SEC,
  ONE_MINUTE_MIN_LEARNED,
  recordOneMinuteScore,
  saveOneMinuteResult,
} from '@/features/one-minute/oneMinuteStorage';
import { scoreOneMinuteCorrect } from '@/features/one-minute/oneMinuteScoring';
import quizStyles from '@/features/quiz/QuizPlayer.module.css';
import styles from '@/features/one-minute/OneMinutePlayPage.module.css';

const FEEDBACK_MS = 500;
const START_COUNTDOWN_SEC = 3;
const COUNTDOWN_INTERVAL_MS = 650;
const EXIT_CONFIRM_MESSAGE =
  '途中でやめるとスコアは記録されません。\nトップに戻りますか？';

type Phase = 'answering' | 'feedback';
type GamePhase = 'countdown' | 'playing';

export function OneMinutePlayPage() {
  const navigate = useNavigate();
  const { learnedFuda, learnedCount } = useLearned();
  const learnedFudaRef = useRef(learnedFuda);
  learnedFudaRef.current = learnedFuda;

  const [gamePhase, setGamePhase] = useState<GamePhase>('countdown');
  const [countdown, setCountdown] = useState(START_COUNTDOWN_SEC);
  const [secondsLeft, setSecondsLeft] = useState(ONE_MINUTE_DURATION_SEC);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const buildQuestion = useCallback(
    () =>
      buildOneMinuteQuestion(learnedFudaRef.current, {
        reverseEnabled: true,
      }),
    [],
  );

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedNo, setSelectedNo] = useState<number | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const endedRef = useRef(false);
  const pendingEndRef = useRef(false);
  const phaseRef = useRef<Phase>(phase);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  phaseRef.current = phase;

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
    if (learnedCount < ONE_MINUTE_MIN_LEARNED) {
      navigate('/', { replace: true });
    }
  }, [learnedCount, navigate]);

  const finishGame = useCallback(() => {
    if (endedRef.current) {
      return;
    }
    endedRef.current = true;

    const result = recordOneMinuteScore(scoreRef.current);
    saveOneMinuteResult(result);
    navigate('/one-minute/result', { replace: true });
  }, [navigate]);

  const startPlaying = useCallback(() => {
    const first = buildQuestion();
    if (!first) {
      endedRef.current = true;
      navigate('/', { replace: true });
      return;
    }
    setQuestion(first);
    setGamePhase('playing');
  }, [buildQuestion, navigate]);

  useEffect(() => {
    if (gamePhase !== 'countdown') {
      return;
    }

    const id = window.setTimeout(() => {
      if (countdown <= 1) {
        startPlaying();
        return;
      }
      setCountdown((current) => current - 1);
    }, COUNTDOWN_INTERVAL_MS);

    return () => window.clearTimeout(id);
  }, [countdown, gamePhase, startPlaying]);

  useEffect(() => {
    if (gamePhase !== 'playing') {
      return;
    }

    unlockAudio();

    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (phaseRef.current === 'answering') {
            finishGame();
          } else {
            pendingEndRef.current = true;
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [finishGame, gamePhase]);

  const advanceAfterFeedback = useCallback(() => {
    if (endedRef.current || pendingEndRef.current) {
      finishGame();
      return;
    }

    const next = buildQuestion();
    if (!next) {
      finishGame();
      return;
    }

    setQuestion(next);
    setPhase('answering');
    setSelectedNo(null);
  }, [buildQuestion, finishGame]);

  const handleBack = () => {
    setExitConfirmOpen(true);
  };

  const handleExitConfirm = () => {
    setExitConfirmOpen(false);
    endedRef.current = true;
    navigate('/', { replace: true });
  };

  const handleSelect = (fuda: Fuda) => {
    if (
      phase !== 'answering' ||
      !question ||
      endedRef.current ||
      secondsLeft <= 0
    ) {
      return;
    }

    unlockAudio();
    const isCorrect = fuda.no === question.correct.no;
    setSelectedNo(fuda.no);
    setIsCorrectAnswer(isCorrect);
    setPhase('feedback');

    if (isCorrect) {
      playCorrectSound();
      streakRef.current += 1;
      setStreak(streakRef.current);
      scoreRef.current += scoreOneMinuteCorrect(streakRef.current);
      setScore(scoreRef.current);
    } else {
      playIncorrectSound();
      streakRef.current = 0;
      setStreak(0);
    }

    window.setTimeout(advanceAfterFeedback, FEEDBACK_MS);
  };

  if (gamePhase === 'countdown') {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <BackNavButton label="トップ" onClick={handleBack} />
        </header>

        <div className={styles.countdownScreen} aria-live="assertive">
          <span key={countdown} className={styles.countdownNumber}>
            {countdown}
          </span>
        </div>

        <ConfirmDialog
          open={exitConfirmOpen}
          message={EXIT_CONFIRM_MESSAGE}
          onConfirm={handleExitConfirm}
          onCancel={() => setExitConfirmOpen(false)}
        />
      </section>
    );
  }

  if (!question) {
    return (
      <section className={styles.page}>
        <p className={styles.error}>出題を準備できませんでした。</p>
      </section>
    );
  }

  const timerUrgent = secondsLeft <= 10;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <BackNavButton label="トップ" onClick={handleBack} />
        <div className={styles.score}>{score}点</div>
      </header>

      <div
        className={`${quizStyles.player} ${quizStyles.playerViewportFit} ${styles.quizPlayer}`}
      >
        <div className={quizStyles.quizStage}>
          <div className={quizStyles.header}>
            <div
              className={`${styles.timer} ${timerUrgent ? styles.timerUrgent : ''}`}
              aria-live="polite"
            >
              残り {secondsLeft}秒
            </div>
            <div className={styles.streakSlot} aria-live="polite">
              {streak >= 2 && (
                <span key={streak} className={styles.streak}>
                  {streak}連続正解！
                </span>
              )}
            </div>
          </div>

          <h2 className={quizStyles.kimariji}>{question.correct.kimariji}</h2>

          <div className={quizStyles.grid}>
            {question.choices.map((fuda) => {
              const isSelected = selectedNo === fuda.no;
              const isCorrectCard = fuda.no === question.correct.no;
              const showCorrectHighlight =
                phase === 'feedback' && isCorrectCard;
              const showWrongHighlight =
                phase === 'feedback' && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={fuda.no}
                  type="button"
                  className={[
                    quizStyles.choice,
                    showCorrectHighlight ? quizStyles.choiceCorrect : '',
                    showWrongHighlight ? quizStyles.choiceWrong : '',
                    phase === 'feedback' ? quizStyles.choiceLocked : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelect(fuda)}
                  disabled={phase === 'feedback'}
                >
                  <img
                    src={quizChoiceImageUrl(fuda, question)}
                    alt={`取り札 ${fuda.no}番`}
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {phase === 'feedback' && (
          <div
            className={`${quizStyles.feedback} ${isCorrectAnswer ? quizStyles.feedbackOk : quizStyles.feedbackNg}`}
            aria-live="assertive"
          >
            <span className={quizStyles.feedbackBadge}>
              {isCorrectAnswer ? '○ 正解！' : '× 不正解'}
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={exitConfirmOpen}
        message={EXIT_CONFIRM_MESSAGE}
        onConfirm={handleExitConfirm}
        onCancel={() => setExitConfirmOpen(false)}
      />
    </section>
  );
}
