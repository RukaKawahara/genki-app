"use client";
import Modal from "@/components/ui/Modal";
import WeatherIcon from "./WeatherIcon";
import { getMood } from "@/constants/moods";
import styles from "./DayDetailModal.module.css";
import type { TimeOfDay, MoodEntry } from "@/types";

const TIME_LABELS: { value: TimeOfDay; emoji: string; label: string }[] = [
  { value: "morning", emoji: "🌅", label: "朝" },
  { value: "afternoon", emoji: "☀️", label: "昼" },
  { value: "evening", emoji: "🌙", label: "夜" },
];

interface Props {
  date: string;
  moods: Partial<Record<TimeOfDay, MoodEntry>>;
  loading: boolean;
  onClose: () => void;
  onEdit?: (timeOfDay: TimeOfDay) => void;
}

export default function DayDetailModal({ date, moods, loading, onClose, onEdit }: Props) {
  const [, month, day] = date.split("-").map(Number);

  return (
    <Modal onClose={onClose}>
      <p className={styles.title}>{month}月{day}日のきぶん</p>
      {loading ? (
        <p className={styles.loading}>読み込み中…</p>
      ) : (
        <div className={styles.list}>
          {TIME_LABELS.map(({ value, emoji, label }) => {
            const mood = moods[value];
            return (
              <div
                key={value}
                className={styles.row}
                onClick={() => onEdit?.(value)}
                style={{ cursor: onEdit ? "pointer" : undefined }}
              >
                <span className={styles.timeLabel}>{emoji} {label}</span>
                {mood ? (
                  <div className={styles.moodInfo}>
                    <WeatherIcon level={mood.level} size="sm" />
                    <div className={styles.moodText}>
                      <span className={styles.moodLabel}>{getMood(mood.level).label}</span>
                      {mood.reason && <span className={styles.note}>{mood.reason}</span>}
                      {mood.note && <span className={styles.note}>{mood.note}</span>}
                    </div>
                  </div>
                ) : (
                  <span className={styles.noMood}>未記録</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
