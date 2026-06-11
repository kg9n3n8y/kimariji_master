import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { goroSlideUrl } from '@/lib/assets';
import {
  findStudyIndex,
  getStudyFudaByNo,
  getStudyItemsSorted,
} from '@/lib/studyList';
import { useLearned } from '@/stores/LearnedContext';
import styles from '@/features/study/StudyDetailPage.module.css';

const TOTAL_FUDA = 100;

export function StudyDetailPage() {
  const navigate = useNavigate();
  const { fudaNo: fudaNoParam } = useParams<{ fudaNo: string }>();
  const fudaNo = Number.parseInt(fudaNoParam ?? '', 10);
  const { isFudaLearned, toggleLearned } = useLearned();

  const items = useMemo(() => getStudyItemsSorted(), []);
  const fuda = getStudyFudaByNo(fudaNo);
  const index = findStudyIndex(fudaNo);

  if (!fuda || index < 0) {
    return <Navigate to="/study" replace />;
  }

  const learned = isFudaLearned(fuda.no);
  const prevFuda = index > 0 ? items[index - 1] : null;
  const nextFuda = index < items.length - 1 ? items[index + 1] : null;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.backLink} to="/study">
          ← 選んで学ぶ
        </Link>
        <span className={styles.position}>
          {index + 1} / {TOTAL_FUDA}
        </span>
      </header>

      <div className={styles.learnedRow}>
        <button
          type="button"
          className={`${styles.learnedButton} ${learned ? styles.learnedButtonOn : ''}`}
          aria-pressed={learned}
          onClick={() => toggleLearned(fuda.no)}
        >
          {learned ? '✓ 覚えた（タップで解除）' : '覚えた！'}
        </button>
      </div>

      <div className={`${styles.slideCard} ${learned ? styles.learnedCard : ''}`}>
        <img
          className={styles.slideImage}
          src={goroSlideUrl(fuda.goroImage)}
          alt={`${fuda.kimariji}の語呂合わせ`}
        />
      </div>

      <div className={`${styles.infoCard} ${learned ? styles.learnedCard : ''}`}>
        <h1 className={styles.kimariji}>{fuda.kimariji}</h1>

        <dl className={styles.metaList}>
          <div className={styles.metaRow}>
            <dt>上の句</dt>
            <dd>{fuda.upper}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>下の句</dt>
            <dd>{fuda.lower}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>作者</dt>
            <dd>{fuda.author}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>歌番号</dt>
            <dd>{fuda.no}番</dd>
          </div>
        </dl>
      </div>

      <nav className={styles.bottomNav} aria-label="札の移動">
        <button
          type="button"
          className={styles.navButton}
          disabled={!prevFuda}
          onClick={() => prevFuda && navigate(`/study/${prevFuda.no}`)}
        >
          <span className={styles.navArrow}>←</span>
          <span className={styles.navLabel}>前の札</span>
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonPrimary}`}
          disabled={!nextFuda}
          onClick={() => nextFuda && navigate(`/study/${nextFuda.no}`)}
        >
          <span className={styles.navLabel}>次の札</span>
          <span className={styles.navArrow}>→</span>
        </button>
      </nav>
    </section>
  );
}
