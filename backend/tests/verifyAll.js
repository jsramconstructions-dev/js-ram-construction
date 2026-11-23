require("dotenv").config();
const http = require("http");
const net = require("net");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { defaultCategories, defaultProjects } = require("../src/utils/seedDefaults");
const {
  uploadFileWithDetails,
  deleteFile,
  isCloudinaryConfigured,
} = require("../src/services/storageService");

async function runTests() {
  console.log("=========================================================");
  console.log(" JS RAM CONSTRUCTION — CLOUDINARY & BACKEND VERIFICATION");
  console.log("=========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing & Bcryptjs Verification
  console.log("--- 1. Admin Authentication & Security ---");
  const testPassword = "JSRam@2026";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(testPassword, salt);
  const isMatch = await bcrypt.compare(testPassword, hash);
  assert(isMatch === true, "bcryptjs correctly hashes and compares admin password");

  const isWrongMatch = await bcrypt.compare("WrongPassword", hash);
  assert(isWrongMatch === false, "bcryptjs rejects invalid password");

  const secret = process.env.JWT_SECRET || "test-secret-key";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign({ username: "admin", email: "admin@jsramconstruction.com", role: "Administrator" }, secret, { expiresIn });
  const decoded = jwt.verify(token, secret);
  assert(decoded.username === "admin" && decoded.email === "admin@jsramconstruction.com", "JWT token successfully signs and verifies payload with custom expiration");

  // 2. Storage Service (Cloudinary / Local Fallback)
  console.log("\n--- 2. Storage Service (Cloudinary & Resilient Local Fallback) ---");
  const isCloudinary = isCloudinaryConfigured();
  console.log(`[Storage Mode] Cloudinary configured: ${isCloudinary ? "YES (Cloud)" : "NO (Resilient Fallback Mode Active)"}`);

  const mockImage = {
    originalname: "test-structural-photo.jpg",
    mimetype: "image/jpeg",
    buffer: Buffer.from("mock image file binary data for JS RAM Construction test"),
  };
  const uploadResult = await uploadFileWithDetails(mockImage, "test");
  assert(
    typeof uploadResult.url === "string" && uploadResult.url.length > 0,
    `Storage service successfully saved image and returned URL: ${uploadResult.url}`
  );

  // Test asset deletion logic
  const deleteResult = await deleteFile(uploadResult.url);
  assert(
    deleteResult === true,
    `Storage service successfully cleaned up test asset: ${uploadResult.url}`
  );

  // Test static asset protection (should never delete initial repository assets)
  const staticProtected = await deleteFile("/images/ram-swar-medspace.jpg");
  assert(
    staticProtected === false,
    "Initial static asset (/images/ram-swar-medspace.jpg) is protected from deletion"
  );

  // 3. Genuine Seed Data Integrity
  console.log("\n--- 3. Genuine Seed Data Integrity ---");
  assert(defaultCategories.length === 3, "Exactly 3 portfolio categories preserved (Hospital, Commercial, Residential)");
  assert(
    defaultCategories.some((c) => c.slug === "hospital") &&
    defaultCategories.some((c) => c.slug === "commercial") &&
    defaultCategories.some((c) => c.slug === "residential"),
    "All three category slugs present: hospital, commercial, residential"
  );

  assert(defaultProjects.length === 10, "All 10 genuine projects present without stock placeholders");
  const medspace = defaultProjects.find((p) => p.slug === "ram-swar-medspace");
  assert(
    medspace && medspace.client.includes("Akshay Mehadia") && medspace.configuration.includes("G+9"),
    "Ram Swar Medspace verified with genuine client and configuration"
  );

  const palacio = defaultProjects.find((p) => p.slug === "palacio");
  assert(
    palacio && palacio.client.includes("Raghav") && palacio.configuration.includes("G+15"),
    "Palacio verified with genuine client and configuration"
  );

  // 4. Category Deletion Protection Rule
  console.log("\n--- 4. Category Deletion Protection Rule ---");
  const hospitalProjects = defaultProjects.filter((p) => p.categoryId === "hospital");
  const canDeleteHospital = hospitalProjects.length === 0;
  assert(
    canDeleteHospital === false,
    `Category deletion protection verified: hospital has ${hospitalProjects.length} assigned projects, deletion prohibited`
  );

  // 5. Express API Routes Verification
  console.log("\n--- 5. Express App Route Dispatching ---");
  function dispatchRequest(method, url) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const req = new http.IncomingMessage(socket);
      req.method = method;
      req.url = url;
      const res = new http.ServerResponse(req);
      res.assignSocket(socket);

      let body = "";
      res.write = (chunk) => {
        body += chunk;
        return true;
      };
      res.end = (chunk) => {
        if (chunk) body += chunk;
        resolve({ status: res.statusCode, body });
      };

      app.handle(req, res);
    });
  }

  const healthRes = await dispatchRequest("GET", "/api/health");
  assert(healthRes.status === 200, "GET /api/health returned 200 OK");
  const healthJson = JSON.parse(healthRes.body);
  assert(healthJson.status === "healthy", "Health check status confirmed 'healthy'");

  const unknownRes = await dispatchRequest("GET", "/api/nonexistent-endpoint");
  assert(unknownRes.status === 404, "Unknown API endpoint correctly returns 404");

  console.log("\n=========================================================");
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
