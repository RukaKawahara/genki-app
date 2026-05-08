import styles from "./MissionCard.module.css";
import type { Mission } from "@/types";

interface Props {
  mission: Mission;
}

export default function MissionCard({ mission }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>✨ ミッション ✨</p>
      <p className={styles.mission}>{mission.text}</p>
      <p className={styles.sub}>できそう？</p>
    </div>
  );
}
