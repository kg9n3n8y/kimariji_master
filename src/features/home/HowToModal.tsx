import { useEffect } from 'react';
import { HOW_TO_SECTIONS } from '@/features/home/howToContent';
import styles from '@/features/home/HowToModal.module.css';

type HowToModalProps = {
  open: boolean;
  onClose: () => void;
};

export function HowToModal({ open, onClose }: HowToModalProps) {
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
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="使い方を閉じる"
        onClick={onClose}
      />
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-modal-title"
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 id="how-to-modal-title" className={styles.title}>
              使い方
            </h2>
            <button type="button" className={styles.doneButton} onClick={onClose}>
              閉じる
            </button>
          </header>

          <div className={styles.body}>
            {HOW_TO_SECTIONS.map((section) => (
              <section key={section.id} className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    {section.icon}
                  </span>
                  {section.title}
                </h3>
                <ul className={styles.sectionList}>
                  {section.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
