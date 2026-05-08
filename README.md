# きぶんカレンダー

家族の毎日の気分を記録・共有するアプリです。

## 機能

- 朝・昼・夜の3回、気分を記録（5段階の天気アイコン）
- 気分の理由をプルダウンで選択（体調・仕事・睡眠など）
- カレンダー・週表示で過去の気分を確認
- 家族（グループ）を作成して気分を共有
- 招待リンクで家族を招待
- しんどい気分を記録するとやる気ガチャを提案
- プロフィール写真・名前の設定

## 技術スタック

- [Next.js](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Auth / Database / Storage)
- TypeScript
- CSS Modules

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成して以下を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase の設定

Supabase ダッシュボードの SQL Editor で以下を実行してください。

```sql
-- profiles テーブル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 新規ユーザー登録時に profiles へ自動挿入
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- families テーブル
CREATE TABLE families (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "families: select" ON families FOR SELECT TO authenticated USING (true);
CREATE POLICY "families: insert" ON families FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "families: update" ON families FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM family_members WHERE family_id = families.id AND user_id = auth.uid()));

-- family_members テーブル
CREATE TABLE family_members (
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (family_id, user_id)
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_my_family_ids()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT family_id FROM family_members WHERE user_id = auth.uid();
$$;

CREATE POLICY "family_members: select" ON family_members FOR SELECT TO authenticated
  USING (family_id IN (SELECT get_my_family_ids()));
CREATE POLICY "authenticated users can join" ON family_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- moods テーブル
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_of_day TEXT NOT NULL,
  level INTEGER NOT NULL,
  note TEXT DEFAULT '',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moods: select" ON moods FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_same_family(user_id));
CREATE POLICY "users can insert own moods" ON moods FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update own moods" ON moods FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Storage: avatars バケット（パブリック）
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "avatars: upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars: update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars: public read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## デプロイ (Vercel)

1. GitHub にリポジトリを push
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. デプロイ後、Supabase の Authentication → URL Configuration に本番 URL を追加
