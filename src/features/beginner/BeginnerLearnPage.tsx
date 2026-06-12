import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { goroSlideUrl } from '@/lib/assets';
import { unlockAudio } from '@/lib/sound';
import { useBeginnerSession } from '@/features/beginner/BeginnerSessionContext';
import styles from '@/features/beginner/BeginnerLearnPage.module.css';

export function BeginnerLearnPage() {
  const navigate = useNavigate();
  const { session, batch, goNext, goPrev } = useBeginnerSession();

  useEffect(() => {
    if (!session || batch.length === 0) {
      navigate('/beginner', { replace: true });
      return;
    }
    if (session.mode === 'practice') {
      navigate('/beginner/quiz', { replace: true });
    }
  }, [batch.length, navigate, session]);

  if (!session || batch.length === 0) {
    return null;
  }

  const fuda = batch[session.learnIndex];
  if (!fuda) {
    return null;
  }

  const isLast = session.learnIndex >= batch.length - 1;
  const progress = `学習 ${session.learnIndex + 1} / ${batch.length}`;

  const handleNext = () => {
    unlockAudio();
    if (isLast) {
      navigate('/beginner/quiz');
      return;
    }
    goNext();
  };

  return (
    <section className={styles.page}>
      <PageHeader backTo="/" progress={progress} />

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.backButton}
          onClick={goPrev}
          disabled={session.learnIndex === 0}
        >
          戻る
        </button>
        <button type="button" className={styles.nextButton} onClick={handleNext}>
          {isLast ? 'テストへ' : '次へ'}
        </button>
      </div>

      <div className={styles.slide}>
        <img
          className={styles.slideImage}
          src={goroSlideUrl(fuda.goroImage)}
          alt={`${fuda.kimariji}の語呂合わせ`}
        />
      </div>

      <div className={styles.info}>
        <h1 className={styles.kimariji}>{fuda.kimariji}</h1>
        <p className={styles.verse}>{fuda.upper}</p>
        <p className={styles.verse}>{fuda.lower}</p>
        <p className={styles.meta}>
          {fuda.no}番 / {fuda.author}
        </p>
      </div>
    </section>
  );
}
