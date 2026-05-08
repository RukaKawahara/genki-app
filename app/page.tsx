"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import MoodModal from "@/components/mood/MoodModal";
import DayDetailModal from "@/components/mood/DayDetailModal";
import GachaSuggestModal from "@/components/gacha/GachaSuggestModal";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFamily, useFamilyMembers } from "@/hooks/useFamily";
import { useMonthMoods, useTodayMood, useDayMoods } from "@/hooks/useMoods";
import styles from "./page.module.css";
import type { MoodLevel, TimeOfDay } from "@/types";

type ViewMode = "month" | "week";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const { uid, user } = useAuth();
  const today = toDateStr(new Date());
  const now = new Date();

  const { family } = useFamily(uid);
  const { members: rawMembers } = useFamilyMembers(family);
  const members = rawMembers.map((m) =>
    m.uid === uid && user
      ? { ...m, name: user.name, avatarUrl: user.image || m.avatarUrl }
      : m
  );
  const [view, setView] = useState<ViewMode>("month");
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editTimeOfDay, setEditTimeOfDay] = useState<TimeOfDay | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const viewUid = selectedUid ?? uid ?? "";
  const viewMember = members.find((m) => m.uid === viewUid);
  const { moods, refetch } = useMonthMoods(viewUid || null, calYear, calMonth);
  const { moods: todayMoods, save } = useTodayMood(uid, today);
  const { moods: dayMoods, loading: dayMoodsLoading, refetch: refetchDayMoods } = useDayMoods(viewUid || null, selectedDate);

  const handleSave = useCallback(async (time_of_day: TimeOfDay, level: MoodLevel, note: string, reason?: string) => {
    try {
      await save(time_of_day, level, note, reason);
      await Promise.all([refetch(), refetchDayMoods()]);
      setShowMoodModal(false);
      setToast("記録ありがとう！");
      if (level === 0 || level === 1) setShowGacha(true);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? JSON.stringify(e);
      setToast("保存に失敗しました: " + msg);
    }
  }, [save, refetch, refetchDayMoods]);

  const todayRecordedCount = todayMoods
    ? (["morning", "afternoon", "evening"] as TimeOfDay[]).filter((t) => todayMoods[t]).length
    : 0;

  return (
    <div>
      <Header
        title={`${viewMember?.name ?? user?.name ?? ""}さんのお天気情報！`}
        userAvatar={viewMember?.avatarUrl || (viewUid === uid ? user?.image : undefined) || undefined}
        members={members}
        selectedUid={viewUid}
        onSelectMember={setSelectedUid}
      />
      <div className={styles.content}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === "month" ? styles.toggleBtnActive : ""}`}
            onClick={() => setView("month")}
          >
            月
          </button>
          <button
            className={`${styles.toggleBtn} ${view === "week" ? styles.toggleBtnActive : ""}`}
            onClick={() => setView("week")}
          >
            週
          </button>
        </div>

        {todayRecordedCount < 3 && (
          <div className={styles.prompt}>
            <p className={styles.promptText}>
              今日の<strong>きぶん</strong>を記録しよう
            </p>
            <button className={styles.promptBtn} onClick={() => setShowMoodModal(true)}>記録する</button>
          </div>
        )}

        {view === "month" ? (
          <MonthView
            moods={moods}
            onDayClick={setSelectedDate}
            onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
          />
        ) : (
          <WeekView moods={moods} onDayClick={setSelectedDate} />
        )}
      </div>

      {showMoodModal && (
        <MoodModal
          onSave={handleSave}
          onClose={() => setShowMoodModal(false)}
        />
      )}

      {selectedDate && dayMoods && !editTimeOfDay && (
        <DayDetailModal
          date={selectedDate}
          moods={dayMoods}
          loading={dayMoodsLoading}
          onClose={() => setSelectedDate(null)}
          onEdit={viewUid === uid ? (t) => setEditTimeOfDay(t) : undefined}
        />
      )}

      {editTimeOfDay && (
        <MoodModal
          initialTimeOfDay={editTimeOfDay}
          initialLevel={dayMoods?.[editTimeOfDay]?.level}
          initialNote={dayMoods?.[editTimeOfDay]?.note}
          initialReason={dayMoods?.[editTimeOfDay]?.reason}
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
