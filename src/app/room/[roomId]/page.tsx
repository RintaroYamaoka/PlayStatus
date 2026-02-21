import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  rooms,
  roomMembers,
  events,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { CalendarView } from "@/components/calendar/CalendarView";
import { RoomSettings } from "@/components/room/RoomSettings";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomId, roomId.toUpperCase()))
    .limit(1);

  if (!room) notFound();

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

  if (!member) redirect("/dashboard");

  const roomEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startTime: events.startTime,
      endTime: events.endTime,
      userId: events.userId,
      userName: users.name,
    })
    .from(events)
    .innerJoin(users, eq(users.id, events.userId))
    .where(eq(events.roomId, room.id));

  const roomMembersList = await db
    .select({
      userId: users.id,
      userName: users.name,
      role: roomMembers.role,
    })
    .from(roomMembers)
    .innerJoin(users, eq(users.id, roomMembers.userId))
    .where(eq(roomMembers.roomId, room.id));

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-400"
            >
              ← ダッシュボード
            </Link>
            <div>
              <h1 className="text-xl font-bold">{room.name}</h1>
              <p className="text-gray-500 text-sm">ID: {room.roomId}</p>
            </div>
          </div>
          <RoomSettings
            roomCode={room.roomId}
            roomName={room.name}
            members={roomMembersList}
            currentUserId={session.user.id}
          />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <CalendarView
          roomCode={room.roomId}
          events={roomEvents}
          isOwner={member.role === "owner"}
          roomId={room.id}
        />
      </main>
    </div>
  );
}
