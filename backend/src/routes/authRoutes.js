const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public login
router.post("/login", authController.login);

// Protected admin profile
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
