import pool from "../db/db.js";
import type { Request, Response } from "express";
import {
  toCamelCase,
  toCamelCaseTitle,
  type Registration,
  type RegistrationEvent,
} from "./types/registrationTypes.js";

export const getRegistrations = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<Registration>(
      `SELECT * FROM registrations`,
    );
    const registrations = result.rows.map(toCamelCase);
    res.status(200).json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRegistrationsByEventID = async (
  req: Request,
  res: Response,
) => {
  const { eventID } = req.params;

  try {
    const result = await pool.query<RegistrationEvent>(
      `SELECT reg.first_name,reg.last_name,reg.email,reg.phone_number,reg.emergency_contact_name,reg.emergency_contact_phone,
              reg.status,reg.created_at ,title 
      FROM registrations reg
          JOIN events ON events.id = reg.event_id
          WHERE reg.event_id = $1`,
      [eventID],
    );

    if (!result.rows) {
      return res
        .status(500)
        .json({ error: "Failed to fetch registration item" });
    }
    const bookingItems = result.rows;
    const registrationResult = bookingItems.map(toCamelCaseTitle);

    return res.json(registrationResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const createRegistration = async (req: Request, res: Response) => {
  const {
    event_id,
    first_name,
    last_name,
    email,
    phone_number,
    emergency_contact_name,
    emergency_contact_phone,
  } = req.body;
  if (
    !event_id ||
    !first_name ||
    !last_name ||
    !phone_number ||
    !emergency_contact_name ||
    !emergency_contact_phone
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await pool.query<Registration>(
      `INSERT INTO registrations 
        (event_id, first_name, last_name, email, phone_number, emergency_contact_name, emergency_contact_phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
      [
        event_id,
        first_name,
        last_name,
        email,
        phone_number,
        emergency_contact_name,
        emergency_contact_phone,
      ],
    );
    const createdRegistration = result.rows[0];
    if (!createdRegistration) {
      return res.status(500).json({ error: "Failed to create registration" });
    }
    const createdRegistrationCamelCase = toCamelCase(createdRegistration);
    res.status(201).json(createdRegistrationCamelCase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
