// src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import appRoutes from "./routes/appRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/app", appRoutes);
app.use("/auth", authRoutes);

// ✅ Serve files inside public/download as /download
app.use("/download", express.static(path.join(__dirname, "..", "public", "download")));
app.use("/apps", express.static(path.join(__dirname, "../public/apps")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
