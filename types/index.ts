export type MoodLevel = 0 | 1 | 2 | 3 | 4;
export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface MoodEntry {
  level: MoodLevel;
  note: string;
  date: string; // "YYYY-MM-DD"
  time_of_day?: TimeOfDay;
  reason?: string;
}

export interface User {
  uid: string;
  name: string;
  avatarUrl: string;
  familyId: string | null;
}

export interface Family {
  id: string;
  name: string;
  inviteToken: string;
  members: string[];
}

export interface Mission {
  text: string;
  level: MoodLevel;
}

export interface MoodConfig {
  level: MoodLevel;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}
