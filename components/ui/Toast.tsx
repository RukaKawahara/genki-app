"use client";
import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

interface Props {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;
  return <div className={styles.toast}>{message}</div>;
}
