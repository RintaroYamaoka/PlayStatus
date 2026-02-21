"use client";

import { useRouter } from "next/navigation";
import { addComment } from "@/server/actions/comment";
import { useState, useEffect } from "react";

type Comment = {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
  userId: string;
};

export function CommentSection({
  eventId,
  currentUserId,
}: {
  eventId: string;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  async function fetchComments() {
    setLoadingComments(true);
    const res = await fetch(`/api/events/${eventId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoadingComments(false);
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await addComment(eventId, content);
    setLoading(false);
    if (!res.success) return;
    setContent("");
    fetchComments();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">コメント</h3>
        <button
          onClick={fetchComments}
          disabled={loadingComments}
          className="text-sm text-gray-500 hover:text-gray-400 disabled:opacity-50"
        >
          更新
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="自分も行きます"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
        >
          送信
        </button>
      </form>

      {loadingComments ? (
        <p className="text-gray-500 text-sm">読み込み中...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">コメントはまだありません</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className="p-3 rounded-lg bg-gray-800/50 border border-gray-800"
            >
              <p className="text-sm text-gray-400">{c.userName}</p>
              <p className="mt-1">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
