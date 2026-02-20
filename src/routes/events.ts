import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventsControllers.js";

const router = Router();

router.get("/api/v1/events", getAllEvents);
router.get("/api/v1/events/:id", getEventById);
router.post("/api/v1/events", createEvent);
router.put("/api/v1/events/:id", updateEvent);
router.delete("/api/v1/events/:id", deleteEvent);

export default router;
