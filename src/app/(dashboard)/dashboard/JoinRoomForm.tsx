"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinRoom } from "@/server/actions/room";

export function JoinRoomForm() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await joinRoom(roomId.trim().toUpperCase());
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "参加に失敗しました");
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
        value={roomId}
        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
        placeholder="ルームID（6桁）"
        required
        maxLength={6}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium disabled:opacity-50"
      >
        {loading ? "参加中..." : "参加する"}
      </button>
    </form>
  );
}
