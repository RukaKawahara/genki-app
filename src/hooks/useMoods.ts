"use client";
import { useState, useEffect, useCallback } from "react";
import { saveMood, getTodayMoods, getMonthMoods } from "@/lib/supabase/moods";
import type { MoodEntry, MoodLevel, TimeOfDay } from "@/types";

export function useMonthMoods(uid: string | null, year: number, month: number) {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const data = await getMonthMoods(uid, year, month);
    setMoods(data);
    setLoading(false);
  }, [uid, year, month]);

  useEffect(() => { fetch(); }, [fetch]);

  return { moods, loading, refetch: fetch };
}

export function useDayMoods(uid: string | null, date: string | null) {
  const [moods, setMoods] = useState<Partial<Record<TimeOfDay, MoodEntry>> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!uid || !date) { setMoods(null); return; }
    setLoading(true);
    getTodayMoods(uid, date).then((m) => { setMoods(m); setLoading(false); });
  }, [uid, date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { moods, loading, refetch: fetch };
}

export function useTodayMood(uid: string | null, today: string) {
  const [moods, setMoods] = useState<Partial<Record<TimeOfDay, MoodEntry>> | undefined>(undefined);

  useEffect(() => {
    if (!uid) return;
    getTodayMoods(uid, today).then(setMoods);
  }, [uid, today]);

  const save = async (time_of_day: TimeOfDay, level: MoodLevel, note: string, reason?: string) => {
    if (!uid) return;
    await saveMood(uid, today, time_of_day, level, note, reason);
    setMoods((prev) => ({
      ...prev,
      [time_of_day]: { level, note, date: today, time_of_day, reason },
    }));
  };

  return { moods, save };
}
