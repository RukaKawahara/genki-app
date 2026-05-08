"use client";
import { useState } from "react";
import WeatherIcon from "@/components/mood/WeatherIcon";
import styles from "./MonthView.module.css";
import type { MoodEntry } from "@/types";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

interface Props {
  moods: MoodEntry[];
  onDayClick?: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}

export default function MonthView({ moods, onDayClick, onMonthChange }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const moodMap = Object.fromEntries(moods.map((m) => [m.date, m]));
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = () => {
    const [ny, nm] = month === 1 ? [year - 1, 12] : [year, month - 1];
    setYear(ny); setMonth(nm);
    onMonthChange?.(ny, nm);
  };
  const next = () => {
    const [ny, nm] = month === 12 ? [year + 1, 1] : [year, month + 1];
    setYear(ny); setMonth(nm);
    onMonthChange?.(ny, nm);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prev}>‹</button>
        <span className={styles.monthLabel}>{year}年{month}月</span>
        <button className={styles.navBtn} onClick={next}>›</button>
      </div>
      <div className={styles.grid}>
        {DAY_NAMES.map((d, i) => (
          <div key={d} className={`${styles.dayName} ${i === 0 ? styles.sunday : i === 6 ? styles.saturday : ""}`}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className={`${styles.cell} ${styles.empty}`} />;
          }
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const mood = moodMap[dateStr];
          const dayOfWeek = (firstDay + day - 1) % 7;
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              className={`${styles.cell} ${isToday ? styles.today : ""} ${dayOfWeek === 0 ? styles.sunday : dayOfWeek === 6 ? styles.saturday : ""}`}
              onClick={() => onDayClick?.(dateStr)}
            >
              {mood && <WeatherIcon level={mood.level} size="sm" />}
              <span className={styles.dateNum}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
