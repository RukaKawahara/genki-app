import {
  WiThunderstorm,
  WiRain,
  WiCloudy,
  WiDayCloudy,
  WiDaySunny,
} from "react-icons/wi";
import { getMood } from "@/constants/moods";
import styles from "./WeatherIcon.module.css";

const ICONS = [WiThunderstorm, WiRain, WiCloudy, WiDayCloudy, WiDaySunny];

const SIZE_MAP = { sm: 22, md: 32, lg: 44 };

interface Props {
  level: number;
  size?: "sm" | "md" | "lg";
}

export default function WeatherIcon({ level, size = "md" }: Props) {
  const mood = getMood(level);
  const Icon = ICONS[level] ?? ICONS[2];
  const px = SIZE_MAP[size];

  return (
    <span
      className={`${styles.icon} ${styles[size]}`}
      style={{ background: mood.bgColor, color: mood.color }}
      title={mood.label}
    >
      <Icon size={px} />
    </span>
  );
}
