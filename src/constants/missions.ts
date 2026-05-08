import type { Mission } from "@/types";

export const MISSIONS: Mission[] = [
  // 嵐 (level 0) — 動けない
  { level: 0, text: "目を開ける" },
  { level: 0, text: "水を一口飲む" },
  { level: 0, text: "深呼吸を3回する" },
  { level: 0, text: "スマホを手に取る" },
  { level: 0, text: "ひざを抱えて座る" },
  // 雨 (level 1) — ちょっとしんどい
  { level: 1, text: "カーテンを開ける" },
  { level: 1, text: "好きな曲を流す" },
  { level: 1, text: "ストレッチを1つする" },
  { level: 1, text: "温かい飲み物を作る" },
  { level: 1, text: "窓の外を眺める" },
];

export const getRandomMission = (level: 0 | 1): Mission => {
  const pool = MISSIONS.filter((m) => m.level === level);
  return pool[Math.floor(Math.random() * pool.length)];
};

export const COMPLETION_MESSAGES = [
  "よかった、できたね。",
  "それだけで十分。",
  "ちゃんとここにいるね。",
  "小さくても、一歩だよ。",
  "今日のあなたに拍手。",
  "無理しなくていい。でも、できたね。",
  "そっと、おつかれさま。",
];

export const getRandomCompletionMessage = (): string =>
  COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
