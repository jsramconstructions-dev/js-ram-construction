const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Cloudinary from environment variables
 */
const initCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log(`[Storage] Cloudinary initialized for cloud_name: ${cloudName}`);
    return true;
  }
  return false;
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Initial setup attempt
initCloudinary();

/**
 * Upload a file buffer to Cloudinary (with local disk fallback)
 * @param {Object} file - Multer file object containing buffer, originalname, mimetype
 * @param {string} folder - Destination subfolder (e.g. 'hero', 'categories', 'projects')
 * @returns {Promise<{ url: string, publicId: string | null }>}
 */
const uploadFileWithDetails = async (file, folder = "general") => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for upload");
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
      console.warn(`[Storage Warning] Cloudinary upload failed, using local disk fallback: ${cldError.message}`);
    }
  }

  // 2. Local disk fallback
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
