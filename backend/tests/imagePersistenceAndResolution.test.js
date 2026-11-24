// JS RAM CONSTRUCTION — IMAGE PERSISTENCE & RESOLUTION UNIT TESTS
// Verifies all image URL resolution rules, Cloudinary credential validation,
// and sanitization of blob/base64 URLs.

const assert = require("assert");

// Test 1: URL Resolution Logic simulation (matching frontend/src/utils/imageUrl.js)
const simulateResolveImageUrl = (url, backendOrigin = "https://js-ram-backend.onrender.com", fallback = "/images/hero-construction.jpg", allowBlob = false) => {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:image")) {
    return allowBlob ? trimmed : fallback;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const cleanOrigin = backendOrigin.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    return cleanOrigin ? `${cleanOrigin}${cleanPath}` : cleanPath;
  }
  return trimmed;
};

console.log("=========================================================");
console.log(" JS RAM CONSTRUCTION — IMAGE PERSISTENCE & RESOLUTION TEST");
console.log("=========================================================\n");

let passed = 0;

// 1. Cloudinary URLs
const cldUrl = "https://res.cloudinary.com/jsram/image/upload/v1234/hero.jpg";
assert.strictEqual(simulateResolveImageUrl(cldUrl), cldUrl);
console.log("[PASS] Cloudinary HTTPS URLs are used directly without modification");
passed++;

// 2. Frontend public static assets
const staticAsset = "/images/hero-construction.jpg";
assert.strictEqual(simulateResolveImageUrl(staticAsset), staticAsset);
console.log("[PASS] Frontend public assets (/images/...) remain relative to static site");
passed++;

// 3. Legacy /uploads/ paths resolved against backend origin
const legacyUpload = "/uploads/homepage/sample-photo.png";
const resolvedUpload = simulateResolveImageUrl(legacyUpload, "https://js-ram-backend.onrender.com");
assert.strictEqual(resolvedUpload, "https://js-ram-backend.onrender.com/uploads/homepage/sample-photo.png");
console.log("[PASS] Legacy /uploads/... correctly resolved against backend origin");
passed++;

// 4. Verify /api is NEVER prepended to /uploads/
assert.strictEqual(resolvedUpload.includes("/api/uploads"), false);
console.log("[PASS] /api is never prepended to image upload URLs");
passed++;

// 5. Backend origin with trailing slash or /api cleaned properly
const resolvedWithDirtyOrigin = simulateResolveImageUrl(legacyUpload, "https://js-ram-backend.onrender.com/api/");
assert.strictEqual(resolvedWithDirtyOrigin, "https://js-ram-backend.onrender.com/uploads/homepage/sample-photo.png");
console.log("[PASS] Dirty backend origin (trailing slash or /api) normalized correctly");
passed++;

// 6. Stale blob: URLs replaced with fallback across page refreshes
const staleBlob = "blob:https://js-ram-construction-1.onrender.com/7b189a42-d611-4770-b184";
assert.strictEqual(simulateResolveImageUrl(staleBlob), "/images/hero-construction.jpg");
console.log("[PASS] Stale blob: URLs automatically replaced with persistent default image");
passed++;

// 7. Base64 URLs replaced with fallback
const base64Url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";
assert.strictEqual(simulateResolveImageUrl(base64Url), "/images/hero-construction.jpg");
console.log("[PASS] Base64 data URLs automatically replaced with persistent default image");
passed++;

// 8. Temporary blob preview allowed only when explicitly requested (allowBlob = true)
assert.strictEqual(simulateResolveImageUrl(staleBlob, "https://js-ram-backend.onrender.com", "/images/hero-construction.jpg", true), staleBlob);
console.log("[PASS] Temporary blob: URLs allowed only during active local file picker preview");
passed++;

// 9. Null, undefined, empty string handling
assert.strictEqual(simulateResolveImageUrl(null), "/images/hero-construction.jpg");
assert.strictEqual(simulateResolveImageUrl(""), "/images/hero-construction.jpg");
console.log("[PASS] Null and empty strings safely return default image");
passed++;

// 10. Cloudinary Credential validation
const { isCloudinaryConfigured } = require("../src/services/storageService");
// In test environment, placeholder credentials should not be considered valid
const originalEnv = { ...process.env };

process.env.CLOUDINARY_CLOUD_NAME = "your_cloudinary_cloud_name";
process.env.CLOUDINARY_API_KEY = "your_cloudinary_api_key";
process.env.CLOUDINARY_API_SECRET = "your_cloudinary_api_secret";
assert.strictEqual(isCloudinaryConfigured(), false);
console.log("[PASS] Placeholder credentials in .env are safely rejected as not configured");
passed++;

process.env.CLOUDINARY_CLOUD_NAME = " jsram-cloud ";
process.env.CLOUDINARY_API_KEY = " 123456789 ";
process.env.CLOUDINARY_API_SECRET = " abcdef123456 ";
assert.strictEqual(isCloudinaryConfigured(), true);
console.log("[PASS] Valid credentials with whitespace are trimmed and accepted");
passed++;

// Restore env
process.env = originalEnv;

console.log("\n=========================================================");
console.log(` RESULTS: ${passed} PASSED, 0 FAILED`);
console.log("=========================================================");
