"use server";

import { redirect } from "next/navigation";
import { endSession, startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function login(_previous: string | null, form: FormData): Promise<string | null> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const user = db.prepare("select id, password_hash from users where username = ? and is_active = 1").get(username) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return "That username or password is not right. Please try again.";
  }
  await startSession(user.id);
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
