"use client";
import Image from "next/image";
import styles from "./MemberSelector.module.css";
import type { User } from "@/types";

interface Props {
  members: User[];
  selected: string;
  onSelect: (uid: string) => void;
}

export default function MemberSelector({ members, selected, onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      {members.map((m) => (
        <button
          key={m.uid}
          className={`${styles.chip} ${selected === m.uid ? styles.active : ""}`}
          onClick={() => onSelect(m.uid)}
        >
          {m.avatarUrl ? (
            <Image
              src={m.avatarUrl}
              alt={m.name}
              width={20}
              height={20}
              className={styles.avatar}
            />
          ) : (
            <span className={styles.initials}>
              {m.name.charAt(0)}
            </span>
          )}
          {m.name}
        </button>
      ))}
    </div>
  );
}
