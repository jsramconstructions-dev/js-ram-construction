// JS RAM CONSTRUCTION — IMAGE URL RESOLVER
// Resolves Cloudinary URLs, frontend static images, and legacy/local backend uploads.

/**
 * Resolves any image URL to a safe, loadable URL in both dev and production.
 * - Cloudinary HTTPS URLs (https://res.cloudinary.com/...) -> returned directly
 * - External URLs (https://...) -> returned directly
 * - Frontend public assets (/images/...) -> returned directly (served by static site)
 * - Local / legacy backend uploads (/uploads/...) -> resolved against backend origin
 * - Stale blob: or data: URLs -> fallback image (prevents ERR_FILE_NOT_FOUND on refresh)
 *
 * @param {string} url - The raw image URL from database or state
 * @param {string} fallback - Fallback image if url is empty or invalid
 * @param {boolean} allowBlob - Whether to allow temporary blob: for active preview
 * @returns {string} - The fully resolved image URL
 */
export const resolveImageUrl = (
  url,
  fallback = "/images/hero-construction.jpg",
  allowBlob = false
) => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // Allow temporary blob: URL ONLY if explicitly permitted (e.g. active file input preview)
  if (trimmed.startsWith("blob:")) {
    return allowBlob ? trimmed : fallback;
  }

  // Reject base64 in persistent rendering to avoid browser memory issues
  if (trimmed.startsWith("data:image")) {
    return allowBlob ? trimmed : fallback;
  }

  // Absolute URLs (Cloudinary, AWS, external CDN)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Frontend public assets (e.g. /images/hero-construction.jpg, /images/logo3.png)
  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }

  // Legacy or local backend uploads (e.g. /uploads/homepage/xyz.png)
  // Must resolve against backend Web Service origin, NEVER the frontend Static Site origin!
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    const backendUrl =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      window.location.port !== "5000"
        ? "http://localhost:5000"
        : "");

    const backendOrigin = backendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

    if (backendOrigin) {
      return `${backendOrigin}${cleanPath}`;
    }
    return cleanPath;
  }

  return trimmed;
};

export default resolveImageUrl;
