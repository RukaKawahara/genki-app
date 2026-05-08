"use client";
import { useState, useEffect, useCallback } from "react";
import { getFamilyByUserId } from "@/lib/supabase/families";
import { createClient } from "@/lib/supabase/client";
import { getFamilyTodayMoods } from "@/lib/supabase/moods";
import type { Family, User, MoodEntry } from "@/types";

export function useFamily(uid: string | null) {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    getFamilyByUserId(uid).then((f) => {
      setFamily(f);
      setLoading(false);
    });
  }, [uid]);

  return { family, loading };
}

export function useFamilyMembers(family: Family | null) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!family) return;
    setLoading(true);
    const supabase = createClient();
    supabase.from("profiles").select("id, name, email, avatar_url").in("id", family.members).then(({ data: profiles }) => {
      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      setMembers(
        family.members.map((uid) => ({
          uid,
          name: profileMap[uid]?.name ?? profileMap[uid]?.email ?? "名前未設定",
          avatarUrl: profileMap[uid]?.avatar_url ?? "",
          familyId: family.id,
        }))
      );
      setLoading(false);
    });
  }, [family]);

  return { members, loading };
}

export function useFamilyMoods(family: Family | null, today: string) {
  const [membersData, setMembersData] = useState<{ user: User; mood: MoodEntry | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!family) return;
    setLoading(true);
    const supabase = createClient();
    const [moodMap, { data: profiles }] = await Promise.all([
      getFamilyTodayMoods(family.members, today),
      supabase.from("profiles").select("id, name, email, avatar_url").in("id", family.members),
    ]);
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
    setMembersData(
      family.members.map((uid) => ({
        user: { uid, name: profileMap[uid]?.name ?? profileMap[uid]?.email ?? "名前未設定", avatarUrl: profileMap[uid]?.avatar_url ?? "", familyId: family.id },
        mood: moodMap[uid] ?? null,
      }))
    );
    setLoading(false);
  }, [family, today]);

  useEffect(() => { fetch(); }, [fetch]);

  return { membersData, loading, refetch: fetch };
}
