const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Helper to validate and retrieve Cloudinary credentials
 */
const getCloudinaryCredentials = () => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  const cldUrl = (process.env.CLOUDINARY_URL || "").trim();

  const isPlaceholder = (val) =>
    !val ||
    val.includes("your_cloudinary_") ||
    val === "your_cloudinary_cloud_name" ||
    val === "your_cloudinary_api_key" ||
    val === "your_cloudinary_api_secret";

  if (cldUrl && !cldUrl.includes("your_")) {
    return { isConfigured: true, useUrl: true, cldUrl };
  }

  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  ) {
    return { isConfigured: true, useUrl: false, cloudName, apiKey, apiSecret };
  }

  return { isConfigured: false };
};

/**
 * Configure Cloudinary from environment variables
 */
const initCloudinary = () => {
  const creds = getCloudinaryCredentials();
  if (!creds.isConfigured) return false;

  if (creds.useUrl) {
    cloudinary.config({
      cloudinary_url: creds.cldUrl,
      secure: true,
    });
    console.log("[Storage] Cloudinary initialized via CLOUDINARY_URL.");
    return true;
  }

  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });
  console.log(`[Storage] Cloudinary initialized for cloud_name: ${creds.cloudName}`);
  return true;
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return getCloudinaryCredentials().isConfigured;
};

// Initial setup attempt
initCloudinary();

/**
 * Upload a file buffer to Cloudinary (with local disk fallback for dev)
 * @param {Object} file - Multer file object containing buffer, originalname, mimetype
 * @param {string} folder - Destination subfolder (e.g. 'hero', 'categories', 'projects')
 * @returns {Promise<{ url: string, publicId: string | null }>}
 */
const uploadFileWithDetails = async (file, folder = "general") => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for upload");
  }

  const isProd = process.env.NODE_ENV === "production";

  // In production, images MUST be stored permanently on Cloudinary
  if (isProd && !isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured on this server. In production, image uploads require valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) environment variables in Render to store images permanently."
    );
  }

  // 1. Try Cloudinary if configured
  if (isCloudinaryConfigured()) {
    initCloudinary();
    try {
      const targetFolder = `js-ram/${folder}`;
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: targetFolder,
            resource_type: "image",
            transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      console.log(`[Storage] Uploaded to Cloudinary: ${uploadResult.secure_url} (public_id: ${uploadResult.public_id})`);
      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (cldError) {
      console.error(`[Storage Error] Cloudinary upload failed: ${cldError.message}`);
      if (isProd) {
        throw new Error(`Cloudinary upload failed: ${cldError.message}. Image was not saved.`);
      }
      console.warn(`[Storage Warning] Development local disk fallback will be used: ${cldError.message}`);
    }
  }

  // 2. Local disk fallback (strictly for offline local development)
  const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1e6);
  const ext = path.extname(cleanOriginalName) || ".jpg";
  const baseName = path.basename(cleanOriginalName, ext);
  const fileName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;

  const localTargetFolder = path.join(uploadDir, folder);
  if (!fs.existsSync(localTargetFolder)) {
    fs.mkdirSync(localTargetFolder, { recursive: true });
  }

  const localFilePath = path.join(localTargetFolder, fileName);
  fs.writeFileSync(localFilePath, file.buffer);

  const localUrl = `/uploads/${folder}/${fileName}`;
  console.log(`[Storage] Saved locally: ${localUrl}`);

  return {
    url: localUrl,
    publicId: null,
  };
};

/**
 * Standard uploadFile returning string URL for backward compatibility
 */
const uploadFile = async (file, folder = "general") => {
  const result = await uploadFileWithDetails(file, folder);
  return result.url;
};

/**
 * Delete an image asset from Cloudinary or local disk
 * @param {string} publicIdOrUrl - Cloudinary public ID or file URL
 * @returns {Promise<boolean>}
 */
const deleteFile = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return false;

  // Protect initial static assets
  if (publicIdOrUrl.startsWith("/images/")) {
    return false;
  }

  // If Cloudinary public_id or Cloudinary URL
  if (isCloudinaryConfigured()) {
    initCloudinary();
    try {
      let publicId = publicIdOrUrl;

      // Extract public_id if full Cloudinary URL is supplied
      if (publicIdOrUrl.includes("res.cloudinary.com")) {
        const matches = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
        if (matches && matches[1]) {
          publicId = matches[1];
        }
      }

      // Check if this looks like a Cloudinary public ID
      if (publicId.includes("js-ram") || publicId.includes("jsram_construction") || !publicId.includes("/")) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`[Storage] Deleted Cloudinary asset: ${publicId} (result: ${result.result})`);
        return result.result === "ok";
      }
    } catch (cldErr) {
      console.warn(`[Storage Warning] Failed to delete Cloudinary asset: ${cldErr.message}`);
    }
  }

  // If local upload file
  if (publicIdOrUrl.startsWith("/uploads/")) {
    try {
      const relPath = publicIdOrUrl.replace(/^\/uploads\//, "");
      const fullPath = path.join(uploadDir, relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[Storage] Deleted local file: ${fullPath}`);
        return true;
      }
    } catch (fsErr) {
      console.warn(`[Storage Warning] Failed to delete local file: ${fsErr.message}`);
    }
  }

  return false;
};

module.exports = {
  uploadFile,
  uploadFileWithDetails,
  deleteFile,
  initCloudinary,
  isCloudinaryConfigured,
};
