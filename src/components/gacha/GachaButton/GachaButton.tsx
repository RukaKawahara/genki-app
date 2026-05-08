"use client";
import { useState } from "react";
import { PiShootingStarFill } from "react-icons/pi";
import styles from "./GachaButton.module.css";

interface Props {
  onResult: () => void;
}

export default function GachaButton({ onResult }: Props) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      onResult();
    }, 650);
  };

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.ball} ${spinning ? styles.spinning : ""}`}
        onClick={handleClick}
        aria-label="ガチャを回す"
      >
        <PiShootingStarFill size={52} />
      </button>
      <span className={styles.label}>タップしてガチャを回す</span>
    </div>
  );
}
