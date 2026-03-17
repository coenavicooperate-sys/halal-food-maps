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

-- 3. restaurant_reviews テーブル（サイト独自の口コミ）
CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id TEXT NOT NULL,
  restaurant_slug TEXT NOT NULL,
  author_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存テーブルに photos カラムを追加する場合（テーブル作成済みなら実行）
ALTER TABLE restaurant_reviews ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_lookup
  ON restaurant_reviews (area_id, restaurant_slug);

-- RLS
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能
CREATE POLICY "Public read reviews" ON restaurant_reviews
  FOR SELECT USING (true);

-- 誰でも投稿可能（匿名OK）
CREATE POLICY "Public insert review" ON restaurant_reviews
  FOR INSERT WITH CHECK (true);

-- 4. Storage バケット（口コミ写真用、最大5枚/投稿）
-- バケットが既にある場合はエラーになるが、ポリシーは作成される
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 誰でも読み取り・アップロード可能
DROP POLICY IF EXISTS "Public read review photos" ON storage.objects;
CREATE POLICY "Public read review photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Public upload review photos" ON storage.objects;
CREATE POLICY "Public upload review photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-photos');
