import styles from '@/components/GoroModal.module.css';

type GoroModalProps = {
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

export function GoroModal({ imageUrl, alt, onClose }: GoroModalProps) {
  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="閉じる"
        onClick={onClose}
      />
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="語呂合わせ画像"
      >
        <div className={styles.frame}>
          <button
            type="button"
            className={styles.close}
            aria-label="閉じる"
            onClick={onClose}
          >
            ✕
          </button>
          <img className={styles.image} src={imageUrl} alt={alt} />
        </div>
      </section>
    </>
  );
}
