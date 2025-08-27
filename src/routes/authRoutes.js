import express from "express";
import { register, login } from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    user: req.user,
  });
});

export default router;
