import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createAppFolders } from "../utils/createFolders.js";

const prisma = new PrismaClient();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = "http://192.168.254.188:5000";
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { appPath, screenshotsPath } = createAppFolders(req.body.title);

    if (file.fieldname === "apk" || file.fieldname === "icon") cb(null, appPath);
    else if (file.fieldname === "screenshots") cb(null, screenshotsPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const uploadFiles = multer({ storage }).fields([
  { name: "apk", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "screenshots", maxCount: 10 },
]);

export const uploadApp = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      version,
      isFree,
      price,
      developerId,
    } = req.body;

    const apkFile = req.files?.["apk"] ? req.files["apk"][0].filename : null;
    const iconFile = req.files?.["icon"] ? req.files["icon"][0].filename : null;
    const screenshotsFiles = req.files?.["screenshots"] || [];

    const apkUrl = apkFile ? `/apps/${title}/${apkFile}` : null;
    const iconUrl = iconFile ? `/apps/${title}/${iconFile}` : null;
    const screenshots = screenshotsFiles.map(
      (file) => `/apps/${title}/screenshots/${file.filename}`
    );

    const newApp = await prisma.app.create({
      data: {
        title,
        description,
        category,
        apkUrl,
        iconUrl,
        screenshots,
        version: version || "1.0.0",
        isFree: isFree === "true" || isFree === true,
        price: parseFloat(price) || 0,               // Float
        developerId: parseInt(developerId), 
      },
    });

    res.status(201).json(newApp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllApps = async (req, res) => {
  try {
    const apps = await prisma.app.findMany({
      select: {
        id : true,
        iconUrl: true,
        title: true,
        version: true,
        isFree: true,
        price: true,
        downloads: true, // include all download rows
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getAppById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const app = await prisma.app.findUnique({
      where: { id },
      include: { 
        downloads: true,
        developer: {
          select: {
            name: true  // only return the developer’s name
          }
        }
      },
    });

    if (!app) return res.status(404).json({ error: "App not found" });

    res.json(app);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const appDownload = (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, "../../public/apps", fileName);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error downloading the file.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
