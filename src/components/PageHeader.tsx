import { BackNavButton } from '@/components/BackNavButton';
import {
  ProgressBadge,
  type ProgressBadgeTheme,
} from '@/components/ProgressBadge';
import styles from '@/components/PageHeader.module.css';

type PageHeaderProps = {
  backTo: string;
  backLabel?: string;
  progress?: string;
  progressTheme?: ProgressBadgeTheme;
};

export function PageHeader({
  backTo,
  backLabel = 'トップ',
  progress,
  progressTheme = 'learn',
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <BackNavButton to={backTo} label={backLabel} />
      {progress ? (
        <ProgressBadge theme={progressTheme}>{progress}</ProgressBadge>
      ) : null}
    </header>
  );
}
