import express from "express";
import * as appController from "../controllers/appController.js";

const router = express.Router();

// Upload new app (APK + icon + screenshots)
router.post("/upload", appController.uploadFiles, appController.uploadApp);

// Get all apps
router.get("/", appController.getAllApps);

// Get app by ID
router.get("/:id", appController.getAppById);

// Download an app file
router.get("/download/:fileName", appController.appDownload);

export default router;
