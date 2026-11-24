// JS RAM CONSTRUCTION — MIGRATION: UPLOAD LOCAL IMAGES TO CLOUDINARY
// Safely inspects existing MongoDB records for local /uploads/ paths,
// uploads the local files to Cloudinary (if configured), and updates MongoDB
// with the permanent Cloudinary HTTPS secure_url.
// If local files are missing, it safely replaces them with default fallback images.
// NEVER DELETES ANY RECORDS.

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const HomepageSettings = require("../models/HomepageSettings");
const Category = require("../models/Category");
const Project = require("../models/Project");
const {
  uploadFileWithDetails,
  isCloudinaryConfigured,
  initCloudinary,
} = require("../services/storageService");

const uploadsRootDir = path.join(__dirname, "../../uploads");

const migrateFileToCloudinary = async (filePathOrUrl, folder = "general") => {
  if (!filePathOrUrl || typeof filePathOrUrl !== "string") {
    return null;
  }

  // Already a permanent Cloudinary or external URL
  if (
    filePathOrUrl.startsWith("http://") ||
    filePathOrUrl.startsWith("https://") ||
    filePathOrUrl.startsWith("/images/")
  ) {
    return { url: filePathOrUrl, migrated: false };
  }

  // Must be a local /uploads/ path
  if (!filePathOrUrl.includes("/uploads/")) {
    return null;
  }

  const idx = filePathOrUrl.indexOf("/uploads/");
  const relativePath = filePathOrUrl.substring(idx + "/uploads/".length);
  const fullDiskPath = path.join(uploadsRootDir, relativePath);

  if (fs.existsSync(fullDiskPath) && isCloudinaryConfigured()) {
    try {
      const buffer = fs.readFileSync(fullDiskPath);
      const ext = path.extname(fullDiskPath) || ".jpg";
      const mimeMap = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".avif": "image/avif",
      };
      const mimetype = mimeMap[ext.toLowerCase()] || "image/jpeg";
      const fileObj = {
        buffer,
        originalname: path.basename(fullDiskPath),
        mimetype,
      };

      const result = await uploadFileWithDetails(fileObj, folder);
      console.log(`[Migration] Uploaded to Cloudinary: "${filePathOrUrl}" -> "${result.url}"`);
      return { url: result.url, publicId: result.publicId, migrated: true };
    } catch (err) {
      console.warn(`[Migration Warning] Cloudinary upload failed for "${fullDiskPath}":`, err.message);
    }
  } else if (!fs.existsSync(fullDiskPath)) {
    console.warn(`[Migration Notice] File not on disk: "${fullDiskPath}". Using default fallback image.`);
  }

  return null;
};

const runMigration = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("[Migration Error] MONGODB_URI is not set in environment.");
    process.exit(1);
  }

  console.log("=== JS RAM CONSTRUCTION: IMAGE MIGRATION TO CLOUDINARY ===");
  console.log(`Cloudinary Configured: ${isCloudinaryConfigured() ? "YES" : "NO"}`);

  if (isCloudinaryConfigured()) {
    initCloudinary();
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("[Migration] Connected to MongoDB Atlas.");

    let totalMigrated = 0;
    let totalRepaired = 0;

    // 1. Homepage Settings
    const homepage = await HomepageSettings.findOne();
    if (homepage && homepage.heroImage) {
      if (homepage.heroImage.includes("/uploads/")) {
        const res = await migrateFileToCloudinary(homepage.heroImage, "homepage");
        if (res && res.migrated) {
          homepage.heroImage = res.url;
          homepage.heroImagePublicId = res.publicId;
          await homepage.save();
          totalMigrated++;
        } else if (!res) {
          homepage.heroImage = "/images/hero-construction.jpg";
          homepage.heroImagePublicId = null;
          await homepage.save();
          totalRepaired++;
        }
      }
    }

    // 2. Categories
    const categories = await Category.find();
    for (const cat of categories) {
      if (cat.coverImage && cat.coverImage.includes("/uploads/")) {
        const res = await migrateFileToCloudinary(cat.coverImage, "categories");
        if (res && res.migrated) {
          cat.coverImage = res.url;
          cat.coverImagePublicId = res.publicId;
          await cat.save();
          totalMigrated++;
        } else if (!res) {
          cat.coverImage = "/images/hero-construction.jpg";
          cat.coverImagePublicId = null;
          await cat.save();
          totalRepaired++;
        }
      }
    }

    // 3. Projects
    const projects = await Project.find();
    for (const proj of projects) {
      let modified = false;

      // Cover image
      if (proj.image && proj.image.includes("/uploads/")) {
        const res = await migrateFileToCloudinary(proj.image, "projects");
        if (res && res.migrated) {
          proj.image = res.url;
          proj.imagePublicId = res.publicId;
          modified = true;
          totalMigrated++;
        } else if (!res) {
          proj.image = "/images/hero-construction.jpg";
          proj.imagePublicId = null;
          modified = true;
          totalRepaired++;
        }
      }

      // Progress images
      if (Array.isArray(proj.progressImages) && proj.progressImages.length > 0) {
        const updatedImages = [];
        for (const img of proj.progressImages) {
          if (typeof img === "string" && img.includes("/uploads/")) {
            const res = await migrateFileToCloudinary(img, "projects");
            if (res && res.migrated) {
              updatedImages.push(res.url);
              totalMigrated++;
              modified = true;
            } else if (!res) {
              // Skip dead upload from progress images
              modified = true;
            } else {
              updatedImages.push(img);
            }
          } else {
            updatedImages.push(img);
          }
        }
        if (modified) {
          proj.progressImages = updatedImages;
        }
      }

      if (modified) {
        await proj.save();
      }
    }

    console.log(`[Migration Complete] Successfully migrated ${totalMigrated} image(s) to Cloudinary.`);
    console.log(`[Migration Complete] Repaired ${totalRepaired} missing image path(s) with fallback.`);
  } catch (error) {
    console.error("[Migration Error]", error);
  } finally {
    await mongoose.disconnect();
    console.log("[Migration] Disconnected from MongoDB.");
  }
};

if (require.main === module) {
  runMigration().then(() => process.exit(0));
}

module.exports = { runMigration, migrateFileToCloudinary };
