"use client";
import FamilyWeatherGrid from "@/components/home/FamilyWeatherGrid";
import type { MoodEntry } from "@/types";

const MOCK_MEMBERS: { user: { uid: string; name: string; avatarUrl: string; familyId: string }; mood: MoodEntry | null }[] = [
  {
    user: { uid: "1", name: "パパ", avatarUrl: "", familyId: "f1" },
    mood: { level: 4, note: "仕事順調！", date: "2025-05-08", time_of_day: "evening" },
  },
  {
    user: { uid: "2", name: "ママ", avatarUrl: "", familyId: "f1" },
    mood: { level: 2, note: "疲れた", date: "2025-05-08", time_of_day: "afternoon" },
  },
  {
    user: { uid: "3", name: "たろう", avatarUrl: "", familyId: "f1" },
    mood: { level: 1, note: "学校やだ", date: "2025-05-08", time_of_day: "morning" },
  },
  {
    user: { uid: "4", name: "はなこ", avatarUrl: "", familyId: "f1" },
    mood: null,
  },
];

export default function DevPage() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "1rem", fontWeight: 700 }}>DEV PREVIEW</h1>

      <h2 style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.75rem" }}>5月8日のtest家のきぶん</h2>
      <FamilyWeatherGrid members={MOCK_MEMBERS} onMemberClick={(uid) => alert("clicked: " + uid)} />
    </div>
  );
}
