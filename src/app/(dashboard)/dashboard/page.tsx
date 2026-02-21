import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rooms, roomMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { CreateRoomForm } from "./CreateRoomForm";
import { JoinRoomForm } from "./JoinRoomForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userRooms = await db
    .select({
      id: rooms.id,
      roomId: rooms.roomId,
      name: rooms.name,
      role: roomMembers.role,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(rooms.id, roomMembers.roomId))
    .where(eq(roomMembers.userId, session.user.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-gray-400 mt-1">ルームを作成するか、参加してください</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-4">ルームを作成</h2>
          <CreateRoomForm />
        </div>
        <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
          <h2 className="font-semibold mb-4">ルームに参加</h2>
          <JoinRoomForm />
        </div>
      </div>

      {userRooms.length > 0 ? (
        <div>
          <h2 className="font-semibold mb-4">参加中のルーム</h2>
          <ul className="space-y-2">
            {userRooms.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/room/${r.roomId}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ID: {r.roomId}
                      {r.role === "owner" && (
                        <span className="ml-2 text-blue-400">オーナー</span>
                      )}
                    </span>
                  </div>
                  <span className="text-gray-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">参加中のルームはありません</p>
      )}
    </div>
  );
}
