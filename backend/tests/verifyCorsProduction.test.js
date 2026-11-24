// JS RAM CONSTRUCTION — PRODUCTION CORS VERIFICATION TEST
// Verifies all required origins, credentials, methods, and preflight OPTIONS requests.

const assert = require("assert");
const http = require("http");

// Force production environment to test strict CORS enforcement
process.env.NODE_ENV = "production";
process.env.FRONTEND_URL = "https://jsram.in, https://www.jsram.in, https://js-ram-construction-1.onrender.com";

const app = require("../src/app");

console.log("=========================================================");
console.log(" JS RAM CONSTRUCTION — PRODUCTION CORS VERIFICATION");
console.log("=========================================================\n");

let passed = 0;

// Helper to simulate in-memory HTTP requests to app
const dispatch = (method, url, headers = {}) => {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = url;
    req.headers = { host: "backend.onrender.com", ...headers };

    const res = new http.ServerResponse(req);
    let body = "";
    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk) {
      if (chunk) body += chunk;
      return true;
    };

    res.end = function (chunk) {
      if (chunk) body += chunk;
      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body,
      });
    };

    app.handle(req, res);
  });
};

(async () => {
  // Test 1: Exact production origin https://jsram.in
  const res1 = await dispatch("GET", "/api/health", { origin: "https://jsram.in" });
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.headers["access-control-allow-origin"], "https://jsram.in");
  assert.strictEqual(res1.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://jsram.in allowed with credentials");
  passed++;

  // Test 2: Exact production origin https://www.jsram.in
  const res2 = await dispatch("GET", "/api/health", { origin: "https://www.jsram.in" });
  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res2.headers["access-control-allow-origin"], "https://www.jsram.in");
  assert.strictEqual(res2.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://www.jsram.in allowed with credentials");
  passed++;

  // Test 3: Render deployment origin https://js-ram-construction-1.onrender.com
  const res3 = await dispatch("GET", "/api/health", { origin: "https://js-ram-construction-1.onrender.com" });
  assert.strictEqual(res3.statusCode, 200);
  assert.strictEqual(res3.headers["access-control-allow-origin"], "https://js-ram-construction-1.onrender.com");
  assert.strictEqual(res3.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://js-ram-construction-1.onrender.com allowed with credentials");
  passed++;

  // Test 4: Trailing slash tolerance in origin header
  const res4 = await dispatch("GET", "/api/health", { origin: "https://jsram.in/" });
  assert.strictEqual(res4.statusCode, 200);
  assert.strictEqual(res4.headers["access-control-allow-origin"], "https://jsram.in/");
  console.log("[PASS] Trailing slash in origin header handled smoothly");
  passed++;

  // Test 5: Local development origin http://localhost:5173
  const res5 = await dispatch("GET", "/api/health", { origin: "http://localhost:5173" });
  assert.strictEqual(res5.statusCode, 200);
  assert.strictEqual(res5.headers["access-control-allow-origin"], "http://localhost:5173");
  console.log("[PASS] http://localhost:5173 allowed in all modes");
  passed++;

  // Test 6: Preflight OPTIONS request for https://jsram.in
  const res6 = await dispatch("OPTIONS", "/api/homepage/image", {
    origin: "https://jsram.in",
    "access-control-request-method": "PUT",
    "access-control-request-headers": "authorization, content-type",
  });
  assert.strictEqual(res6.statusCode, 200);
  assert.strictEqual(res6.headers["access-control-allow-origin"], "https://jsram.in");
  assert.strictEqual(res6.headers["access-control-allow-credentials"], "true");
  assert.strictEqual(Boolean(res6.headers["access-control-allow-methods"]), true);
  console.log("[PASS] Preflight OPTIONS request for https://jsram.in returns 200 with correct headers");
  passed++;

  // Test 7: Preflight OPTIONS request for https://www.jsram.in
  const res7 = await dispatch("OPTIONS", "/api/categories", {
    origin: "https://www.jsram.in",
    "access-control-request-method": "POST",
    "access-control-request-headers": "authorization, content-type",
  });
  assert.strictEqual(res7.statusCode, 200);
  assert.strictEqual(res7.headers["access-control-allow-origin"], "https://www.jsram.in");
  console.log("[PASS] Preflight OPTIONS request for https://www.jsram.in returns 200 with correct headers");
  passed++;

  // Test 8: Preflight OPTIONS request for https://js-ram-construction-1.onrender.com
  const res8 = await dispatch("OPTIONS", "/api/projects", {
    origin: "https://js-ram-construction-1.onrender.com",
    "access-control-request-method": "POST",
    "access-control-request-headers": "authorization, content-type",
  });
  assert.strictEqual(res8.statusCode, 200);
  assert.strictEqual(res8.headers["access-control-allow-origin"], "https://js-ram-construction-1.onrender.com");
  console.log("[PASS] Preflight OPTIONS request for https://js-ram-construction-1.onrender.com returns 200");
  passed++;

  // Test 9: Blocked origin in production
  const res9 = await dispatch("GET", "/api/health", { origin: "https://unauthorized-domain.com" });
  assert.strictEqual(res9.statusCode, 500); // Express global error handler catches CORS rejection Error
  assert.strictEqual(res9.headers["access-control-allow-origin"], undefined);
  console.log("[PASS] Unauthorized origin blocked in production (no access-control-allow-origin returned)");
  passed++;

  // Test 10: Non-wildcard verification
  assert.notStrictEqual(res1.headers["access-control-allow-origin"], "*");
  console.log("[PASS] Wildcard '*' is NOT used with credentials");
  passed++;

  console.log("\n=========================================================");
  console.log(` RESULTS: ${passed} / ${passed} PASSED (ALL VERIFIED)`);
  console.log("=========================================================");
})();
