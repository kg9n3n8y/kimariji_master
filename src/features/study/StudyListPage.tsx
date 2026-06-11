import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { goroThumbnailUrl } from '@/lib/assets';
import {
  getStudyItemsSorted,
  groupStudyItems,
} from '@/lib/studyList';
import {
  categorySectionId,
  countVisibleItems,
  filterStudyGroups,
  loadStudyFilter,
  saveStudyFilter,
  type StudyFilter,
} from '@/features/study/studyListFilter';
import { useLearned } from '@/stores/LearnedContext';
import styles from '@/features/study/StudyListPage.module.css';

const TOTAL_FUDA = 100;

export function StudyListPage() {
  const stickyHeaderRef = useRef<HTMLElement>(null);
  const { isFudaLearned, learnedCount, unlearnedFuda } = useLearned();
  const unlearnedCount = unlearnedFuda.length;
  const [filter, setFilter] = useState<StudyFilter>(loadStudyFilter);

  const allGroups = useMemo(() => groupStudyItems(getStudyItemsSorted()), []);
  const visibleGroups = useMemo(
    () => filterStudyGroups(allGroups, filter, isFudaLearned),
    [allGroups, filter, isFudaLearned],
  );
  const visibleCount = countVisibleItems(visibleGroups);

  const handleFilterChange = (next: StudyFilter) => {
    setFilter(next);
    saveStudyFilter(next);
  };

  const scrollToCategory = (label: string) => {
    const target = document.getElementById(categorySectionId(label));
    const header = stickyHeaderRef.current;
    if (!target || !header) {
      return;
    }
    const offset = header.getBoundingClientRect().height + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  const filters: { id: StudyFilter; label: string; count: number }[] = [
    { id: 'all', label: 'すべて', count: TOTAL_FUDA },
    { id: 'unlearned', label: '覚えてない', count: unlearnedCount },
    { id: 'learned', label: '覚えた', count: learnedCount },
  ];

  return (
    <section className={styles.page}>
      <header ref={stickyHeaderRef} className={styles.stickyHeader}>
        <PageHeader backTo="/" />
        <h1 className={styles.title}>選んで学ぶ</h1>

        <div className={styles.filters} role="tablist" aria-label="表示フィルター">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`${styles.filterChip} ${filter === item.id ? styles.filterChipActive : ''}`}
              onClick={() => handleFilterChange(item.id)}
            >
              {item.label}
              <span className={styles.filterCount}>{item.count}</span>
            </button>
          ))}
        </div>

        {visibleGroups.length > 1 && (
          <div className={styles.categoryJump}>
            {visibleGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                className={styles.categoryChip}
                onClick={() => scrollToCategory(group.label)}
              >
                {group.label.replace(/枚札.*/, '枚')}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className={styles.list}>
        {visibleCount === 0 ? (
          <p className={styles.empty}>この条件の札はありません</p>
        ) : (
          visibleGroups.map((group) => (
            <section
              key={group.label}
              id={categorySectionId(group.label)}
              className={styles.category}
            >
              <h2 className={styles.categoryTitle}>{group.label}</h2>
              <ul className={styles.cardList}>
                {group.items.map((fuda) => {
                  const learned = isFudaLearned(fuda.no);
                  return (
                    <li key={fuda.no}>
                      <Link
                        className={`${styles.card} ${learned ? styles.cardLearned : ''}`}
                        to={`/study/${fuda.no}`}
                        aria-label={
                          learned ?
                            `${fuda.kimariji}（覚えた）`
                          : fuda.kimariji
                        }
                      >
                        <img
                          className={styles.thumbnail}
                          src={goroThumbnailUrl(fuda.goroImage)}
                          alt=""
                          loading="lazy"
                        />
                        <div className={styles.cardBody}>
                          <div className={styles.cardHeader}>
                            <span className={styles.kimariji}>
                              {fuda.kimariji}
                            </span>
                            {learned && (
                              <span className={styles.learnedBadge}>
                                ✓ 覚えた
                              </span>
                            )}
                          </div>
                          <p className={styles.goro}>
                            {fuda.goro || '語呂合わせ情報なし'}
                          </p>
                        </div>
                        <span className={styles.chevron} aria-hidden="true">
                          ›
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
