import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">PlayStatus</h1>
        <p className="text-gray-400">
          友達とプレイ予定を共有しよう
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-200 font-medium transition-colors"
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}
