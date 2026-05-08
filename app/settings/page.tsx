"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { createFamily, updateFamilyName } from "@/lib/supabase/families";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { uid, user } = useAuth();
  const { family, loading } = useFamily(uid);
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
      setToast("更新に失敗しました: " + error.message);
      return;
    }
    await supabase.from("profiles").upsert({ id: uid, name: name.trim() });
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
      setToast("アップロードに失敗しました: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl + `?t=${Date.now()}`;

    await Promise.all([
      supabase.from("profiles").upsert({ id: uid, avatar_url: url }),
      supabase.auth.updateUser({ data: { avatar_url: url } }),
    ]);
    setAvatar(url);
    setToast("アイコンを変更したよ！");
    setUploading(false);
  };

  const handleCreateFamily = async () => {
    if (!uid || !familyName.trim()) return;
    try {
      await createFamily(uid, familyName.trim());
      setToast("ファミリーを作成したよ！");
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      setToast("作成に失敗しました: " + msg);
      console.error(e);
    }
  };

  const handleFamilyNameSave = async () => {
    if (!family || !editFamilyName.trim()) return;
    try {
      await updateFamilyName(family.id, editFamilyName.trim());
      setToast("グループ名を更新したよ！");
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? String(e);
      setToast("更新に失敗しました: " + msg);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setToast("招待リンクをコピーしたよ！");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div>
      <Header title="設定画面" />
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>アイコン</h2>
          <div className={styles.avatarArea}>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "アップロード中…" : "写真を変更"}
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>名前</h2>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="あなたの名前"
          />
          <Button onClick={handleNameSave} fullWidth>保存</Button>
        </section>

        {!loading && !family && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ファミリーを作る</h2>
            <input
              className={styles.input}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="ファミリーの名前（例：田中家）"
            />
            <Button onClick={handleCreateFamily} fullWidth>作成</Button>
          </section>
        )}

        {family && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>グループ</h2>
            <input
              className={styles.input}
              value={editFamilyName}
              onChange={(e) => setEditFamilyName(e.target.value)}
              placeholder="グループ名"
            />
            <Button onClick={handleFamilyNameSave} fullWidth>グループ名を保存</Button>
            <p className={styles.hint}>招待リンクを家族に送ろう</p>
            <div className={styles.inviteRow}>
              <span className={styles.inviteUrl}>{inviteUrl}</span>
              <Button variant="secondary" onClick={copyInvite}>コピー</Button>
            </div>
            <p className={styles.memberCount}>メンバー: {family.members.length}人</p>
          </section>
        )}

        <section className={styles.section}>
          <Button variant="ghost" fullWidth onClick={handleSignOut}>
            サインアウト
          </Button>
        </section>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
