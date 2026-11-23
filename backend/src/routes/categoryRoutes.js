const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// Protected admin routes
router.post("/", authMiddleware, uploadSingle("coverImage"), categoryController.createCategory);
router.put("/:id", authMiddleware, uploadSingle("coverImage"), categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

module.exports = router;
