const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

// CORS configuration
// Production custom domains and Render deployment origins
const productionOrigins = [
  "https://jsram.in",
  "https://www.jsram.in",
  "https://js-ram-construction-1.onrender.com",
];

// Local development origins
const devOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
];

// Environment-configured origins (FRONTEND_URL or ALLOWED_ORIGINS)
const rawEnvOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];

const envOrigins = rawEnvOrigins
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...productionOrigins, ...devOrigins, ...envOrigins])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/+$/, "").toLowerCase();
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.toLowerCase() === cleanOrigin
      );

      if (isAllowed || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200,
  })
);

// Body parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads directory (for local file storage fallback)
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "JS RAM Construction API",
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/projects", projectRoutes);

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.originalUrl}" not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("[Server Error]", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error occurred.",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = app;
