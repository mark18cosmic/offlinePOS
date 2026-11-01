import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import type { User } from "./types";

const COOKIE = "pos_session";
const SESSION_DAYS = 30;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
}

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  db.prepare("delete from sessions where expires_at < ?").run(new Date().toISOString());
  db.prepare("insert into sessions (token_hash, user_id, expires_at) values (?, ?, ?)").run(
    sha256(token),
    userId,
    expires.toISOString(),
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db.prepare("delete from sessions where token_hash = ?").run(sha256(token));
  store.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const user = db
    .prepare(
      `select u.id, u.username, u.full_name, u.role from sessions s
       join users u on u.id = s.user_id
       where s.token_hash = ? and s.expires_at > ? and u.is_active = 1`,
    )
    .get(sha256(token), new Date().toISOString());
  return (user as User | undefined) ?? null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
