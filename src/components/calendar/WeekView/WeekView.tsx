"use client";
import { useState } from "react";
import WeatherIcon from "@/components/mood/WeatherIcon";
import styles from "./WeekView.module.css";
import type { MoodEntry } from "@/types";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStart(d: Date) {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start;
}

interface Props {
  moods: MoodEntry[];
  onDayClick?: (date: string) => void;
}

export default function WeekView({ moods, onDayClick }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const todayStr = toDateStr(new Date());
  const moodMap = Object.fromEntries(moods.map((m) => [m.date, m]));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekLabel = `${days[0].getMonth() + 1}/${days[0].getDate()} 〜 ${days[6].getMonth() + 1}/${days[6].getDate()}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button
          className={styles.navBtn}
          onClick={() => {
            const prev = new Date(weekStart);
            prev.setDate(prev.getDate() - 7);
            setWeekStart(prev);
          }}
        >‹</button>
        <span className={styles.weekLabel}>{weekLabel}</span>
        <button
          className={styles.navBtn}
          onClick={() => {
            const next = new Date(weekStart);
            next.setDate(next.getDate() + 7);
            setWeekStart(next);
          }}
        >›</button>
      </div>
      <div className={styles.grid}>
        {days.map((d, i) => {
          const dateStr = toDateStr(d);
          const mood = moodMap[dateStr];
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} className={`${styles.dayCol} ${isToday ? styles.today : ""}`}>
              <span className={styles.dayName}>{DAY_NAMES[i]}</span>
              <span className={styles.dateNum}>{d.getDate()}</span>
              <div
                className={mood ? styles.iconArea : styles.empty}
                onClick={() => mood && onDayClick?.(dateStr)}
              >
                {mood && <WeatherIcon level={mood.level} size="sm" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
