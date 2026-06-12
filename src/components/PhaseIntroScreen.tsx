import { useEffect } from 'react';
import styles from '@/components/PhaseIntroScreen.module.css';

export const PHASE_INTRO_DURATION_MS = 800;

type PhaseIntroScreenProps = {
  text: string;
  onComplete: () => void;
  durationMs?: number;
};

export function PhaseIntroScreen({
  text,
  onComplete,
  durationMs = PHASE_INTRO_DURATION_MS,
}: PhaseIntroScreenProps) {
  useEffect(() => {
    const id = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onComplete]);

  return (
    <div className={styles.screen} aria-live="assertive">
      <span key={text} className={styles.label}>
        {text}
      </span>
    </div>
  );
}
