import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildQuestionsForBatch,
  buildQuestionsForPractice,
  buildQuestionsForReview,
} from '@/features/quiz/buildQuestions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  QuizPlayer,
  type QuizAnswerRecord,
} from '@/features/quiz/QuizPlayer';
import { pickReviewBatch } from '@/lib/beginnerBatch';
import { useLearned } from '@/stores/LearnedContext';
import { loadLearnedAt } from '@/stores/learnedAtStore';
import {
  getLearnedFuda,
  loadLearnedState,
} from '@/stores/learnedStore';
import { useBeginnerSession } from '@/features/beginner/BeginnerSessionContext';
import {
  clearBeginnerSession,
  saveTestHomeResult,
} from '@/features/beginner/beginnerSession';
import type { BeginnerTestHomeState } from '@/features/beginner/types';
import type { Fuda } from '@/types/fuda';
import styles from '@/features/beginner/BeginnerQuizPage.module.css';

type QuizSegment = 'main' | 'review' | 'retest';

function pickRetestBatch(records: QuizAnswerRecord[]): Fuda[] {
  return records.filter((record) => !record.isCorrect).map((record) => record.correct);
}

export function BeginnerQuizPage() {
  const navigate = useNavigate();
  const { batch, session } = useBeginnerSession();
  const { unlearnedFuda, markLearned, learnedCount } = useLearned();
  const learnedAtQuizStartRef = useRef(learnedCount);
  const completingRef = useRef(false);
  const mainRecordsRef = useRef<QuizAnswerRecord[]>([]);
  const reviewRecordsRef = useRef<QuizAnswerRecord[]>([]);

  const [segment, setSegment] = useState<QuizSegment>('main');
  const [reviewBatch, setReviewBatch] = useState<Fuda[]>([]);
  const [retestBatch, setRetestBatch] = useState<Fuda[]>([]);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const isPractice = session?.mode === 'practice';
  const batchKey = session?.batchNos.join(',') ?? '';
  const mainQuestions = useMemo(() => {
    if (batch.length === 0) {
      return [];
    }
    if (isPractice) {
      const learned = getLearnedFuda(loadLearnedState());
      return buildQuestionsForPractice(batch, learned);
    }
    return buildQuestionsForBatch(batch, unlearnedFuda);
    // unlearnedFuda は意図的に依存配列から除外
  }, [batch, batchKey, isPractice]);

  const reviewKey = reviewBatch.map((f) => f.no).join(',');
  const reviewQuestions = useMemo(() => {
    if (reviewBatch.length === 0) {
      return [];
    }
    const learned = getLearnedFuda(loadLearnedState());
    return buildQuestionsForReview(reviewBatch, learned);
    // reviewBatch 確定後に一度だけ生成
  }, [reviewBatch, reviewKey]);

  const retestKey = retestBatch.map((f) => f.no).join(',');
  const retestQuestions = useMemo(() => {
    if (retestBatch.length === 0) {
      return [];
    }
    return buildQuestionsForBatch(retestBatch, unlearnedFuda);
    // unlearnedFuda は意図的に依存配列から除外
  }, [retestBatch, retestKey]);

  const finishAll = useCallback(
    (
      mainRecords: QuizAnswerRecord[],
      reviewRecords: QuizAnswerRecord[] = [],
    ) => {
      completingRef.current = true;

      const allRecords = [...mainRecords, ...reviewRecords];
      const homeState: BeginnerTestHomeState = {
        correctCount: mainRecords.filter((r) => r.isCorrect).length,
        total: mainRecords.length,
        reviewCorrectCount:
          reviewRecords.length > 0 ?
            reviewRecords.filter((r) => r.isCorrect).length
          : undefined,
        reviewTotal:
          reviewRecords.length > 0 ? reviewRecords.length : undefined,
        previousLearnedCount: learnedAtQuizStartRef.current,
        incorrectKimariji: allRecords
          .filter((r) => !r.isCorrect)
          .map((r) => r.correct.kimariji),
      };

      saveTestHomeResult(homeState);
      clearBeginnerSession();
      navigate('/', { replace: true });
    },
    [navigate],
  );

  const proceedAfterReview = useCallback(
    (reviewRecords: QuizAnswerRecord[] = []) => {
      reviewRecordsRef.current = reviewRecords;
      const retest = pickRetestBatch(mainRecordsRef.current);

      if (retest.length === 0) {
        finishAll(mainRecordsRef.current, reviewRecords);
        return;
      }

      setRetestBatch(retest);
      setSegment('retest');
    },
    [finishAll],
  );

  useEffect(() => {
    if (completingRef.current) {
      return;
    }
    if (!session || batch.length === 0) {
      navigate('/beginner', { replace: true });
    }
  }, [batch.length, navigate, session]);

  useEffect(() => {
    if (
      segment === 'review' &&
      reviewBatch.length > 0 &&
      reviewQuestions.length === 0 &&
      !completingRef.current
    ) {
      proceedAfterReview();
    }
  }, [proceedAfterReview, reviewBatch.length, reviewQuestions.length, segment]);

  useEffect(() => {
    if (
      segment === 'retest' &&
      retestBatch.length > 0 &&
      retestQuestions.length === 0 &&
      !completingRef.current
    ) {
      finishAll(mainRecordsRef.current, reviewRecordsRef.current);
    }
  }, [finishAll, retestBatch.length, retestQuestions.length, segment]);

  if (!session || batch.length === 0) {
    return null;
  }

  const handleMainAnswer = (record: QuizAnswerRecord) => {
    if (record.isCorrect) {
      markLearned(record.correct.no, true);
    }
  };

  const handleMainComplete = (records: QuizAnswerRecord[]) => {
    mainRecordsRef.current = records;

    if (isPractice) {
      finishAll(records);
      return;
    }

    const learned = getLearnedFuda(loadLearnedState());
    const review = pickReviewBatch(learned, loadLearnedAt());

    if (review.length === 0) {
      proceedAfterReview();
      return;
    }

    setReviewBatch(review);
    setSegment('review');
  };

  const handleReviewComplete = (records: QuizAnswerRecord[]) => {
    proceedAfterReview(records);
  };

  const handleRetestAnswer = (record: QuizAnswerRecord) => {
    if (record.isCorrect) {
      markLearned(record.correct.no, true);
    }
  };

  const handleRetestComplete = () => {
    finishAll(mainRecordsRef.current, reviewRecordsRef.current);
  };

  const handleBackToTop = () => {
    setExitConfirmOpen(true);
  };

  const handleExitConfirm = () => {
    setExitConfirmOpen(false);
    completingRef.current = true;
    clearBeginnerSession();
    navigate('/', { replace: true });
  };

  if (segment === 'main' && mainQuestions.length === 0) {
    return (
      <section className={styles.page}>
        <p className={styles.error}>
          テストを作成できませんでした。もう一度お試しください。
        </p>
      </section>
    );
  }

  if (segment === 'review' && reviewQuestions.length === 0) {
    return null;
  }

  if (segment === 'retest' && retestQuestions.length === 0) {
    return null;
  }

  return (
    <section className={styles.page}>
      {segment === 'main' ? (
        <QuizPlayer
          key={`main-${batchKey}`}
          questions={mainQuestions}
          layout="beginner"
          onBackToTop={handleBackToTop}
          incorrectAdvance="manual"
          onAnswer={handleMainAnswer}
          onComplete={handleMainComplete}
        />
      ) : segment === 'review' ? (
        <QuizPlayer
          key={`review-${reviewKey}`}
          questions={reviewQuestions}
          layout="beginner"
          progressPrefix="復習"
          progressTheme="review"
          onBackToTop={handleBackToTop}
          incorrectAdvance="manual"
          onComplete={handleReviewComplete}
        />
      ) : (
        <QuizPlayer
          key={`retest-${retestKey}`}
          questions={retestQuestions}
          layout="beginner"
          progressPrefix="再出題"
          progressTheme="retest"
          onBackToTop={handleBackToTop}
          incorrectAdvance="manual"
          onAnswer={handleRetestAnswer}
          onComplete={handleRetestComplete}
        />
      )}

      <ConfirmDialog
        open={exitConfirmOpen}
        message={'途中でやめると結果は保存されません。\nトップに戻りますか？'}
        onConfirm={handleExitConfirm}
        onCancel={() => setExitConfirmOpen(false)}
      />
    </section>
  );
}
