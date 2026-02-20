import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  getRegistrationsByEventID,
} from "../controllers/registrationController.js";

const router = Router();

router.get("/api/v1/registrations", getRegistrations);
router.get("/api/v1/registrations/:eventID", getRegistrationsByEventID);
router.post("/api/v1/registrations", createRegistration);

export default router;
