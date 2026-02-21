import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, users, events, roomMembers } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(
      and(
        eq(roomMembers.roomId, event.roomId),
        eq(roomMembers.userId, session.user.id)
      )
    )
    .limit(1);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const commentList = await db
    .select({
      id: comments.id,
      content: comments.content,
      userName: users.name,
      createdAt: comments.createdAt,
      userId: comments.userId,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.eventId, eventId))
    .orderBy(asc(comments.createdAt));

  return NextResponse.json(commentList);
}
