// Create an account or reset its password from the terminal:
//   npm run user -- someone "their password" admin "Their Name"
import { db, saveUser } from "../lib/db.ts";

const [username, password, role = "cashier", fullName = username] = process.argv.slice(2);

if (!username || !password || (role !== "admin" && role !== "cashier")) {
  console.error('Usage: npm run user -- <username> <password> [admin|cashier] ["Full Name"]');
  process.exit(1);
}

saveUser(db, { username, password, role, fullName });
console.log(`Saved ${role} account for ${username}`);
