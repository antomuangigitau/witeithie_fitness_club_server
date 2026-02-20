import pool from "../db/db.js";

import path from "path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
// ESM-safe __dirname
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const SALT_ROUNDS = 12;

async function seedAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert admin (on conflict, update password)
    const result = await pool.query(
      `INSERT INTO admins (email, password_hash) 
             VALUES ($1, $2) 
             ON CONFLICT (email) 
             DO UPDATE SET password_hash = $2
             RETURNING id, email`,
      [email, passwordHash],
    );

    return result.rows[0];
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Failed to seed admin:", error.message);
    } else {
      console.error("❌ Failed to seed admin:", error);
    }
    throw error;
  }
}

// Main execution
async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  // Seed admin
  const admin = await seedAdmin({ email, password });
  console.log("✅ Admin seeded successfully:", admin);

  // Close pool
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
