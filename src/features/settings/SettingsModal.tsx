import { useEffect, useMemo, useRef } from 'react';
import { getStudyItemsSorted } from '@/lib/studyList';
import { LETTER_GROUPS } from '@/lib/letterGroups';
import {
  areLettersFullyLearned,
  isLetterFullyLearned,
} from '@/stores/learnedStore';
import { formatKimarijiButtonLabel } from '@/features/settings/formatKimarijiButtonLabel';
import { OfflineDownloadSection } from '@/features/settings/OfflineDownloadSection';
import { useLearned } from '@/stores/LearnedContext';
import styles from '@/features/settings/SettingsModal.module.css';

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const individualSectionRef = useRef<HTMLElement>(null);
  const {
    learnedState,
    learnedCount,
    isFudaLearned,
    toggleLearned,
    toggleLettersLearned,
    setAllLearned,
  } = useLearned();

  const sortedFuda = useMemo(() => getStudyItemsSorted(), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleEnableAll = () => {
    setAllLearned(true);
  };

  const handleDisableAll = () => {
    setAllLearned(false);
  };

  const scrollToIndividual = () => {
    individualSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="設定を閉じる"
        onClick={onClose}
      />
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <h2 id="settings-modal-title" className={styles.title}>
                覚えた札
              </h2>
              <span className={styles.count} aria-live="polite">
                {learnedCount} / 100 首
              </span>
            </div>
            <button
              type="button"
              className={styles.doneButton}
              onClick={onClose}
            >
              完了
            </button>
          </header>

          <div className={styles.body}>
            <OfflineDownloadSection />

            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>1文字目で選ぶ</h3>
              <button
                type="button"
                className={styles.linkButton}
                onClick={scrollToIndividual}
              >
                個別に選ぶへ
              </button>
            </div>
            <p className={styles.sectionHint}>
              決まり字の先頭文字ごとにまとめて切り替えられます
            </p>

            <div className={styles.bulkGroups}>
              {LETTER_GROUPS.map((group) => (
                <section key={group.id}>
                  <h4 className={styles.bulkGroupTitle}>{group.title}</h4>
                  {group.mode === 'bundle' ? (
                    <button
                      type="button"
                      className={`${styles.bulkButton} ${styles.bundleButton} ${
                        areLettersFullyLearned(learnedState, group.letters)
                          ? styles.bulkButtonOn
                          : ''
                      }`}
                      aria-pressed={areLettersFullyLearned(
                        learnedState,
                        group.letters,
                      )}
                      onClick={() => toggleLettersLearned(group.letters)}
                    >
                      {group.description}
                    </button>
                  ) : (
                    <div className={styles.bulkGrid}>
                      {group.letters.map((letter) => {
                        const active = isLetterFullyLearned(
                          learnedState,
                          letter,
                        );
                        return (
                          <button
                            key={letter}
                            type="button"
                            className={`${styles.bulkButton} ${active ? styles.bulkButtonOn : ''}`}
                            aria-pressed={active}
                            onClick={() => toggleLettersLearned([letter])}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <section
              ref={individualSectionRef}
              className={styles.individualSection}
              aria-label="個別に選ぶ"
            >
              <div
                className={`${styles.sectionHeader} ${styles.sectionHeaderDivider}`}
              >
                <h3 className={styles.sectionTitle}>個別に選ぶ</h3>
              </div>
              <div className={styles.individualGrid} aria-live="polite">
                {sortedFuda.map((fuda) => {
                  const active = isFudaLearned(fuda.no);
                  return (
                    <button
                      key={fuda.no}
                      type="button"
                      className={`${styles.individualButton} ${active ? styles.individualButtonOn : ''}`}
                      aria-pressed={active}
                      aria-label={`${fuda.kimariji}を${active ? '未覚え' : '覚えた'}にする`}
                      onClick={() => toggleLearned(fuda.no)}
                    >
                      {formatKimarijiButtonLabel(fuda.kimariji)}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={`${styles.footerButton} ${styles.footerButtonPrimary}`}
              onClick={handleEnableAll}
            >
              全てオン
            </button>
            <button
              type="button"
              className={`${styles.footerButton} ${styles.footerButtonDanger}`}
              onClick={handleDisableAll}
            >
              全てオフ
            </button>
          </footer>
        </div>
      </section>
    </>
  );
}
