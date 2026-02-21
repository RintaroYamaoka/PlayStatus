"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateRoomName,
  removeMember,
  deleteRoom,
} from "@/server/actions/room";

type Member = {
  userId: string;
  userName: string;
  role: string;
};

export function RoomSettings({
  roomCode,
  roomName,
  members,
  currentUserId,
}: {
  roomCode: string;
  roomName: string;
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState(roomName);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteRoomConfirm, setShowDeleteRoomConfirm] = useState(false);

  const isOwner = members.some(
    (m) => m.userId === currentUserId && m.role === "owner"
  );
  const otherMembers = members.filter((m) => m.userId !== currentUserId);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await updateRoomName(roomCode, newName);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "更新に失敗しました");
      return;
    }
    router.refresh();
  }

  async function handleRemoveMember(userId: string) {
    setError("");
    setLoading(true);
    const res = await removeMember(roomCode, userId);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "削除に失敗しました");
      return;
    }
    router.refresh();
  }

  async function handleDeleteRoom() {
    setLoading(true);
    const res = await deleteRoom(roomCode);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "削除に失敗しました");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!isOwner) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="text-sm text-gray-500 hover:text-gray-400"
      >
        ルーム設定
      </button>
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSettings(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-gray-900 border border-gray-800 shadow-xl z-50">
            {error && (
              <div className="mb-4 p-2 rounded bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <h3 className="font-semibold mb-4">ルーム設定</h3>
            <form onSubmit={handleUpdateName} className="space-y-2 mb-6">
              <label className="block text-sm text-gray-400">ルーム名</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </form>
            {otherMembers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  メンバー
                </label>
                <ul className="space-y-2">
                  {otherMembers.map((m) => (
                    <li
                      key={m.userId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{m.userName}</span>
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowDeleteRoomConfirm(true)}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                ルームを削除
              </button>
            </div>
          </div>
        </>
      )}
      {showDeleteRoomConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 max-w-sm w-full">
            <p className="mb-4">
              ルーム「{roomName}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteRoom}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                削除する
              </button>
              <button
                onClick={() => setShowDeleteRoomConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
