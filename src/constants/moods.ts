import type { MoodConfig } from "@/types";

export const MOODS: MoodConfig[] = [
  {
    level: 0,
    label: "動けない",
    icon: "⛈",
    color: "#4a4a5a",
    bgColor: "#e8e8f0",
  },
  {
    level: 1,
    label: "ちょっとしんどい",
    icon: "🌧",
    color: "#5a7fa0",
    bgColor: "#daeaf7",
  },
  {
    level: 2,
    label: "まあまあ",
    icon: "☁️",
    color: "#7a8a96",
    bgColor: "#eef1f4",
  },
  {
    level: 3,
    label: "わりと元気",
    icon: "🌤",
    color: "#c8a800",
    bgColor: "#fffbe0",
  },
  {
    level: 4,
    label: "最高！",
    icon: "☀️",
    color: "#e07b00",
    bgColor: "#fff3dc",
  },
];

export const getMood = (level: number) =>
  MOODS[level] ?? MOODS[2];
