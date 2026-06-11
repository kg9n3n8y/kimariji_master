import { Link } from 'react-router-dom';
import styles from '@/components/PlaceholderPage.module.css';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <Link className={styles.back} to="/">
        ホームへ戻る
      </Link>
    </section>
  );
}
