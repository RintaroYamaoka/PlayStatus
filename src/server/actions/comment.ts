"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, comments, roomMembers, rooms } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getRoomCodeByEventId(eventId: string): Promise<string | null> {
  const [event] = await db
    .select({ roomId: events.roomId })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return null;

  const [room] = await db
    .select({ roomId: rooms.roomId })
    .from(rooms)
    .where(eq(rooms.id, event.roomId))
    .limit(1);
  return room?.roomId ?? null;
}

export async function addComment(eventId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return { success: false, error: "イベントが見つかりません" };

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(
      and(eq(roomMembers.roomId, event.roomId), eq(roomMembers.userId, session.user.id))
    )
    .limit(1);
  if (!member) return { success: false, error: "ルームに参加していません" };

  await db.insert(comments).values({
    eventId,
    userId: session.user.id,
    content: content.trim(),
  });

  const roomCode = await getRoomCodeByEventId(eventId);
  if (roomCode) revalidatePath(`/room/${roomCode}`);
  return { success: true };
}

export async function updateComment(
  eventId: string,
  commentId: string,
  content: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);
  if (!comment || comment.userId !== session.user.id) {
    return { success: false, error: "編集権限がありません" };
  }

  await db
    .update(comments)
    .set({ content: content.trim() })
    .where(eq(comments.id, commentId));

  const roomCode = await getRoomCodeByEventId(eventId);
  if (roomCode) revalidatePath(`/room/${roomCode}`);
  return { success: true };
}

export async function deleteComment(eventId: string, commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);
  if (!comment || comment.userId !== session.user.id) {
    return { success: false, error: "削除権限がありません" };
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  const roomCode = await getRoomCodeByEventId(eventId);
  if (roomCode) revalidatePath(`/room/${roomCode}`);
  return { success: true };
}
