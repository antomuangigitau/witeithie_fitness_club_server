import pool from "../db/db.js";
import type { Request, Response } from "express";
import { deleteAsset } from "./cloudController.js";

export const getGalleryItems = async (_req: Request, res: Response) => {
  try {
    const result =
      await pool.query(`SELECT gi.id, gi.event_id, gi.image_url, gi.caption, gi.position, gi.created_at, e.title
       FROM gallery_images gi
       JOIN events e ON e.id = gi.event_id
        ORDER BY e.event_datetime DESC, gi.position ASC`);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGalleryItemsByEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT gi.id, gi.event_id, gi.image_url, gi.caption, gi.position, e.title
       FROM gallery_images gi
         JOIN events e ON e.id = gi.event_id
        WHERE gi.event_id = $1
        ORDER BY gi.position ASC`,
      [eventId],
    );

    if (!result.rows) {
      return res.status(500).json({ error: "Failed to fetch gallery items" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addGalleryItem = async (req: Request, res: Response) => {
  const { event_id: eventId, images } = req.body;
  if (!eventId || !Array.isArray(images)) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const eventCheck = await client.query(
      "SELECT id FROM events WHERE id = $1",
      [eventId],
    );
    if (eventCheck.rows.length === 0) {
      throw new Error("Event not found");
    }

    const posResult = await client.query(
      "SELECT COALESCE(MAX(position), -1) as max_pos FROM gallery_images WHERE event_id = $1",
      [eventId],
    );
    let currentPos = Number(posResult.rows[0].max_pos + 1);

    const insertedImages = [];

    for (const img of images) {
      // Backend expects snake_case for image_url
      const { image_url: imageUrl, caption } = img;

      const result = await client.query(
        `INSERT INTO gallery_images (event_id, image_url, caption, position)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [eventId, imageUrl, caption, currentPos++],
      );
      insertedImages.push(result.rows[0]);
    }
    await client.query("COMMIT");
    // Return raw snake_case rows
    res.status(201).json(insertedImages);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Gallery Image Not Found" });
  }
  try {
    const result = await pool.query(
      `SELECT image_url FROM gallery_images WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    const { image_url } = result.rows[0];
    const parts = image_url.split("/");
    const filenameWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;

    await deleteAsset(publicId);
    await pool.query("DELETE FROM gallery_images WHERE id = $1", [id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
