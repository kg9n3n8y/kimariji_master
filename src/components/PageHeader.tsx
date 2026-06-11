import { Link } from 'react-router-dom';
import styles from '@/components/PageHeader.module.css';

type PageHeaderProps = {
  backTo: string;
  backLabel?: string;
  progress?: string;
};

export function PageHeader({
  backTo,
  backLabel = 'トップ',
  progress,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.back} to={backTo}>
        ← {backLabel}
      </Link>
      {progress ? <span className={styles.progress}>{progress}</span> : null}
    </header>
  );
}
