"use client";

import { useState, useEffect } from "react";
import { createEvent, updateEvent, deleteEvent } from "@/server/actions/event";
import { CommentSection } from "@/components/comments/CommentSection";

type EventData = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  userName: string;
};

export function EventModal({
  event,
  roomCode,
  onClose,
  onUpdated,
  onCreated,
  initialSlot,
}: {
  event?: EventData;
  roomCode: string;
  onClose: () => void;
  onUpdated?: () => void;
  onCreated?: () => void;
  initialSlot?: { start: Date; end: Date };
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [startTime, setStartTime] = useState(
    event
      ? new Date(event.startTime).toISOString().slice(0, 16)
      : initialSlot
        ? initialSlot.start.toISOString().slice(0, 16)
        : ""
  );
  const [endTime, setEndTime] = useState(
    event
      ? new Date(event.endTime).toISOString().slice(0, 16)
      : initialSlot
        ? initialSlot.end.toISOString().slice(0, 16)
        : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialSlot && !event) {
      setStartTime(initialSlot.start.toISOString().slice(0, 16));
      setEndTime(initialSlot.end.toISOString().slice(0, 16));
    }
  }, [initialSlot, event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isEdit && event) {
      const res = await updateEvent(roomCode, event.id, {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error ?? "更新に失敗しました");
        return;
      }
      onUpdated?.();
    } else {
      const res = await createEvent(roomCode, {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error ?? "作成に失敗しました");
        return;
      }
      onCreated?.();
    }
  }

  async function handleDelete() {
    if (!event) return;
    setLoading(true);
    const res = await deleteEvent(roomCode, event.id);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "削除に失敗しました");
      return;
    }
    onUpdated?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {isEdit ? "予定を編集" : "予定を追加"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-400 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2 rounded bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                タイトル（ゲーム名・練習場所）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  開始時刻
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">終了時刻</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {isEdit && (
              <p className="text-sm text-gray-500">作成者: {event.userName}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
              >
                {loading ? "保存中..." : isEdit ? "更新" : "追加"}
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-medium disabled:opacity-50"
                >
                  削除
                </button>
              )}
            </div>
          </form>

          {isEdit && event && (
            <div className="border-t border-gray-800 pt-6">
              <CommentSection eventId={event.id} />
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 max-w-sm w-full">
            <p className="mb-4">この予定を削除しますか？</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                削除する
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
