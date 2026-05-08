"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setDone(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスまたはパスワードが間違っています");
      } else {
        router.push(redirect);
      }
    }

    setLoading(false);
  };

  if (done) {
    return (
      <div className={styles.center}>
        <div className={styles.card}>
          <p className={styles.emoji}>📬</p>
          <h1 className={styles.title}>確認メールを送りました</h1>
          <p className={styles.subtitle}>メール内のリンクをクリックしてログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.center}>
      <div className={styles.card}>
        <p className={styles.emoji}>⛅</p>
        <h1 className={styles.title}>きぶんカレンダー</h1>
        <p className={styles.subtitle}>毎日の気分を家族と共有しよう</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "…" : mode === "signin" ? "ログイン" : "アカウント作成"}
          </button>
        </form>

        <button
          className={styles.toggleButton}
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
        >
          {mode === "signin" ? "アカウントを作成する" : "ログインに戻る"}
        </button>
      </div>
    </div>
  );
}
