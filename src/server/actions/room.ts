"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import {
  rooms,
  roomMembers,
  events,
  comments,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomId(): string {
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}

export async function createRoom(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  let roomId = generateRoomId();
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomId, roomId))
      .limit(1);
    if (!existing) break;
    roomId = generateRoomId();
    attempts++;
  }

  const [room] = await db
    .insert(rooms)
    .values({
      roomId,
      name,
      ownerId: session.user.id,
    })
    .returning();

  if (!room) return { success: false, error: "ルームの作成に失敗しました" };

  await db.insert(roomMembers).values({
    roomId: room.id,
    userId: session.user.id,
    role: "owner",
  });

  revalidatePath("/dashboard");
  return { success: true, roomId: room.roomId };
}

export async function joinRoom(roomIdInput: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomIdInput.toUpperCase()))
    .limit(1);

  if (!room) return { success: false, error: "ルームが見つかりません" };

  const [existing] = await db
    .select()
    .from(roomMembers)
    .where(
      and(eq(roomMembers.roomId, room.id), eq(roomMembers.userId, session.user.id))
    )
    .limit(1);

  if (existing) {
    return { success: true, roomId: room.roomId };
  }

  await db.insert(roomMembers).values({
    roomId: room.id,
    userId: session.user.id,
    role: "member",
  });

  revalidatePath("/dashboard");
  return { success: true, roomId: room.roomId };
}

export async function updateRoomName(roomCode: string, newName: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomCode.toUpperCase()))
    .limit(1);

  if (!room) return { success: false, error: "ルームが見つかりません" };

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, room.id),
        eq(roomMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!member || member.role !== "owner") {
    return { success: false, error: "権限がありません" };
  }

  await db.update(rooms).set({ name: newName }).where(eq(rooms.id, room.id));
  revalidatePath(`/room/${roomCode}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeMember(
  roomCode: string,
  userIdToRemove: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomCode.toUpperCase()))
    .limit(1);

  if (!room) return { success: false, error: "ルームが見つかりません" };

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, room.id),
        eq(roomMembers.userId, session.user.id)
      )
    )
    .limit(1);

  if (!member || member.role !== "owner") {
    return { success: false, error: "権限がありません" };
  }

  if (userIdToRemove === session.user.id) {
    return { success: false, error: "自分自身を削除することはできません" };
  }

  await db
    .delete(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, room.id),
        eq(roomMembers.userId, userIdToRemove)
      )
    );

  revalidatePath(`/room/${roomCode}`);
  return { success: true };
}

export async function deleteRoom(roomCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "ログインが必要です" };

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomCode.toUpperCase()))
    .limit(1);

  if (!room) return { success: false, error: "ルームが見つかりません" };
  if (room.ownerId !== session.user.id) {
    return { success: false, error: "権限がありません" };
  }

  await db.delete(rooms).where(eq(rooms.id, room.id));
  revalidatePath("/dashboard");
  return { success: true };
}
