import { Router } from "express";

import {
  adminLogin,
  getSession,
  logoutAdmin,
  updateAdminActivity,
} from "../controllers/adminAuthController.js";

const router = Router();

router.post("/api/admin/login", adminLogin);
router.post("/api/admin/logout", logoutAdmin);
router.get("/api/admin/session", getSession);
router.post("/api/admin/activity", updateAdminActivity);

export default router;
