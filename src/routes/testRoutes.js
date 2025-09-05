import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
  console.log("📥 File uploaded:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "✅ Image uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
