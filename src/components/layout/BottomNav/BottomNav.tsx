"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdCalendarMonth, MdHome, MdSettings } from "react-icons/md";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
  { href: "/",         Icon: MdCalendarMonth, label: "カレンダー" },
  { href: "/home",     Icon: MdHome,          label: "ホーム" },
  { href: "/settings", Icon: MdSettings,      label: "設定" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ href, Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.item} ${pathname === href ? styles.active : ""}`}
        >
          <Icon size={26} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
