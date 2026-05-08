"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFamilyByToken, joinFamily } from "@/lib/supabase/families";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { uid, loading: authLoading } = useAuth();
  const router = useRouter();
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!uid) {
      router.replace(`/signin?redirect=/invite/${token}`);
      return;
    }
    getFamilyByToken(token).then((fam) => {
      if (fam) setFamilyName(fam.name);
      else setError("招待リンクが無効です");
    });
  }, [token, authLoading, uid, router]);

  const handleJoin = async () => {
    if (!uid || !token) return;
    setJoining(true);
    const fam = await getFamilyByToken(token);
    if (!fam) { setError("招待リンクが無効です"); return; }
    await joinFamily(uid, fam.id);
    router.push("/");
  };

  if (error) {
    return <div className={styles.center}><p className={styles.error}>{error}</p></div>;
  }

  return (
    <div className={styles.center}>
      <div className={styles.card}>
        <p className={styles.emoji}>👨‍👩‍👧‍👦</p>
        <h1 className={styles.title}>招待が届いたよ</h1>
        <p className={styles.fam}>{familyName || "…"} に参加しませんか？</p>
        <Button fullWidth onClick={handleJoin} disabled={joining}>
          {joining ? "参加中…" : "参加する"}
        </Button>
      </div>
    </div>
  );
}
