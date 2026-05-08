"use client";
import { useEffect, useState } from "react";
import type { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null | undefined>(undefined);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const fetchProfile = async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", uid)
      .single();
    setProfileName(data?.name ?? null);
    setProfileAvatar(data?.avatar_url ?? null);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: SupabaseUser | null } }) => {
      setUser(data.user);
      if (data.user) fetchProfile(data.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfileName(null); setProfileAvatar(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
    user: user
      ? {
          id: user.id,
          name: profileName ?? user.user_metadata?.full_name ?? user.email ?? "ユーザー",
          email: user.email ?? "",
          image: profileAvatar ?? user.user_metadata?.avatar_url ?? "",
        }
      : null,
    uid: user?.id ?? null,
    loading: user === undefined,
    authenticated: !!user,
    refetchProfile: () => { if (user) fetchProfile(user.id); },
  };
}
