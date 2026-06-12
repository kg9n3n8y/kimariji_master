import { Link } from 'react-router-dom';
import styles from '@/components/BackNavButton.module.css';

type BackNavButtonBaseProps = {
  label?: string;
};

type BackNavButtonLinkProps = BackNavButtonBaseProps & {
  to: string;
  onClick?: never;
};

type BackNavButtonActionProps = BackNavButtonBaseProps & {
  to?: never;
  onClick: () => void;
};

type BackNavButtonProps = BackNavButtonLinkProps | BackNavButtonActionProps;

export function BackNavButton({
  label = 'トップ',
  to,
  onClick,
}: BackNavButtonProps) {
  const content = <>← {label}</>;

  if (to) {
    return (
      <Link className={styles.button} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.button} onClick={onClick}>
      {content}
    </button>
  );
}
