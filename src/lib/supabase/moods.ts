import { createClient } from "./client";
import type { MoodEntry, MoodLevel, TimeOfDay } from "@/types";

const PRIORITY: TimeOfDay[] = ["morning", "afternoon", "evening"];

function toEntry(row: { level: number; note: string; date: string; time_of_day: string; reason?: string | null }): MoodEntry {
  return {
    level: row.level as MoodLevel,
    note: row.note,
    date: row.date,
    time_of_day: row.time_of_day as TimeOfDay,
    reason: row.reason ?? undefined,
  };
}

export async function saveMood(
  uid: string,
  date: string,
  time_of_day: TimeOfDay,
  level: MoodLevel,
  note: string,
  reason?: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("moods")
    .upsert({ user_id: uid, date, time_of_day, level, note, reason: reason || null }, { onConflict: "user_id,date,time_of_day" });
  if (error) throw error;
}

export async function getTodayMoods(
  uid: string,
  date: string
): Promise<Partial<Record<TimeOfDay, MoodEntry>>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("moods")
    .select("level, note, date, time_of_day, reason")
    .eq("user_id", uid)
    .eq("date", date);

  const result: Partial<Record<TimeOfDay, MoodEntry>> = {};
  for (const row of data ?? []) {
    result[row.time_of_day as TimeOfDay] = toEntry(row);
  }
  return result;
}

export async function getMonthMoods(
  uid: string,
  year: number,
  month: number
): Promise<MoodEntry[]> {
  const supabase = createClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data } = await supabase
    .from("moods")
    .select("level, note, date, time_of_day, reason")
    .eq("user_id", uid)
    .gte("date", start)
    .lte("date", end);

  // カレンダー表示用に1日1エントリ（夜 > 昼 > 朝の優先順）
  const dayMap: Record<string, MoodEntry> = {};
  for (const row of data ?? []) {
    const existing = dayMap[row.date];
    if (!existing || PRIORITY.indexOf(row.time_of_day as TimeOfDay) > PRIORITY.indexOf(existing.time_of_day as TimeOfDay)) {
      dayMap[row.date] = toEntry(row);
    }
  }
  return Object.values(dayMap);
}

export async function getFamilyTodayMoods(
  memberIds: string[],
  date: string
): Promise<Record<string, MoodEntry>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("moods")
    .select("user_id, level, note, date, time_of_day, reason")
    .in("user_id", memberIds)
    .eq("date", date);

  // メンバーごとに夜 > 昼 > 朝の優先順で1つ返す
  const result: Record<string, MoodEntry> = {};
  for (const row of data ?? []) {
    const existing = result[row.user_id];
    if (!existing || PRIORITY.indexOf(row.time_of_day as TimeOfDay) > PRIORITY.indexOf(existing.time_of_day as TimeOfDay)) {
      result[row.user_id] = toEntry(row);
    }
  }
  return result;
}
