"use client";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  fullWidth,
}: Props) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      style={fullWidth ? { width: "100%" } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
