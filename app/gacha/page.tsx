"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import GachaButton from "@/components/gacha/GachaButton";
import MissionCard from "@/components/gacha/MissionCard";
import PraiseCard from "@/components/gacha/PraiseCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useTodayMood } from "@/hooks/useMoods";
import { getRandomMission, getRandomCompletionMessage } from "@/constants/missions";
import styles from "./page.module.css";
import type { Mission } from "@/types";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Phase = "pre" | "mission" | "done";

export default function GachaPage() {
  const router = useRouter();
  const { uid, user } = useAuth();
  const today = toDateStr(new Date());
  const { mood } = useTodayMood(uid, today);

  const [phase, setPhase] = useState<Phase>("pre");
  const [mission, setMission] = useState<Mission | null>(null);
  const [praise, setPraise] = useState("");

  const level = mood?.level === 0 ? 0 : 1;

  const handleGachaResult = () => {
    const m = getRandomMission(level);
    setMission(m);
    setPhase("mission");
  };

  const handleDone = () => {
    setPraise(getRandomCompletionMessage());
    setPhase("done");
  };

  return (
    <div>
      <Header userName={user?.name ?? undefined} />
      <div className={styles.content}>
        {phase === "pre" && (
          <>
            <div className={styles.intro}>
              <p className={styles.label}>
                {level === 0 ? "⛈ 嵐" : "🌧 雨"}の日のガチャ
              </p>
              <p className={styles.sub}>できそうなことを引いてみよう</p>
            </div>
            <GachaButton onResult={handleGachaResult} />
          </>
        )}

        {phase === "mission" && mission && (
          <>
            <MissionCard mission={mission} />
            <div className={styles.actions}>
              <Button fullWidth onClick={handleDone}>
                できた！
              </Button>
              <Button variant="ghost" fullWidth onClick={handleGachaResult}>
                もう一回引く
              </Button>
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <PraiseCard message={praise} />
            <Button fullWidth onClick={() => router.push("/")}>
              カレンダーに戻る
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
