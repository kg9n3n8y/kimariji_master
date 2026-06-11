import type { ReactNode } from 'react';
import styles from '@/components/AppShell.module.css';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
