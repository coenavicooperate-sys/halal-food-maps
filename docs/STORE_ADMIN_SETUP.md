# 店舗管理機能 セットアップガイド

店舗ごとにID・パスワードを発行し、個店が自分で情報を編集できる機能です。

## 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) でアカウント作成
2. 新規プロジェクトを作成
3. プロジェクト設定 > API から **URL** と **anon public** キーをコピー

## 2. 環境変数設定

`.env.example` を `.env` にコピーし、値を設定:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## 3. データベースセットアップ

Supabase Dashboard > SQL Editor で `supabase-setup.sql` の内容を実行

## 4. 店舗アカウント作成

Supabase Dashboard > **Authentication** > **Users** > **Add user** で追加:

| 項目 | 例 |
|------|-----|
| Email | `shibuya-halal-ramen-ouka@store.halalfoodmaps.app` |
| Password | 店舗に発行するパスワード |

**店舗への案内:**
- **ログインID**: `shibuya-halal-ramen-ouka`（メールの @ より前の部分）
- **パスワード**: 上記で設定したもの

ログインIDの形式: `{エリアID}-{店舗スラッグ}`  
例: `shinjuku-sushi-halal-shinjuku`（新宿の Sushi Halal Shinjuku）

## 5. 店舗スラッグ一覧

店舗名からスラッグを生成: 小文字・スペースをハイフンに変換

- Halal Ramen Ouka → `halal-ramen-ouka`
- Sushi Halal Tokyo → `sushi-halal-tokyo`
- Cafe Salam → `cafe-salam`

## 6. 編集可能な項目

- 店舗説明
- 営業時間
- 電話番号
- 住所
- 予約URL
- メニューURL
- 支払い方法
- Wi-Fi / 駐車場

## 7. アクセスURL

- ログイン: `/login`
- 管理画面: `/admin`（ログイン後）
