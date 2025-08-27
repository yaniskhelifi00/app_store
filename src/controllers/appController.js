import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadApp = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      apkUrl,
      iconUrl,
      screenshots,
      version,
      isFree,
      price,
      developerId,
    } = req.body;

    const newApp = await prisma.app.create({
      data: {
        title,
        description,
        category,
        apkUrl,
        iconUrl,
        screenshots: screenshots || [],
        version: version || "1.0.0",
        isFree: isFree !== undefined ? isFree : true,
        price: price || 0,
        developerId,
      },
    });

    res.status(201).json(newApp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllApps = async (req, res) => {
  try {
    const apps = await prisma.app.findMany({
      include: {
        developer: true, // fetch developer info
        downloads: true, // fetch downloads if needed
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAppById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const app = await prisma.app.findUnique({
      where: { id },
      include: { developer: true, downloads: true },
    });
    if (!app) return res.status(404).json({ error: "App not found" });
    res.json(app);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const appDownload = (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../public/download/test.apk");
    res.download(filePath, "test.apk", (err) => {
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

export default {
  uploadApp,
  getAllApps,
  getAppById,
  appDownload,
};
