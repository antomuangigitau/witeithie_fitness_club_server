import { Router } from "express";
import {
  getGalleryItems,
  addGalleryItem,
  getGalleryItemsByEvent,
  deleteGalleryItem,
} from "../controllers/galleryController.js";
import { getCloudinarySignature } from "../controllers/cloudController.js";

const router = Router();

router.get("/api/v1/gallery", getGalleryItems);
router.get("/api/v1/gallery/:eventId", getGalleryItemsByEvent);
router.post("/api/v1/gallery", addGalleryItem);
router.post("/api/v1/gallery/sign-cloudinary", getCloudinarySignature);
router.delete("/api/v1/gallery/:id", deleteGalleryItem);

export default router;
