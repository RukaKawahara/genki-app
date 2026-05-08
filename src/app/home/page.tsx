"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import FamilyWeatherGrid from "@/components/home/FamilyWeatherGrid";
import TodayMoodPrompt from "@/components/home/TodayMoodPrompt";
import MoodModal from "@/components/mood/MoodModal";
import DayDetailModal from "@/components/mood/DayDetailModal";
import GachaSuggestModal from "@/components/gacha/GachaSuggestModal";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFamily, useFamilyMoods } from "@/hooks/useFamily";
import { useTodayMood, useDayMoods } from "@/hooks/useMoods";
import styles from "./page.module.css";
import type { MoodLevel, TimeOfDay } from "@/types";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomePage() {
  const router = useRouter();
  const { uid, user } = useAuth();
  const today = toDateStr(new Date());
  const { family, loading: familyLoading } = useFamily(uid);
  const { membersData: rawMembersData, loading: membersLoading, refetch: refetchMembers } = useFamilyMoods(family, today);
  const membersData = rawMembersData.map((item) =>
    item.user.uid === uid && user
      ? { ...item, user: { ...item.user, name: user.name, avatarUrl: user.image || item.user.avatarUrl } }
      : item
  );
  const { moods: todayMoods, save } = useTodayMood(uid, today);

  const [showModal, setShowModal] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [editTimeOfDay, setEditTimeOfDay] = useState<TimeOfDay | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { moods: memberDayMoods, loading: memberDayLoading, refetch: refetchDayMoods } = useDayMoods(selectedUid, today);

  const handleSave = useCallback(async (time_of_day: TimeOfDay, level: MoodLevel, note: string, reason?: string) => {
    await save(time_of_day, level, note, reason);
    await Promise.all([refetchMembers(), refetchDayMoods()]);
    setToast("記録ありがとう！");
    if (level === 0 || level === 1) setShowGacha(true);
  }, [save, refetchMembers, refetchDayMoods]);

  const recordedCount = todayMoods
    ? (["morning", "afternoon", "evening"] as TimeOfDay[]).filter((t) => todayMoods[t]).length
    : 0;


  if (familyLoading || membersLoading) {
    return (
      <div>
        <Header title={`${new Date().getMonth() + 1}月${new Date().getDate()}日の${family?.name ?? "家族"}のお天気情報！`} />
        <div className={styles.loading}>読み込み中…</div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`${new Date().getMonth() + 1}月${new Date().getDate()}日の${family?.name ?? "家族"}のお天気情報！`} />
      <div className={styles.content}>

        {recordedCount < 3 && (
          <TodayMoodPrompt onRecord={() => setShowModal(true)} />
        )}

        {membersData.length === 0 ? (
          <p className={styles.empty}>家族がまだいません</p>
        ) : (
          <FamilyWeatherGrid members={membersData} onMemberClick={setSelectedUid} />
        )}
      </div>

      {showModal && (
        <MoodModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedUid && memberDayMoods && !editTimeOfDay && (
        <DayDetailModal
          date={today}
          moods={memberDayMoods}
          loading={memberDayLoading}
          onClose={() => setSelectedUid(null)}
          onEdit={selectedUid === uid ? (t) => setEditTimeOfDay(t) : undefined}
        />
      )}

      {editTimeOfDay && (
        <MoodModal
          initialTimeOfDay={editTimeOfDay}
          initialLevel={todayMoods?.[editTimeOfDay]?.level}
          initialNote={todayMoods?.[editTimeOfDay]?.note}
          initialReason={todayMoods?.[editTimeOfDay]?.reason}
          onSave={async (t, l, n, r) => { await handleSave(t, l, n, r); setEditTimeOfDay(null); }}
          onClose={() => setEditTimeOfDay(null)}
        />
      )}

      {showGacha && (
        <GachaSuggestModal
          onGo={() => { setShowGacha(false); router.push("/gacha"); }}
          onClose={() => setShowGacha(false)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
