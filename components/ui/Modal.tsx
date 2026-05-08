"use client";
import { useEffect } from "react";
import styles from "./Modal.module.css";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  fullscreen?: boolean;
  centered?: boolean;
  sheetStyle?: React.CSSProperties;
}

export default function Modal({ onClose, children, fullscreen, centered, sheetStyle }: Props) {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (fullscreen) document.body.classList.add("fullscreen-modal-open");
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.classList.remove("fullscreen-modal-open");
    };
  }, [fullscreen]);

  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${styles.overlay} ${centered ? styles.centered : ""}`} onClick={onClose}>
      <div
        className={styles.sheet}
        style={{ position: "relative", ...sheetStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose} aria-label="閉じる">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
