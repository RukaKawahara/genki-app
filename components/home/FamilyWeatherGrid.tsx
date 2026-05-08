import Image from "next/image";
import WeatherIcon from "@/components/mood/WeatherIcon";
import { getMood } from "@/constants/moods";
import styles from "./FamilyWeatherGrid.module.css";
import type { User, MoodEntry } from "@/types";

interface Props {
  members: { user: User; mood: MoodEntry | null }[];
  onMemberClick?: (uid: string) => void;
}

export default function FamilyWeatherGrid({ members, onMemberClick }: Props) {
  return (
    <div className={styles.wrap}>
      {members.map(({ user, mood }) => (
        <div key={user.uid} className={styles.card} onClick={() => onMemberClick?.(user.uid)} style={{ cursor: onMemberClick ? "pointer" : undefined }}>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={40}
              height={40}
              className={styles.avatar}
            />
          ) : (
            <span className={styles.initials}>{user.name.charAt(0)}</span>
          )}
          <div className={styles.info}>
            <p className={styles.name}>{user.name}</p>
            {mood ? (
              <p className={styles.note}>
                {getMood(mood.level).label}
                {mood.note && ` — ${mood.note}`}
              </p>
            ) : (
              <p className={styles.noMood}>まだ記録なし</p>
            )}
          </div>
          {mood ? (
            <WeatherIcon level={mood.level} size="md" />
          ) : (
            <span style={{ fontSize: "1.75rem" }}>—</span>
          )}
        </div>
      ))}
    </div>
  );
}
