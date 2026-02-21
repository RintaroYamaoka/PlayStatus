# PlayStatus

友達同士でプレイ予定を共有するWebアプリ。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、値を設定してください。

```bash
cp .env.example .env
```

`.env` に必要な環境変数:
- `DATABASE_URL`: Neon PostgreSQL の接続URL
- `NEXTAUTH_SECRET`: ランダムな文字列（例: `openssl rand -base64 32` で生成）
- `NEXTAUTH_URL`: アプリのURL（開発時は `http://localhost:3000`）

### 3. データベースのセットアップ

Neon でプロジェクトとデータベースを作成したら、マイグレーションを実行します。

```bash
npm run db:push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## デプロイ（Vercel）

1. [Vercel](https://vercel.com) にプロジェクトをインポート（GitHub連携推奨）
2. 環境変数を設定:
   - `DATABASE_URL`: Neon の接続URL
   - `NEXTAUTH_SECRET`: ランダムな文字列
   - `NEXTAUTH_URL`: デプロイ後のURL（例: `https://your-app.vercel.app`）
3. デプロイ後、Neon でマイグレーションを実行:
   ```bash
   DATABASE_URL="your-neon-url" npm run db:push
   ```

## 技術スタック

- Next.js 15 (App Router)
- TypeScript
- Drizzle ORM + Neon (PostgreSQL)
- NextAuth.js (Credentials)
- Tailwind CSS
