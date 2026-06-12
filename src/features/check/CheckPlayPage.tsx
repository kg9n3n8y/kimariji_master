import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BackNavButton } from '@/components/BackNavButton';
import { GoroModal } from '@/components/GoroModal';
import {
  fudaImageUrl,
  fudaReverseImageUrl,
  goroSlideUrl,
  placeholderFudaUrl,
} from '@/lib/assets';
import { shuffleArray } from '@/lib/shuffle';
import { addCheckHistoryEntry } from '@/stores/checkHistoryStore';
import { ONE_MINUTE_MIN_LEARNED } from '@/features/one-minute/oneMinuteStorage';
import { useLearned } from '@/stores/LearnedContext';
import { saveCheckCompleteResult } from '@/features/check/checkSession';
import type { Fuda } from '@/types/fuda';
import styles from '@/features/check/CheckPlayPage.module.css';

type KimarijiButtonMode = 'reveal' | 'goro';

export function CheckPlayPage() {
  const navigate = useNavigate();
  const { learnedFuda, learnedCount } = useLearned();

  const fudaOrderRef = useRef<Fuda[]>([]);
  const currentIndexRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const [imageSrc, setImageSrc] = useState(placeholderFudaUrl);
  const [currentFuda, setCurrentFuda] = useState<Fuda | null>(null);
  const [kimarijiVisible, setKimarijiVisible] = useState(false);
  const [buttonMode, setButtonMode] = useState<KimarijiButtonMode>('reveal');
  const [goroOpen, setGoroOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  useEffect(() => {
    if (learnedCount === 0) {
      navigate('/', { replace: true });
      return;
    }
    fudaOrderRef.current = shuffleArray(learnedFuda);
    currentIndexRef.current = 0;
    startTimeRef.current = null;
    // プレイ開始時に一度だけシャッフル
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishGame = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) {
      navigate('/', { replace: true });
      return;
    }

    const elapsed = Date.now() - start;
    const cards = fudaOrderRef.current.length;
    addCheckHistoryEntry(elapsed, cards);
    saveCheckCompleteResult({ timeMs: elapsed, cards });
    navigate('/check/result', { replace: true });
  }, [navigate]);

  const displayFuda = (fuda: Fuda) => {
    const useReverse =
      learnedCount >= ONE_MINUTE_MIN_LEARNED && Math.random() < 0.5;
    setImageSrc(
      useReverse ? fudaReverseImageUrl(fuda) : fudaImageUrl(fuda),
    );
    setCurrentFuda(fuda);
  };

  const resetKimariji = () => {
    setKimarijiVisible(false);
    setButtonMode('reveal');
  };

  const handleImageTap = () => {
    setGoroOpen(false);
    const order = fudaOrderRef.current;
    const index = currentIndexRef.current;

    if (index === order.length) {
      finishGame();
      return;
    }

    if (index === 0) {
      startTimeRef.current = Date.now();
    }

    displayFuda(order[index]!);
    currentIndexRef.current = index + 1;
    resetKimariji();
  };

  const handleKimarijiButton = () => {
    if (!currentFuda) {
      return;
    }

    if (buttonMode === 'goro') {
      const imageFile = currentFuda.goroImage?.trim() ?? '';
      if (!imageFile) {
        window.alert('この札の覚え方画像は登録されていません。');
        return;
      }
      setGoroOpen(true);
      return;
    }

    setKimarijiVisible(true);
    setButtonMode('goro');
  };

  const handleBack = () => {
    setExitConfirmOpen(true);
  };

  const handleExitConfirm = () => {
    setExitConfirmOpen(false);
    navigate('/', { replace: true });
  };

  if (learnedCount === 0) {
    return null;
  }

  const goroImageUrl =
    currentFuda?.goroImage?.trim() ?
      goroSlideUrl(currentFuda.goroImage.trim())
    : '';

  return (
    <section className={styles.page} aria-live="polite">
      <header className={styles.header}>
        <BackNavButton label="トップ" onClick={handleBack} />
      </header>

      <button
        type="button"
        className={styles.imageButton}
        onClick={handleImageTap}
        aria-label="取り札を進める"
      >
        <img className={styles.fudaImage} src={imageSrc} alt="取り札" />
      </button>

      {kimarijiVisible && currentFuda && (
        <p className={styles.kimariji} aria-live="assertive">
          {currentFuda.kimariji}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.actionReveal} ${buttonMode === 'goro' ? styles.actionGoro : ''}`}
          onClick={handleKimarijiButton}
          disabled={!currentFuda}
        >
          <span className={styles.actionIcon} aria-hidden="true">
            👀
          </span>
          <span>
            {buttonMode === 'goro' ? '覚え方を見る' : '決まり字を見る'}
          </span>
        </button>
      </div>

      {goroOpen && goroImageUrl && currentFuda && (
        <GoroModal
          imageUrl={goroImageUrl}
          alt={`${currentFuda.kimariji}の語呂合わせ`}
          onClose={() => setGoroOpen(false)}
        />
      )}

      <ConfirmDialog
        open={exitConfirmOpen}
        message="トップ画面に戻ります。よろしいですか？"
        onConfirm={handleExitConfirm}
        onCancel={() => setExitConfirmOpen(false)}
      />
    </section>
  );
}
