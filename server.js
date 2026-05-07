require("dotenv").config();
 
const express  = require("express");
const multer   = require("multer");
const axios    = require("axios");
const fs       = require("fs");
const path     = require("path");
const FormData = require("form-data");
const rateLimit = require("express-rate-limit");
const cors     = require("cors");
 
const app = express();
 
// ── Config (use .env in production) ──────────────────────
const PORT        = process.env.PORT        || 3000;
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
 
// Allowed MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
 
// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
 
// ── Rate limiting ─────────────────────────────────────────
const scanLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 60,                   // max 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." }
});
 
// ── Multer — store in /uploads, field must be "file" ─────
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`));
    }
  }
});
 
// ── Serve frontend static files ───────────────────────────
app.use(express.static("public"));
 
// ── POST /scan — receive image, forward to FastAPI ────────
app.post(
  "/scan",
  scanLimiter,
  upload.single("file"),   // "file" matches FastAPI param name
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
 
    const filePath = req.file.path;
 
    try {
      // Forward to FastAPI
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath), {
        filename:    req.file.originalname || "capture.png",
        contentType: req.file.mimetype
      });
 
      const response = await axios.post(
        `${FASTAPI_URL}/scan`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 10000    // 10 second timeout
        }
      );
 
      res.json(response.data);
 
    } catch (error) {
      console.error("[scan] FastAPI error:", error.response?.data || error.message);
 
      const status  = error.response?.status || 502;
      const message = error.response?.data?.message
        || error.message
        || "Error communicating with scan backend.";
 
      res.status(status).json({ error: message });
 
    } finally {
      // Always clean up temp file
      fs.unlink(filePath, (err) => {
        if (err) console.warn("[cleanup] Could not delete temp file:", filePath, err.message);
      });
    }
  }
);
 
// ── Health check ──────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", fastapi: FASTAPI_URL });
});
 
// ── Multer error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    });
  }
  if (err.message?.startsWith("Unsupported file type")) {
    return res.status(415).json({ error: err.message });
  }
  console.error("[server error]", err.message);
  res.status(500).json({ error: "Internal server error." });
});
 
// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Frontend server running at http://localhost:${PORT}`);
  console.log(`🔗 Forwarding scans to FastAPI at ${FASTAPI_URL}`);
});