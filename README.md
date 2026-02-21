# PlayStatus

> 友達とプレイ予定を共有しよう

オンラインゲームやスポーツの練習をする友達同士で、**誰が今プレイしているか・する予定か**を共有できるWebアプリです。

**[🔗 アプリを開く](https://play-status.vercel.app/)**

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-blue?logo=neon)

---

## 紹介

友人とルームを作成し、カレンダーで予定を共有。ゲームのプレイ時間や練習日程を一目で確認できます。

- **ルーム管理** … 6桁のIDで招待、シンプルな参加フロー
- **カレンダー** … 月・週表示、日付クリックで予定追加
- **イベント** … タイトル・開始〜終了時刻を指定
- **コメント** … 「自分も行きます」など、参加表明が可能
- **権限管理** … オーナーがメンバー・ルームの管理を担当

---

## 技術のポイント

### フロントエンド
- **Next.js 15 App Router** … ルートグループ `(auth)` `(dashboard)` でレイアウトを分離
- **Server Actions** … フォーム送信やデータ更新をサーバー側で実行、`revalidatePath` で即時反映
- **React Big Calendar** … 月・週ビューに対応したカレンダーUI
- **Tailwind CSS** … コンポーネント単位のスタイリング

### バックエンド・インフラ
- **NextAuth.js** … Credentials 認証、JWT セッション（bcrypt でパスワードハッシュ）
- **Drizzle ORM + Neon (PostgreSQL)** … 型安全なクエリ、サーバーレス対応
- **Vercel** … Edge/Serverless でのデプロイ

### データベース設計
- **users / rooms / room_members / events / comments** の正規化されたスキーマ
- **多対多** … `room_members` でルームとユーザーを関連付け
- **owner / member** … ロールで権限を制御
- **cascade delete** … ルーム削除時にイベント・コメントも一括削除

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router), React 19 |
| 言語 | TypeScript 5.7 |
| スタイル | Tailwind CSS |
| 認証 | NextAuth.js (Credentials + JWT) |
| DB / ORM | Neon PostgreSQL, Drizzle ORM |
| カレンダー | react-big-calendar |
| デプロイ | Vercel |
