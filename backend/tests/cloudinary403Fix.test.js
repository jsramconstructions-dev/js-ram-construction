// JS RAM CONSTRUCTION — CLOUDINARY 403 FIX & SIGNED UPLOAD VERIFICATION TEST
// Verifies credential sanitization, CLOUDINARY_URL parsing, signed multipart upload
// generation, full HTTP 403 error body / header capture, and secret redaction.

const assert = require("assert");
const https = require("https");
const EventEmitter = require("events");
const cloudinary = require("cloudinary").v2;

const {
  getCloudinaryCredentials,
  uploadFileWithDetails,
} = require("../src/services/storageService");

console.log("=========================================================");
console.log(" JS RAM CONSTRUCTION — CLOUDINARY 403 DIAGNOSTIC SUITE");
console.log("=========================================================\n");

(async () => {
  let passed = 0;
  const origEnv = { ...process.env };
  const origHttpsRequest = https.request;

  try {
    // 1. Test credential quote & whitespace sanitization
    process.env.CLOUDINARY_CLOUD_NAME = ' "my-render-cloud" ';
    process.env.CLOUDINARY_API_KEY = " '998877665544332' ";
    process.env.CLOUDINARY_API_SECRET = ' "super_secret_xyz_123" ';
    delete process.env.CLOUDINARY_URL;
    delete process.env.CLOUDINARY_UPLOAD_PRESET;

    const creds1 = getCloudinaryCredentials();
    assert.strictEqual(creds1.isConfigured, true);
    assert.strictEqual(creds1.cloudName, "my-render-cloud");
    assert.strictEqual(creds1.apiKey, "998877665544332");
    assert.strictEqual(creds1.apiSecret, "super_secret_xyz_123");
    console.log("[PASS] Surrounding quotes and whitespace stripped from Cloudinary env vars");
    passed++;

    // 2. Test explicit CLOUDINARY_URL parsing
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    process.env.CLOUDINARY_URL = ' "cloudinary://1122334455:secret_abc_999@parsed-cloud-name" ';

    const creds2 = getCloudinaryCredentials();
    assert.strictEqual(creds2.isConfigured, true);
    assert.strictEqual(creds2.source, "cloudinary_url");
    assert.strictEqual(creds2.cloudName, "parsed-cloud-name");
    assert.strictEqual(creds2.apiKey, "1122334455");
    assert.strictEqual(creds2.apiSecret, "secret_abc_999");
    console.log("[PASS] CLOUDINARY_URL parsed accurately into cloudName, apiKey, and apiSecret");
    passed++;

    // 3. Test signed upload + HTTP 403 body & x-cld-error capture + secret redaction
    process.env.NODE_ENV = "production";
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test_key_12345";
    process.env.CLOUDINARY_API_SECRET = "test_secret_MUST_NOT_LEAK";
    delete process.env.CLOUDINARY_URL;

    let capturedRequestInfo = null;

    https.request = (options, cb) => {
      capturedRequestInfo = { options, bodyParts: [] };
      const mockReq = new EventEmitter();
      mockReq.write = (chunk) => {
        capturedRequestInfo.bodyParts.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      };
      mockReq.setTimeout = () => {};
      mockReq.destroy = () => {};
      mockReq.end = (chunk) => {
        if (chunk) mockReq.write(chunk);
        const res = new EventEmitter();
        res.statusCode = 403;
        res.headers = {
          "content-type": "application/json",
          "x-cld-error": "Access restricted for IP or account status",
          "x-request-id": "req-cld-403-test",
        };
        cb(res);
        process.nextTick(() => {
          // Simulate upstream echoing apiKey/apiSecret to verify redaction
          res.emit(
            "data",
            Buffer.from(
              JSON.stringify({
                error: {
                  message:
                    "Account disabled or restricted for key test_key_12345 secret test_secret_MUST_NOT_LEAK",
                },
              })
            )
          );
          res.emit("end");
        });
      };
      return mockReq;
    };

    let caught403 = null;
    try {
      await uploadFileWithDetails(
        {
          originalname: "hero.png",
          mimetype: "image/png",
          buffer: Buffer.from("png-data"),
        },
        "homepage"
      );
    } catch (err) {
      caught403 = err;
    }

    assert(caught403 !== null, "Expected HTTP 403 in production to throw error");
    assert.strictEqual(caught403.status, 502);
    assert(caught403.message.includes("HTTP 403"), "Error includes HTTP 403 status");
    assert(
      caught403.message.includes("Access restricted for IP or account status"),
      "Error captures x-cld-error header"
    );
    assert(
      caught403.message.includes("Account disabled or restricted"),
      "Error captures JSON response body error message"
    );
    assert.strictEqual(
      caught403.message.includes("test_secret_MUST_NOT_LEAK"),
      false,
      "API secret MUST NOT appear in thrown error"
    );
    assert.strictEqual(
      caught403.message.includes("test_key_12345"),
      false,
      "API key MUST NOT appear in thrown error"
    );
    console.log("[PASS] HTTP 403 captures actual Cloudinary response body & x-cld-error without leaking secrets");
    passed++;

    // Verify signed multipart payload structure (no delivery-only f_auto transformation)
    const sentBody = Buffer.concat(capturedRequestInfo.bodyParts).toString("utf8");
    assert.strictEqual(capturedRequestInfo.options.hostname, "api.cloudinary.com");
    assert.strictEqual(capturedRequestInfo.options.path, "/v1_1/test-cloud/image/upload");
    assert(sentBody.includes('name="folder"\r\n\r\njs-ram/homepage'), "Folder field present");
    assert(sentBody.includes('name="signature"'), "Signature field present (signed upload)");
    assert(sentBody.includes('name="timestamp"'), "Timestamp field present");
    assert.strictEqual(sentBody.includes("f_auto"), false, "Delivery-only f_auto removed from upload payload");
    console.log("[PASS] Signed multipart payload verified (valid signature, clean upload params)");
    passed++;

    // Verify signature matches cloudinary.utils.api_sign_request
    const folderMatch = sentBody.match(/name="folder"\r\n\r\n([^\r\n]+)/);
    const tsMatch = sentBody.match(/name="timestamp"\r\n\r\n([^\r\n]+)/);
    const sigMatch = sentBody.match(/name="signature"\r\n\r\n([^\r\n]+)/);
    const expectedSig = cloudinary.utils.api_sign_request(
      { folder: folderMatch[1], timestamp: Number(tsMatch[1]) },
      "test_secret_MUST_NOT_LEAK"
    );
    assert.strictEqual(sigMatch[1], expectedSig);
    console.log("[PASS] Generated upload signature matches official Cloudinary SDK signature");
    passed++;

    // 4. Test successful HTTP 200 Cloudinary upload returns permanent secure_url
    https.request = (options, cb) => {
      const mockReq = new EventEmitter();
      mockReq.write = () => true;
      mockReq.setTimeout = () => {};
      mockReq.destroy = () => {};
      mockReq.end = () => {
        const res = new EventEmitter();
        res.statusCode = 200;
        res.headers = { "content-type": "application/json" };
        cb(res);
        process.nextTick(() => {
          res.emit(
            "data",
            Buffer.from(
              JSON.stringify({
                secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v123/js-ram/homepage/hero.png",
                public_id: "js-ram/homepage/hero",
              })
            )
          );
          res.emit("end");
        });
      };
      return mockReq;
    };

    const okResult = await uploadFileWithDetails(
      {
        originalname: "hero.png",
        mimetype: "image/png",
        buffer: Buffer.from("png-data"),
      },
      "homepage"
    );
    assert.strictEqual(
      okResult.url,
      "https://res.cloudinary.com/test-cloud/image/upload/v123/js-ram/homepage/hero.png"
    );
    assert.strictEqual(okResult.publicId, "js-ram/homepage/hero");
    console.log("[PASS] Successful Cloudinary upload returns permanent HTTPS secure_url & public_id");
    passed++;

    console.log("\n=========================================================");
    console.log(` RESULTS: ${passed} / ${passed} PASSED (ALL VERIFIED)`);
    console.log("=========================================================");
  } finally {
    https.request = origHttpsRequest;
    process.env = origEnv;
  }
})();
