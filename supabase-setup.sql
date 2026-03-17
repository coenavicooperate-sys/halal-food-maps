-- Halal Food Maps 店舗管理用 Supabase セットアップ
-- Supabase Dashboard > SQL Editor で実行

-- 1. restaurant_edits テーブル（店舗ごとの編集データ）
CREATE TABLE IF NOT EXISTS restaurant_edits (
  area_id TEXT NOT NULL,
  restaurant_slug TEXT NOT NULL,
  edits JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (area_id, restaurant_slug)
);

-- RLS
ALTER TABLE restaurant_edits ENABLE ROW LEVEL SECURITY;

-- 公開ページ用: 誰でも読み取り可能
CREATE POLICY "Public read" ON restaurant_edits
  FOR SELECT USING (true);

-- 店舗スタッフ: 自店舗のみ編集可能（メールが area_id-restaurant_slug@store... の形式）
CREATE POLICY "Store edit own" ON restaurant_edits
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = area_id || '-' || restaurant_slug || '@store.halalfoodmaps.app'
  );

CREATE POLICY "Store update own" ON restaurant_edits
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = area_id || '-' || restaurant_slug || '@store.halalfoodmaps.app'
  );

-- 2. 店舗アカウント作成
-- 管理者が Supabase Dashboard > Authentication > Users で手動追加
-- または以下を SQL で実行（サービスロールキーが必要）:
--
-- 例: 渋谷の Halal Ramen Ouka のアカウント
-- email: shibuya-halal-ramen-ouka@store.halalfoodmaps.app
-- password: （発行するパスワード）
--
-- 店舗へのログインID: shibuya-halal-ramen-ouka
-- パスワード: （発行したもの）
