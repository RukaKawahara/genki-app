import type { MoodConfig } from "@/types";

export const MOODS: MoodConfig[] = [
  {
    level: 0,
    label: "動けない",
    icon: "⛈",
    color: "#ffffff",
    bgColor: "#a08ec0",
  },
  {
    level: 1,
    label: "ちょっとしんどい",
    icon: "🌧",
    color: "#ffffff",
    bgColor: "#7aaed8",
  },
  {
    level: 2,
    label: "まあまあ",
    icon: "☁️",
    color: "#ffffff",
    bgColor: "#94b8c0",
  },
  {
    level: 3,
    label: "わりと元気",
    icon: "🌤",
    color: "#ffffff",
    bgColor: "#f0b55a",
  },
  {
    level: 4,
    label: "最高！",
    icon: "☀️",
    color: "#ffffff",
    bgColor: "#f5934e",
  },
];

export const getMood = (level: number) =>
  MOODS[level] ?? MOODS[2];
