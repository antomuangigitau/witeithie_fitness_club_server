import fs from "fs";
import path from "path";
import pool from "./db.js";
import { fileURLToPath } from "url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "migrate");

  // Check if migrations folder exists
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrate folder not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith(".sql")) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, "utf8");

      try {
        await pool.query(sql);
        console.log(`✅ Migration applied: ${file}`);
      } catch (err) {
        console.error(
          `❌ Error running migration ${file}:`,
          (err as Error).message,
        );
        process.exit(1);
      }
    }
  }

  console.log("🎉 All migrations completed successfully!");
  process.exit(0);
}

runMigrations();
