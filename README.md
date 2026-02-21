# PlayStatus

> 友達とプレイ予定を共有しよう

オンラインゲームやスポーツの練習をする友達同士で、**誰が今プレイしているか・する予定か**を共有できるWebアプリケーションです。

**[🔗 アプリを開く](https://play-status.vercel.app/)**

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-blue?logo=neon)

---

## 概要

友人とルームを作成し、カレンダーで予定を共有。ゲームのプレイ時間や練習日程を一目で確認できます。

## 主な機能

- **ルーム管理** … ルーム作成で6桁のIDを発行、IDを共有して友達を招待
- **カレンダー** … 月・週表示で予定を一覧、日付クリックで予定を追加
- **イベント** … ゲーム名や練習場所をタイトルに、開始・終了時刻を指定
- **コメント** … 予定に「自分も行きます」などのコメントを追加
- **権限管理** … ルームオーナーがメンバー削除・ルーム削除・ルーム名変更が可能

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロント | Next.js 15 (App Router), React, TypeScript |
| スタイル | Tailwind CSS |
| 認証 | NextAuth.js (Credentials) |
| データベース | Neon (PostgreSQL), Drizzle ORM |
| デプロイ | Vercel |

## プロジェクト構成

```
src/
├── app/              # ページ・APIルート
│   ├── (auth)/       # ログイン・サインアップ
│   ├── (dashboard)/  # ダッシュボード・ルーム一覧
│   └── room/         # ルーム内カレンダー
├── components/       # UIコンポーネント
├── lib/              # DB・認証の設定
└── server/actions/   # Server Actions
```

## ライセンス

MIT
