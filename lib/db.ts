import Database from "better-sqlite3";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// POS_DATA_DIR lets tests run against a throwaway copy, away from the shop's real data.
// Vercel only allows writing to /tmp, which is wiped often: fine for a demo, never for real sales.
export const DATA_DIR =
  process.env.POS_DATA_DIR ?? (process.env.VERCEL ? "/tmp/pos-data" : path.join(process.cwd(), "data"));

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/** Inserts an account, or updates the existing account with that email. */
export function saveUser(
  database: Database.Database,
  user: { username: string; password: string; role: "admin" | "cashier"; fullName: string },
) {
  database
    .prepare(
      `insert into users (username, full_name, password_hash, role, created_at)
       values (?, ?, ?, ?, ?)
       on conflict (username) do update set
         full_name = excluded.full_name,
         password_hash = excluded.password_hash,
         role = excluded.role,
         is_active = 1,
         session_version = session_version + 1`,
    )
    .run(user.username, user.fullName, hashPassword(user.password), user.role, new Date().toISOString());
}

function open() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new Database(path.join(DATA_DIR, "pos.db"));
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));

  // First run: fill an empty database with sample data and starter accounts.
  // The check sits inside the transaction so two processes starting together cannot both seed.
  database
    .transaction(() => {
      const { n } = database.prepare("select count(*) as n from settings").get() as { n: number };
      if (n > 0) return;
      database.exec(fs.readFileSync(path.join(process.cwd(), "db", "seed.sql"), "utf8"));
      saveUser(database, { username: "admin", password: "admin123", role: "admin", fullName: "Store Admin" });
      saveUser(database, { username: "cashier", password: "cashier123", role: "cashier", fullName: "Cashier" });
    })
    .immediate();
  return database;
}

// Keep one connection across dev-server hot reloads.
const globalForDb = globalThis as unknown as { posDb?: Database.Database };
export const db = globalForDb.posDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.posDb = db;
