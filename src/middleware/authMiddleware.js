import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user details from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true ,role: true ,createdAt: true,downloads: true,apps : true}, // only safe fields
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // attach full user object
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default authenticateToken;
