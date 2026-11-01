import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, DATA_DIR } from "./db";
import type { User } from "./types";

const COOKIE = "pos_session";
const SESSION_DAYS = 30;

/**
 * Logins live in a signed cookie, not the database, so they work when hosting runs each page
 * on its own server (Vercel does). Set AUTH_SECRET there; locally a secret is created on first use.
 */
function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const file = path.join(DATA_DIR, ".auth-secret");
  try {
    fs.writeFileSync(file, randomBytes(32).toString("hex"), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  return fs.readFileSync(file, "utf8");
}

const sign = (payload: string) => createHmac("sha256", authSecret()).update(payload).digest("hex");

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
}

export async function startSession(userId: number, sessionVersion: number) {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const payload = `${userId}.${sessionVersion}.${expires.getTime()}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const parts = (await cookies()).get(COOKIE)?.value.split(".");
  if (parts?.length !== 4) return null;
  const [userId, version, expires, signature] = parts;

  const expected = Buffer.from(sign(`${userId}.${version}.${expires}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (Number(expires) < Date.now()) return null;

  // The version check signs people out after a password change or removal.
  const user = db
    .prepare(
      "select id, username, full_name, role from users where id = ? and session_version = ? and is_active = 1",
    )
    .get(Number(userId), Number(version));
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
