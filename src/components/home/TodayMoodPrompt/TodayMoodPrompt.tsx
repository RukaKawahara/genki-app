"use client";
import Button from "@/components/ui/Button";
import styles from "./TodayMoodPrompt.module.css";

interface Props {
  onRecord: () => void;
}

export default function TodayMoodPrompt({ onRecord }: Props) {
  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        今日の<strong>きぶん</strong>を記録しよう
      </p>
      <button className={styles.btn} onClick={onRecord}>記録する</button>
    </div>
  );
}
