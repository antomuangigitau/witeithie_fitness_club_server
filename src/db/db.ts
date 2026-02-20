import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Ensure DATABASE_URL exists
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("❌ DATABASE_URL environment variable is not defined!");
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production" &&
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1")
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection on startup
if (process.env.NODE_ENV !== "production") {
  pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL database");
  });
}

pool.on("error", (err) => {
  console.error("❌ Unexpected error on database client", err);
  process.exit(-1);
});

export default pool;
