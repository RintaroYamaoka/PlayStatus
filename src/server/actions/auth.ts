"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function signUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { success: false, error: "このメールアドレスは既に登録されています" };
  }

  await db.insert(users).values({
    email,
    hashedPassword,
    name,
  });

  return { success: true };
}
