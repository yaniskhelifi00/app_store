import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createAppFolders } from "../utils/createFolders.js";


const prisma = new PrismaClient();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = "http://localhost:5000";
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
    } = req.body;
    const developerId = req.user.id;
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

//delete app
export const deleteApp = async (req, res) => {
  try {
    const appId = parseInt(req.params.id);

    // 1️⃣ Find the app in DB
    const app = await prisma.app.findUnique({ where: { id: appId } });
    if (!app) return res.status(404).json({ error: "App not found" });

    // 2️⃣ Check if the logged-in user owns this app
    if (app.developerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 3️⃣ Delete the app folder including all files
    const appFolder = path.join(__dirname, "../../public/apps", app.title);
    try {
      await fs.rm(appFolder, { recursive: true, force: true });
      console.log(`Deleted folder: ${appFolder}`);
    } catch (err) {
      console.error("Error deleting folder:", err);
      // optionally continue even if folder deletion fails
    }

    // 4️⃣ Delete the app from DB (downloads are automatically deleted due to cascade)
    await prisma.app.delete({ where: { id: appId } });

    res.json({ message: "App deleted successfully" });
  } catch (err) {
    console.error("Delete app error:", err);
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



export const getDeveloperStats = async (req, res) => {
  try {
    const developerId = req.user.id;

    // Fetch all apps for this developer
    const apps = await prisma.app.findMany({
      where: { developerId: parseInt(developerId) },
      include: {
        downloads: true, // assuming you have a Download model
      },
    });

    if (!apps || apps.length === 0) {
      return res.json({
        totalApps: 0,
        totalDownloads: 0,
        totalEarnings: 0,
      });
    }

    // Calculate stats
    const totalApps = apps.length;

    const totalDownloads = apps.reduce(
      (sum, app) => sum + (app.downloads?.length || 0),
      0
    );

    const totalEarnings = apps.reduce((sum, app) => {
      if (!app.isFree && app.price) {
        return sum + app.price * (app.downloads?.length || 0);
      }
      return sum;
    }, 0);

    res.json({
      totalApps,
      totalDownloads,
      totalEarnings,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//My Apps Controller
export const getMyApps = async (req, res) => {
  try {
    // ✅ user is injected by authenticateToken middleware
    const userId = req.user.id;
    console.log("user ID from token:", userId);

    const apps = await prisma.app.findMany({
      where: { developerId: userId }, // developerId must match the logged-in user
      include: {
        downloads: true, // include related downloads
      },
    });

    res.json(apps);
  } catch (error) {
    console.error("getMyApps error:", error);
    res.status(500).json({ error: "Server error" });
  }
};