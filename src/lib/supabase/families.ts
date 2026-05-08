import { createClient } from "./client";
import type { Family } from "@/types";

function generateToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createFamily(uid: string, name: string): Promise<Family> {
  const supabase = createClient();
  const inviteToken = generateToken();
  const familyId = crypto.randomUUID();

  const { error } = await supabase
    .from("families")
    .insert({ id: familyId, name, invite_token: inviteToken });

  if (error) throw error;

  const { error: memberError } = await supabase
    .from("family_members")
    .insert({ family_id: familyId, user_id: uid });

  if (memberError) throw memberError;

  return { id: familyId, name, inviteToken, members: [uid] };
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("families")
    .select("*, family_members(user_id)")
    .eq("id", familyId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    inviteToken: data.invite_token,
    members: data.family_members.map((m: { user_id: string }) => m.user_id),
  };
}

export async function getFamilyByToken(token: string): Promise<Family | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("families")
    .select("id, name, invite_token")
    .eq("invite_token", token)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    inviteToken: data.invite_token,
    members: [],
  };
}

export async function getFamilyByUserId(uid: string): Promise<Family | null> {
  const supabase = createClient();
  const { data: member } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", uid)
    .single();

  if (!member) return null;
  return getFamily(member.family_id);
}

export async function updateFamilyName(familyId: string, name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("families")
    .update({ name })
    .eq("id", familyId);
  if (error) throw error;
}

export async function joinFamily(uid: string, familyId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("family_members")
    .insert({ family_id: familyId, user_id: uid });
}
