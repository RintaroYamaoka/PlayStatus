"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/server/actions/room";

export function CreateRoomForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await createRoom(name);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "作成に失敗しました");
      return;
    }
    router.push(`/room/${res.roomId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-2 rounded bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ルーム名"
        required
        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
      >
        {loading ? "作成中..." : "作成する"}
      </button>
    </form>
  );
}
