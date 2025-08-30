import fs from "fs";
import path from "path";

export const createAppFolders = (appName) => {
  const appPath = path.join(process.cwd(), "public", "apps", appName);
  const screenshotsPath = path.join(appPath, "screenshots");


  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath, { recursive: true });
  if (!fs.existsSync(screenshotsPath)) fs.mkdirSync(screenshotsPath);

  return { appPath, screenshotsPath };
};
