require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { seedDefaults } = require("./utils/seedDefaults");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  const conn = await connectDB();
  if (conn) {
    // Seed initial defaults if collections are empty
    await seedDefaults();
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` JS RAM CONSTRUCTION — BACKEND API SERVER RUNNING`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // Handle unhandled rejections gracefully
  process.on("unhandledRejection", (err) => {
    console.error("[Unhandled Rejection]", err);
  });
};

startServer();
