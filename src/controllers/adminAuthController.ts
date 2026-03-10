import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import pool from "../db/db.js";
import crypto from "crypto";

const SESSION_TIMEOUT_MINUTES = process.env.SESSION_TIMEOUT_MINUTES
  ? parseInt(process.env.SESSION_TIMEOUT_MINUTES)
  : 5;

const SESSION_MAX_HOURS = process.env.SESSION_MAX_HOURS
  ? parseInt(process.env.SESSION_MAX_HOURS)
  : 24;

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  try {
    const result = await pool.query(`SELECT * FROM admins WHERE email = $1`, [
      email.toLowerCase().trim(),
    ]);
    const admin = result.rows[0];
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + SESSION_MAX_HOURS * 60 * 60 * 1000,
    ).toISOString();
    await pool.query(
      `INSERT INTO admin_sessions (admin_id, session_id, expires_at) VALUES ($1, $2, $3)`,
      [admin.id, sessionId, expiresAt],
    );

    await pool.query(
      `DELETE FROM admin_sessions 
             WHERE admin_id = $1 
             AND id NOT IN (
                 SELECT id FROM admin_sessions 
                 WHERE admin_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 5
             )`,
      [admin.id],
    );

    res.cookie("admin_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: SESSION_MAX_HOURS * 60 * 60 * 1000,
      path: "/",
    });
    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
      sessionId,
      sessionTimeout: SESSION_MAX_HOURS * 60,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  const sessionId = req.cookies["admin_session"];

  if (!sessionId) {
    return res.status(400).json({ error: "No active session" });
  }
  try {
    await pool.query(`DELETE FROM admin_sessions WHERE session_id = $1`, [
      sessionId,
    ]);
    res.clearCookie("admin_session", { path: "/" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  const sessionId = req.cookies["admin_session"];
  if (!sessionId) {
    return res.status(400).json({ error: "No active session" });
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
        WHERE admin_sessions.session_id = $1`,
      [sessionId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const session = result.rows[0];
    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    if (now.getTime() - lastActivity.getTime() > timeoutMs) {
      await pool.query(`DELETE FROM admin_sessions WHERE session_id = $1`, [
        sessionId,
      ]);
      res.clearCookie("admin_session", { path: "/" });
      return res.status(401).json({ error: "Session timed out" });
    }

    res.status(200).json({
      authenticated: true,
      admin: {
        id: session.admin_id,
        email: session.admin_email,
      },
      sessionTimeout: SESSION_TIMEOUT_MINUTES,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAdminActivity = async (req: Request, res: Response) => {
  const sessionId = req.cookies["admin_session"];
  if (!sessionId) {
    return res.status(400).json({ error: "No active session" });
  }
  try {
    const result = await pool.query(
      `UPDATE admin_sessions
          SET last_activity = NOW()
          WHERE session_id = $1
          RETURNING id`,
      [sessionId],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
