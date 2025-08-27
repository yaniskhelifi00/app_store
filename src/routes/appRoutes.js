import express from "express";
import appController from "../controllers/appController.js";

const router = express.Router();

// Upload a new app
router.post("/upload", appController.uploadApp);

// Download app
router.get("/download", appController.appDownload);

// Get all apps
router.get("/", appController.getAllApps);

// Get one app by ID
router.get("/:id", appController.getAppById);

export default router;
