const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const { URL } = require("url");
const cloudinary = require("cloudinary").v2;

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Strip whitespace, newlines, and accidental surrounding quotes from env vars
 */
const cleanEnvVal = (val) => {
  if (typeof val !== "string") return "";
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

/**
 * Redact any secret values before logging or returning errors
 */
const redactSecrets = (text, creds = {}) => {
  if (!text) return "";
  let out = String(text);
  if (creds.apiSecret) {
    out = out.split(creds.apiSecret).join("[REDACTED_SECRET]");
  }
  if (creds.apiKey) {
    out = out.split(creds.apiKey).join("[REDACTED_KEY]");
  }
  return out;
};

/**
 * Helper to validate, sanitize, and retrieve Cloudinary credentials
 * Supports CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 * as well as CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name).
 */
const getCloudinaryCredentials = () => {
  const cloudName = cleanEnvVal(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnvVal(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnvVal(process.env.CLOUDINARY_API_SECRET);
  const cldUrl = cleanEnvVal(process.env.CLOUDINARY_URL);
  const uploadPreset = cleanEnvVal(process.env.CLOUDINARY_UPLOAD_PRESET);
  const uploadPrefix = cleanEnvVal(process.env.CLOUDINARY_UPLOAD_PREFIX) || "https://api.cloudinary.com";

  const isPlaceholder = (val) =>
    !val ||
    val.includes("your_cloudinary_") ||
    val === "your_cloudinary_cloud_name" ||
    val === "your_cloudinary_api_key" ||
    val === "your_cloudinary_api_secret";

  // 1. Prefer explicit individual environment variables when all three are present
  if (
    cloudName &&
    apiKey &&
    apiSecret &&
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  ) {
    return {
      isConfigured: true,
      source: "env_vars",
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset: uploadPreset || null,
      uploadPrefix: uploadPrefix.replace(/\/+$/, ""),
    };
  }

  // 2. Fallback: parse CLOUDINARY_URL explicitly (cloudinary.config({ cloudinary_url }) does NOT parse it)
  if (cldUrl && !cldUrl.includes("your_") && cldUrl.toLowerCase().startsWith("cloudinary://")) {
    try {
      const parsed = new URL(cldUrl);
      const parsedCloudName = decodeURIComponent(parsed.hostname || "").trim();
      const parsedApiKey = decodeURIComponent(parsed.username || "").trim();
      const parsedApiSecret = decodeURIComponent(parsed.password || "").trim();

      if (parsedCloudName && parsedApiKey && parsedApiSecret) {
        return {
          isConfigured: true,
          source: "cloudinary_url",
          cloudName: parsedCloudName,
          apiKey: parsedApiKey,
          apiSecret: parsedApiSecret,
          uploadPreset: uploadPreset || null,
          uploadPrefix: uploadPrefix.replace(/\/+$/, ""),
        };
      }
    } catch (parseErr) {
      console.warn(`[Storage Warning] Failed to parse CLOUDINARY_URL: ${parseErr.message}`);
    }
  }

  return { isConfigured: false };
};

/**
 * Configure Cloudinary SDK from sanitized environment variables
 */
const initCloudinary = () => {
  const creds = getCloudinaryCredentials();
  if (!creds.isConfigured) return false;

  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });

  const maskedKey = creds.apiKey.length > 4 ? `***${creds.apiKey.slice(-4)}` : "***";
  console.log(
    `[Storage] Cloudinary initialized for cloud_name="${creds.cloudName}" (source: ${creds.source}, key: ${maskedKey}, auth: signed${creds.uploadPreset ? `, preset: ${creds.uploadPreset}` : ""})`
  );
  return true;
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return getCloudinaryCredentials().isConfigured;
};

// Initial setup attempt
initCloudinary();

/**
 * Build multipart/form-data payload and perform a signed upload to Cloudinary.
 * Unlike cloudinary@2.x uploader.js (which drops response bodies on HTTP 403),
 * this captures full HTTP response status, x-cld-error headers, and response body
 * without ever exposing API secrets.
 */
const uploadSignedToCloudinary = (file, targetFolder, creds) => {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder: targetFolder,
      timestamp,
    };
    if (creds.uploadPreset) {
      paramsToSign.upload_preset = creds.uploadPreset;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, creds.apiSecret);
    const uploadEndpoint = `${creds.uploadPrefix}/v1_1/${encodeURIComponent(creds.cloudName)}/image/upload`;
    const parsedUrl = new URL(uploadEndpoint);

    const boundary = `----JSRamCloudinary${crypto.randomBytes(12).toString("hex")}`;
    const fields = {
      folder: targetFolder,
      timestamp: String(timestamp),
      ...(creds.uploadPreset ? { upload_preset: creds.uploadPreset } : {}),
      api_key: creds.apiKey,
      signature,
    };

    const parts = [];
    for (const [key, value] of Object.entries(fields)) {
      parts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`,
          "utf8"
        )
      );
    }

    const safeFileName = (file.originalname || "upload.jpg").replace(/["\r\n\\]/g, "_");
    const mimeType = file.mimetype || "application/octet-stream";
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${safeFileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
        "utf8"
      )
    );
    parts.push(file.buffer);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"));

    const bodyBuffer = Buffer.concat(parts);
    const transport = parsedUrl.protocol === "http:" ? http : https;

    const reqOptions = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "http:" ? 80 : 443),
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length,
        "Accept": "application/json",
        "User-Agent": "CloudinaryNodeJS/2.11.0 (JS-RAM-Construction)",
      },
    };

    const req = transport.request(reqOptions, (res) => {
      const responseChunks = [];
      res.on("data", (chunk) => responseChunks.push(chunk));
      res.on("end", () => {
        const rawBody = Buffer.concat(responseChunks).toString("utf8");
        const cldErrorHeader = res.headers["x-cld-error"] || "";
        const requestId = res.headers["x-request-id"] || res.headers["cf-ray"] || "";

        let parsedBody = null;
        try {
          parsedBody = rawBody ? JSON.parse(rawBody) : null;
        } catch {
          parsedBody = null;
        }

        if (res.statusCode >= 200 && res.statusCode < 300 && parsedBody && !parsedBody.error) {
          return resolve(parsedBody);
        }

        // Extract descriptive error message without exposing secrets
        const bodyErrMsg =
          parsedBody?.error?.message ||
          parsedBody?.message ||
          rawBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);

        const detailParts = [];
        if (cldErrorHeader) detailParts.push(`x-cld-error: ${cldErrorHeader}`);
        if (bodyErrMsg && bodyErrMsg !== cldErrorHeader) detailParts.push(bodyErrMsg);
        if (requestId) detailParts.push(`request_id: ${requestId}`);

        const detailText = redactSecrets(
          detailParts.join(" | ") || `Empty response body (HTTP ${res.statusCode})`,
          creds
        );

        const err = new Error(`HTTP ${res.statusCode} - ${detailText}`);
        err.http_code = res.statusCode;
        err.cld_error = redactSecrets(cldErrorHeader, creds);
        err.response_body = redactSecrets(bodyErrMsg, creds);
        reject(err);
      });
    });

    req.setTimeout(60000, () => {
      req.destroy(new Error("Cloudinary upload request timed out after 60s"));
    });

    req.on("error", (networkErr) => {
      reject(new Error(redactSecrets(networkErr.message, creds)));
    });

    req.write(bodyBuffer);
    req.end();
  });
};

/**
 * Upload a file buffer to Cloudinary (with local disk fallback strictly for non-production dev/tests)
 * @param {Object} file - Multer file object containing buffer, originalname, mimetype
 * @param {string} folder - Destination subfolder (e.g. 'homepage', 'categories', 'projects')
 * @returns {Promise<{ url: string, publicId: string | null }>}
 */
const uploadFileWithDetails = async (file, folder = "general") => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for upload");
  }

  const isProd = process.env.NODE_ENV === "production";
  const creds = getCloudinaryCredentials();

  // In production, images MUST be stored permanently on Cloudinary
  if (isProd && !creds.isConfigured) {
    throw new Error(
      "Cloudinary is not configured on this server. Production image uploads require valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) environment variables."
    );
  }

  // 1. Try Cloudinary if configured
  if (creds.isConfigured) {
    initCloudinary();
    const targetFolder = `js-ram/${folder}`;
    try {
      const uploadResult = await uploadSignedToCloudinary(file, targetFolder, creds);

      console.log(
        `[Storage] Uploaded to Cloudinary: ${uploadResult.secure_url} (public_id: ${uploadResult.public_id})`
      );
      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (cldError) {
      console.error(
        `[Storage Error] Cloudinary upload failed for cloud_name="${creds.cloudName}", folder="${targetFolder}": ${cldError.message}`
      );
      if (isProd) {
        const err = new Error(`Cloudinary upload failed: ${cldError.message}`);
        err.status = cldError.http_code === 400 ? 400 : 502;
        throw err;
      }
      console.warn(`[Storage Warning] Development local disk fallback will be used: ${cldError.message}`);
    }
  }

  // 2. Local disk fallback (strictly for offline local development / sandbox tests)
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
  getCloudinaryCredentials,
  uploadSignedToCloudinary,
};
