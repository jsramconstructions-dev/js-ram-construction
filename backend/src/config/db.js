const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jsram_construction";

  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection error: ${error.message}`);
    console.warn(`[Database Warning] Server will start, but database operations require MongoDB Atlas to be connected.`);
    return null;
  }
};

module.exports = { connectDB, getIsConnected: () => isConnected };
