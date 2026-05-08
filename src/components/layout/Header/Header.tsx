"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import type { User } from "@/types";

interface Props {
  userName?: string;
  userAvatar?: string;
  title?: string;
  right?: React.ReactNode;
  members?: User[];
  selectedUid?: string;
  onSelectMember?: (uid: string) => void;
  hideAvatar?: boolean;
}

export default function Header({ userName, userAvatar, title, right, members, selectedUid, onSelectMember, hideAvatar }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const switchable = members && members.length > 1;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div
          ref={ref}
          className={styles.userWrap}
        >
          <div
            className={styles.user}
            onClick={() => switchable && setOpen((v) => !v)}
            style={{ cursor: switchable ? "pointer" : undefined }}
          >
            {!hideAvatar && (userAvatar ? (
              <Image src={userAvatar} alt={userName ?? ""} width={36} height={36} className={styles.avatar} />
            ) : userName ? (
              <span className={styles.initials}>{userName.charAt(0)}</span>
            ) : null)}
            {(title || userName) && (
              <p className={styles.title}>
                {title ?? `${userName}さんのお天気情報！`}
                {switchable && <span className={styles.caret}>{open ? "▲" : "▼"}</span>}
              </p>
            )}
          </div>

          {open && switchable && (
            <div className={styles.dropdown}>
              {members!.map((m) => (
                <button
                  key={m.uid}
                  className={`${styles.dropdownItem} ${selectedUid === m.uid ? styles.dropdownItemActive : ""}`}
                  onClick={() => { onSelectMember?.(m.uid); setOpen(false); }}
                >
                  {m.avatarUrl ? (
                    <Image src={m.avatarUrl} alt={m.name} width={28} height={28} className={styles.dropdownAvatar} />
                  ) : (
                    <span className={styles.dropdownInitials}>{m.name.charAt(0)}</span>
                  )}
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
