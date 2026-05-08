"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import WeatherIcon from "../WeatherIcon";
import { MOODS } from "@/constants/moods";
import styles from "./MoodModal.module.css";
import type { MoodLevel, TimeOfDay } from "@/types";

const TIME_OPTIONS: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: "morning", label: "朝", emoji: "🌅" },
  { value: "afternoon", label: "昼", emoji: "☀️" },
  { value: "evening", label: "夜", emoji: "🌙" },
];

function getCurrentTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

const REASONS = [
  "体調",
  "仕事",
  "人間関係",
  "睡眠",
  "疲れ",
  "家事",
  "その他・わからない",
];

interface Props {
  onSave: (time_of_day: TimeOfDay, level: MoodLevel, note: string, reason?: string) => void;
  onClose: () => void;
  initialTimeOfDay?: TimeOfDay;
  initialLevel?: MoodLevel;
  initialNote?: string;
  initialReason?: string;
}

export default function MoodModal({ onSave, onClose, initialTimeOfDay, initialLevel, initialNote, initialReason }: Props) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialTimeOfDay ?? getCurrentTimeOfDay());
  const [selected, setSelected] = useState<MoodLevel | null>(initialLevel ?? null);
  const [reason, setReason] = useState(initialReason ?? "");
  const [note, setNote] = useState(initialNote ?? "");

  const handleSave = () => {
    if (selected === null) return;
    onSave(timeOfDay, selected, note, reason || undefined);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <p className={styles.title}>いつのきぶん？</p>
      <div className={styles.timeGrid}>
        {TIME_OPTIONS.map((t) => (
          <button
            key={t.value}
            className={`${styles.timeOption} ${timeOfDay === t.value ? styles.timeSelected : ""}`}
            onClick={() => setTimeOfDay(t.value)}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <p className={styles.noteLabel}>きぶんは？</p>
      <div className={styles.grid}>
        {MOODS.map((mood) => (
          <div
            key={mood.level}
            className={`${styles.option} ${selected === mood.level ? styles.selected : ""}`}
            onClick={() => setSelected(mood.level)}
          >
            <WeatherIcon level={mood.level} size="sm" />
            <span className={styles.moodName}>{mood.label}</span>
          </div>
        ))}
      </div>
      <p className={styles.noteLabel}>おもな理由（任意）</p>
      <select
        className={styles.select}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        <option value="">選択しない</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <p className={styles.noteLabel}>一言メモ（任意）</p>
      <textarea
        className={styles.textarea}
        rows={2}
        placeholder="今日はどんな感じ？"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button fullWidth disabled={selected === null} onClick={handleSave}>
        きろく
      </Button>
    </Modal>
  );
}
