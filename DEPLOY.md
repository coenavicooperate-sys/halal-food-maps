# Halal Food Maps - Web 公開手順

このアプリを Web 上で公開する方法です。

## 方法1: Vercel（推奨・無料）

1. **GitHub にプッシュ**
   - プロジェクトを GitHub リポジトリにプッシュ

2. **Vercel でデプロイ**
   - [vercel.com](https://vercel.com) にアクセス
   - 「Sign Up」→ GitHub でログイン
   - 「Add New」→「Project」→ リポジトリを選択
   - 「Deploy」をクリック（設定はそのままでOK）
   - 数分で `https://あなたのプロジェクト.vercel.app` のような URL が発行されます

3. **URL を共有**
   - 発行された URL を他の人に送れば、どこからでもアクセスできます

---

## 方法2: コマンドラインから（Vercel CLI）

```bash
# Vercel CLI を実行（初回はログインが必要）
npx vercel

# 本番デプロイ
npx vercel --prod
```

---

## 方法3: Netlify

1. [netlify.com](https://netlify.com) にアクセス
2. 「Add new site」→「Import an existing project」
3. GitHub を連携してリポジトリを選択
4. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 「Deploy site」をクリック

---

## ビルドの確認

デプロイ前にローカルでビルドが通るか確認:

```bash
npm run build
npm run preview
```

`http://localhost:4173` でプレビュー表示されればOKです。
