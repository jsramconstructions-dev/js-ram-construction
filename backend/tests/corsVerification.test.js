// JS RAM CONSTRUCTION — IN-MEMORY PRODUCTION CORS VERIFICATION TEST
// Tests CORS rules directly via in-memory app.handle() without requiring TCP loopback sockets.

const assert = require("assert");
const http = require("http");
const net = require("net");

// Set production environment to test strict CORS enforcement
process.env.NODE_ENV = "production";
process.env.FRONTEND_URL = "https://jsram.in,https://www.jsram.in,https://js-ram-construction-1.onrender.com";

const app = require("../src/app");

console.log("=========================================================");
console.log(" JS RAM CONSTRUCTION — CORS VERIFICATION SUITE");
console.log("=========================================================\n");

const dispatchRequest = (method, url, headers = {}) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = Object.fromEntries(
      Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
    );

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    let body = "";
    res.write = (chunk) => {
      body += chunk;
      return true;
    };
    res.end = (chunk) => {
      if (chunk) body += chunk;
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        body,
      });
    };

    req.push(null);
    app.handle(req, res);
  });
};

(async () => {
  let passed = 0;

  // 1. Production origin: https://jsram.in
  const res1 = await dispatchRequest("GET", "/api/health", { origin: "https://jsram.in" });
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res1.headers["access-control-allow-origin"], "https://jsram.in");
  assert.strictEqual(res1.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://jsram.in successfully allowed with credentials");
  passed++;

  // 2. Production origin: https://www.jsram.in
  const res2 = await dispatchRequest("GET", "/api/health", { origin: "https://www.jsram.in" });
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res2.headers["access-control-allow-origin"], "https://www.jsram.in");
  assert.strictEqual(res2.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://www.jsram.in successfully allowed with credentials");
  passed++;

  // 3. Render Static Site: https://js-ram-construction-1.onrender.com
  const res3 = await dispatchRequest("GET", "/api/health", { origin: "https://js-ram-construction-1.onrender.com" });
  assert.strictEqual(res3.status, 200);
  assert.strictEqual(res3.headers["access-control-allow-origin"], "https://js-ram-construction-1.onrender.com");
  assert.strictEqual(res3.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] https://js-ram-construction-1.onrender.com successfully allowed with credentials");
  passed++;

  // 4. Preflight OPTIONS request for https://jsram.in
  const optRes1 = await dispatchRequest("OPTIONS", "/api/homepage/image", {
    origin: "https://jsram.in",
    "access-control-request-method": "PUT",
    "access-control-request-headers": "Authorization, Content-Type",
  });
  assert.strictEqual(optRes1.status, 200);
  assert.strictEqual(optRes1.headers["access-control-allow-origin"], "https://jsram.in");
  assert.strictEqual(optRes1.headers["access-control-allow-credentials"], "true");
  assert.strictEqual(optRes1.headers["access-control-allow-methods"].includes("PUT"), true);
  assert.strictEqual(optRes1.headers["access-control-allow-headers"].toLowerCase().includes("authorization"), true);
  console.log("[PASS] Preflight OPTIONS request for https://jsram.in returns 200 OK with correct CORS headers");
  passed++;

  // 5. Preflight OPTIONS request for https://www.jsram.in
  const optRes2 = await dispatchRequest("OPTIONS", "/api/categories", {
    origin: "https://www.jsram.in",
    "access-control-request-method": "POST",
    "access-control-request-headers": "Authorization, Content-Type",
  });
  assert.strictEqual(optRes2.status, 200);
  assert.strictEqual(optRes2.headers["access-control-allow-origin"], "https://www.jsram.in");
  assert.strictEqual(optRes2.headers["access-control-allow-credentials"], "true");
  console.log("[PASS] Preflight OPTIONS request for https://www.jsram.in returns 200 OK with correct CORS headers");
  passed++;

  // 6. Trailing slash in origin header handled cleanly
  const resSlash = await dispatchRequest("GET", "/api/health", { origin: "https://jsram.in/" });
  assert.strictEqual(resSlash.status, 200);
  assert.strictEqual(resSlash.headers["access-control-allow-origin"], "https://jsram.in/");
  console.log("[PASS] Trailing slashes in origin headers are handled cleanly");
  passed++;

  // 7. Local development origins still permitted
  const resDev = await dispatchRequest("GET", "/api/health", { origin: "http://localhost:5173" });
  assert.strictEqual(resDev.status, 200);
  assert.strictEqual(resDev.headers["access-control-allow-origin"], "http://localhost:5173");
  console.log("[PASS] Local development origin (http://localhost:5173) is preserved and allowed");
  passed++;

  // 8. Unauthorized origin is blocked in production
  const resBlocked = await dispatchRequest("GET", "/api/health", { origin: "https://malicious-site.example.com" });
  assert.strictEqual(resBlocked.status, 500);
  assert.strictEqual(resBlocked.headers["access-control-allow-origin"], undefined);
  assert.strictEqual(resBlocked.body.includes("CORS policy blocked request"), true);
  console.log("[PASS] Unauthorized origin (https://malicious-site.example.com) is correctly blocked in production");
  passed++;

  // 9. Wildcard origin is NOT used (credentials security rule)
  assert.notStrictEqual(res1.headers["access-control-allow-origin"], "*");
  assert.notStrictEqual(optRes1.headers["access-control-allow-origin"], "*");
  console.log("[PASS] Wildcard '*' is NOT used; specific origin reflected with credentials");
  passed++;

  console.log("\n=========================================================");
  console.log(` RESULTS: ${passed} / ${passed} PASSED (ALL VERIFIED)`);
  console.log("=========================================================");
})();
