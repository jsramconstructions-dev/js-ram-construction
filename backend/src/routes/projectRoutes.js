const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadMultiple } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", projectController.getAllProjects);
router.get("/:slug", projectController.getProjectBySlug);

// Protected admin routes
router.post("/", authMiddleware, uploadMultiple("images", 10), projectController.createProject);
router.put("/:id", authMiddleware, uploadMultiple("images", 10), projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);
router.post("/upload", authMiddleware, uploadMultiple("images", 10), projectController.uploadProjectImages);

module.exports = router;
