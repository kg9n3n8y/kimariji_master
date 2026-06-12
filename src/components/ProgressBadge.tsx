import type { ReactNode } from 'react';
import styles from '@/components/ProgressBadge.module.css';

export type ProgressBadgeTheme = 'main' | 'review' | 'retest' | 'learn';

type ProgressBadgeProps = {
  children: ReactNode;
  theme?: ProgressBadgeTheme;
};

export function ProgressBadge({
  children,
  theme = 'main',
}: ProgressBadgeProps) {
  const themeClass =
    theme === 'review' ? styles.review
    : theme === 'retest' ? styles.retest
    : theme === 'learn' ? styles.learn
    : styles.main;

  return <span className={`${styles.badge} ${themeClass}`}>{children}</span>;
}
