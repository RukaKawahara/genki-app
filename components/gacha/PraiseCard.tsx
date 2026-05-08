import styles from "./PraiseCard.module.css";

interface Props {
  message: string;
}

export default function PraiseCard({ message }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.emoji}>🌱</p>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
