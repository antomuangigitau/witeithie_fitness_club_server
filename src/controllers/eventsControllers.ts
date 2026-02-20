import pool from "../db/db.js";
import type { Request, Response } from "express";
import {
  eventRowToEvent,
  eventRowToEventDetails,
  type CreateEventPayload,
  type EventRow,
  type EventRowWithParticipants,
} from "./types/eventTypes.js";

export const getAllEvents = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<EventRowWithParticipants>(
      `SELECT
        e.*,
      COUNT(r.id) AS current_participants,
      (e.max_participants - COUNT(r.id)) AS spots_remaining
      FROM events e
      LEFT JOIN registrations r
      ON r.event_id = e.id
      WHERE e.event_datetime >= NOW()
      GROUP BY e.id;
      `,
    );

    const events = result.rows.map(eventRowToEventDetails);

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<EventRowWithParticipants>(
      `SELECT 
        e.*,
      COUNT(r.id) as current_participants,
      (e.max_participants - COUNT(r.id)) as spots_remaining
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id;`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    const fetchedEvent = result.rows[0];

    if (!fetchedEvent) {
      return res.status(500).json({ error: "Failed to fetch event" });
    }

    const event = eventRowToEventDetails(fetchedEvent);

    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  // Implementation for creating a new event
  const {
    title,
    description,
    event_datetime,
    location,
    distance,
    difficulty,
    max_participants,
    image_url,
    price,
    itinerary,
    guide,
  } = req.body;

  try {
    const result = await pool.query<EventRow>(
      `INSERT INTO events (
      title, description,event_datetime,location, distance, difficulty,max_participants, 
      image_url, price, itinerary, guide
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        title,
        description,
        event_datetime,
        location,
        distance,
        difficulty,
        max_participants,
        image_url,
        price,
        JSON.stringify(itinerary ?? null),
        JSON.stringify(guide ?? null),
      ],
    );

    const createdEvent = result.rows[0];

    if (!createdEvent) {
      return res.status(500).json({ error: "Failed to create event" });
    }

    const event = eventRowToEvent(createdEvent);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    event_datetime,
    location,
    distance,
    max_participants,
    difficulty,
    image_url,
    price,
    itinerary,
    guide,
  } = req.body;
  try {
    const result = await pool.query<EventRow>(
      `UPDATE events SET 
            title = $1, description = $2, event_datetime = $3, location = $4,
            distance = $5, max_participants = $6, difficulty = $7, image_url = $8, price = $9,
            itinerary = $10, guide = $11, updated_at = NOW()
            WHERE id = $12 RETURNING *`,
      [
        title,
        description,
        event_datetime,
        location,
        distance,
        max_participants,
        difficulty,
        image_url,
        price,
        JSON.stringify(itinerary ?? null),
        JSON.stringify(guide ?? null),
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    const updatedEvent = result.rows[0];
    if (!updatedEvent) {
      return res.status(500).json({ error: "Failed to update event" });
    }
    const updatedRowEvent = eventRowToEvent(updatedEvent);
    res.status(200).json(updatedRowEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Event>(
      "DELETE FROM events WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
