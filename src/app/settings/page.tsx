"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFamily, useFamilyMembers } from "@/hooks/useFamily";
import { createFamily, updateFamilyName } from "@/lib/supabase/families";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { uid, user, refetchProfile } = useAuth();
  const { family, loading } = useFamily(uid);
  const { members, refetch: refetchMembers } = useFamilyMembers(family);
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [editFamilyName, setEditFamilyName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (user?.image) setAvatar(user.image);
  }, [user?.image]);

  useEffect(() => {
    if (family) {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setInviteUrl(`${base}/invite/${family.inviteToken}`);
      setEditFamilyName(family.name);
    }
  }, [family]);

  const handleNameSave = async () => {
    if (!uid || !name.trim()) return;
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });
    if (error) {
      console.error("name update error:", error);
      setToast("更新に失敗しました");
      return;
    }
    await supabase.from("profiles").upsert({ id: uid, name: name.trim() });
    refetchProfile();
    refetchMembers();
    setToast("名前を更新したよ！");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${uid}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("avatar upload error:", uploadError);
      setToast("アップロードに失敗しました");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;

    await Promise.all([
      supabase.from("profiles").upsert({ id: uid, avatar_url: url }),
      supabase.auth.updateUser({ data: { avatar_url: url } }),
    ]);
    setAvatar(url + `?t=${Date.now()}`);
    setToast("アイコンを変更したよ！");
    setUploading(false);
  };

  const handleCreateFamily = async () => {
    if (!uid || !familyName.trim()) return;
    try {
      await createFamily(uid, familyName.trim());
      setToast("ファミリーを作成したよ！");
    } catch (e) {
      console.error("family create error:", e);
      setToast("作成に失敗しました");
    }
  };

  const handleFamilyNameSave = async () => {
    if (!family || !editFamilyName.trim()) return;
    try {
      await updateFamilyName(family.id, editFamilyName.trim());
      setToast("グループ名を更新したよ！");
    } catch (e) {
      console.error("family name update error:", e);
      setToast("更新に失敗しました");
    }
  };

  const shareInvite = async () => {
    const message = `${user?.name ?? ""}さんが${family?.name ?? ""}に招待しています！`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "きぶんカレンダー", text: message, url: inviteUrl });
      } catch {
        // キャンセル時は何もしない
      }
    } else {
      await navigator.clipboard.writeText(`${message}\n${inviteUrl}`);
      setToast("招待リンクをコピーしたよ！");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("アカウントを削除すると、すべてのデータが失われます。本当に削除しますか？")) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      console.error("delete account error:", error);
      setToast("削除に失敗しました");
      return;
    }
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div className={styles.container}>
      <Header title="設定" hideAvatar />

      <main className={styles.main}>
        {/* Profile */}
        <section className={styles.profileSection}>
          <div className={styles.avatarWrap}>
            {avatar ? (
              <Image
                src={avatar}
                alt="アイコン"
                width={80}
                height={80}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) ?? "?"}
              </div>
            )}
            <button
              className={styles.avatarEditBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="写真を変更"
            >
              <svg className={styles.editIcon} fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
          </div>
          <p className={styles.profileName}>{user?.name ?? ""}</p>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>名前</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前を入力"
            />
          </div>
          <div className={styles.saveBtnWrap}>
            <Button onClick={handleNameSave} fullWidth>保存する</Button>
          </div>
        </section>

        <div className={styles.divider} />

        {/* Create family (no family yet) */}
        {!loading && !family && (
          <>
            <section className={styles.section}>
              <label className={styles.sectionLabel}>ファミリーを作る</label>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>ファミリー名</label>
                <input
                  className={styles.input}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="ファミリーの名前（例：田中家）"
                />
              </div>
              <Button onClick={handleCreateFamily} fullWidth>作成</Button>
            </section>
            <div className={styles.divider} />
          </>
        )}

        {/* Group settings */}
        {family && (
          <>
            <section className={styles.section}>
              <label className={styles.sectionLabel}>グループ設定</label>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>グループ名</label>
                <input
                  className={styles.input}
                  value={editFamilyName}
                  onChange={(e) => setEditFamilyName(e.target.value)}
                  placeholder="グループ名"
                />
              </div>
              <button className={styles.outlineBtn} onClick={handleFamilyNameSave}>
                グループ名を保存
              </button>

              <div className={styles.inviteBlock}>
                <label className={styles.fieldLabel}>家族を招待する</label>
                <div className={styles.inviteRow}>
                  <span className={styles.inviteUrl}>{inviteUrl}</span>
                  <Button variant="secondary" onClick={shareInvite}>シェア</Button>
                </div>
              </div>
            </section>
            <div className={styles.divider} />

            {/* Members */}
            <section className={styles.section}>
              <label className={styles.sectionLabel}>メンバー</label>
              <div className={styles.memberList}>
                {members.map((m) => (
                  <div key={m.uid} className={styles.memberItem}>
                    <div className={styles.memberInfo}>
                      {m.avatarUrl ? (
                        <Image
                          src={m.avatarUrl}
                          alt={m.name}
                          width={36}
                          height={36}
                          className={styles.memberAvatar}
                        />
                      ) : (
                        <div className={styles.memberAvatarPlaceholder}>
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className={styles.memberName}>{m.name}</span>
                    </div>
                    {m.uid === uid && <span className={styles.youBadge}>あなた</span>}
                  </div>
                ))}
              </div>
            </section>
            <div className={styles.divider} />
          </>
        )}

        {/* Danger zone */}
        <section className={styles.dangerSection}>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            サインアウト
          </button>
          <div className={styles.dangerDivider} />
          <button className={styles.deleteBtn} onClick={handleDeleteAccount}>
            アカウントを削除する
          </button>
        </section>
      </main>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
