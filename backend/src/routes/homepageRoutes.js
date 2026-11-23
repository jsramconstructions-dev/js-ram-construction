const express = require("express");
const router = express.Router();
const homepageController = require("../controllers/homepageController");
const authMiddleware = require("../middleware/authMiddleware");
const { uploadSingle } = require("../middleware/uploadMiddleware");

// Public homepage settings (hero background image)
router.get("/", homepageController.getHomepage);

// Protected admin update homepage hero image (file upload or URL)
router.put("/image", authMiddleware, uploadSingle("image"), homepageController.updateHeroImage);

module.exports = router;
