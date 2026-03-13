import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "swasthsathi.db");

const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database,
});

await db.exec("PRAGMA foreign_keys = ON");
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    mobile TEXT,
    emergency_mobile TEXT,
    google_id TEXT UNIQUE,
    created_at TEXT NOT NULL
  );
`);

export async function createUser({
  name,
  email,
  passwordHash,
  mobile,
  emergencyMobile,
  googleId,
}) {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  await db.run(
    `INSERT INTO users (id, name, email, password_hash, mobile, emergency_mobile, google_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    name,
    email,
    passwordHash || null,
    mobile || null,
    emergencyMobile || null,
    googleId || null,
    createdAt,
  );
  return getUserById(id);
}

export function getUserById(id) {
  return db.get("SELECT * FROM users WHERE id = ?", id);
}

export function getUserByEmail(email) {
  return db.get("SELECT * FROM users WHERE email = ?", email);
}

export function getUserByGoogleId(googleId) {
  return db.get("SELECT * FROM users WHERE google_id = ?", googleId);
}

export async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (
      [
        "name",
        "email",
        "password_hash",
        "mobile",
        "emergency_mobile",
        "google_id",
      ].includes(key)
    ) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (!fields.length) return getUserById(id);
  values.push(id);
  await db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, ...values);
  return getUserById(id);
}
