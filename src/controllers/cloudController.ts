import cloudinary from "cloudinary";
import type { Request, Response } from "express";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export const getCloudinarySignature = (req: Request, res: Response) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.v2.utils.api_sign_request(
      { timestamp, folder: "events_gallery" },
      process.env.CLOUDINARY_API_SECRET as string,
    );
    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: "events_gallery",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Cloudinary signature" });
  }
};

export const deleteAsset = async (publicId: string) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};
