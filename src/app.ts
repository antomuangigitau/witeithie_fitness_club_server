import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import adminAuthRouter from "./routes/adminAuth.js";
import eventsRouter from "./routes/events.js";
import galleryRouter from "./routes/gallery.js";
import registrationRouter from "./routes/registration.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(adminAuthRouter);
app.use(eventsRouter);
app.use(galleryRouter);
app.use(registrationRouter);

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // console.log(`📚 API available at http://localhost:${PORT}/api/events`);
    // console.log(`🔐 Admin auth at http://localhost:${PORT}/api/admin`);
  } else {
    console.log(`✅ Server running on port ${PORT}`);
  }
});
