import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearned } from '@/stores/LearnedContext';
import { useBeginnerSession } from '@/features/beginner/BeginnerSessionContext';
import styles from '@/features/beginner/BeginnerEntryPage.module.css';

export function BeginnerEntryPage() {
  const navigate = useNavigate();
  const { unlearnedFuda } = useLearned();
  const { startNewSession, startPracticeSession, restoreSession } =
    useBeginnerSession();

  useEffect(() => {
    if (unlearnedFuda.length === 0) {
      const stored = restoreSession();
      if (stored) {
        navigate('/beginner/quiz', { replace: true });
        return;
      }

      const started = startPracticeSession();
      if (started) {
        navigate('/beginner/quiz', { replace: true });
      }
      return;
    }

    const stored = restoreSession();
    if (stored) {
      navigate(
        stored.mode === 'practice' ? '/beginner/quiz' : '/beginner/learn',
        { replace: true },
      );
      return;
    }

    const started = startNewSession();
    if (started) {
      navigate('/beginner/learn', { replace: true });
    }
  }, [
    navigate,
    restoreSession,
    startNewSession,
    startPracticeSession,
    unlearnedFuda.length,
  ]);

  return (
    <section className={styles.page}>
      <p className={styles.loading}>テストを準備しています...</p>
    </section>
  );
}
