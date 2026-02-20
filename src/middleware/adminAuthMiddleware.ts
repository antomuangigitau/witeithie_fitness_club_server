import pool from "../db/db.js";
const SESSION_TIMEOUT_MINUTES = process.env.SESSION_TIMEOUT_MINUTES
  ? parseInt(process.env.SESSION_TIMEOUT_MINUTES)
  : 5;
import type { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: Function,
) => {
  const sessionId = req.cookies["admin_session"];
  if (!sessionId) {
    return res.status(401).json({ error: "Unauthorized: No active session" });
  }
  try {
    const result = await pool.query(
      `SELECT 
            admin_sessions.session_id,
            admin_sessions.admin_id,
            admin_sessions.created_at,
            admin_sessions.expires_at,
            admin_sessions.last_activity,
            admins.email AS admin_email
        FROM admin_sessions
        JOIN admins ON admin_sessions.admin_id = admins.id
        WHERE admin_sessions.session_id = $1 AND admin_sessions.expires_at > NOW()`,
      [sessionId],
    );
    if (result.rows.length === 0) {
      res.clearCookie("admin_session");
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid or expired session" });
    }
    const session = result.rows[0];
    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const expires_at = new Date(session.expires_at);

    if (now > expires_at) {
      await pool.query(`DELETE FROM admin_sessions WHERE session_id = $1`, [
        sessionId,
      ]);
      res.clearCookie("admin_session", { path: "/" });
      return res.status(401).json({ error: "Unauthorized: Session expired" });
    }
    const inactivityMs = now.getTime() - lastActivity.getTime();
    const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    if (inactivityMs > timeoutMs) {
      await pool.query(`DELETE FROM admin_sessions WHERE session_id = $1`, [
        sessionId,
      ]);
      res.clearCookie("admin_session", { path: "/" });
      return res.status(401).json({ error: "Unauthorized: Session timed out" });
    }
    await pool.query(
      `UPDATE admin_sessions SET last_activity = NOW(), expires_at = NOW() + INTERVAL '${SESSION_TIMEOUT_MINUTES} minutes' WHERE session_id = $1`,
      [sessionId],
    );
    req.admin = {
      id: session.admin_id,
      email: session.admin_email,
      sessionId: session.session_id,
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
