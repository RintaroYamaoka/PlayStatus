"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, roomMembers, events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getRoomAndCheckMember(roomCode: string, userId: string) {
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomCode.toUpperCase()))
    .limit(1);

  if (!room) return null;

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(
      and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, userId))
    )
    .limit(1);

  if (!member) return null;
  return { room, member };
}

export async function createEvent(
  roomCode: string,
  data: { title: string; startTime: Date; endTime: Date }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const r = await getRoomAndCheckMember(roomCode, session.user.id);
  if (!r) return { success: false, error: "ルームが見つからないか、参加していません" };

  await db.insert(events).values({
    roomId: r.room.id,
    userId: session.user.id,
    title: data.title,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  revalidatePath(`/room/${roomCode}`);
  return { success: true };
}

export async function updateEvent(
  roomCode: string,
  eventId: string,
  data: { title: string; startTime: Date; endTime: Date }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const r = await getRoomAndCheckMember(roomCode, session.user.id);
  if (!r) return { success: false, error: "ルームが見つからないか、参加していません" };

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event || event.userId !== session.user.id) {
    return { success: false, error: "編集権限がありません" };
  }

  await db
    .update(events)
    .set({
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
    })
    .where(eq(events.id, eventId));

  revalidatePath(`/room/${roomCode}`);
  return { success: true };
}

export async function deleteEvent(roomCode: string, eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event || event.userId !== session.user.id) {
    return { success: false, error: "削除権限がありません" };
  }

  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath(`/room/${roomCode}`);
  return { success: true };
}
