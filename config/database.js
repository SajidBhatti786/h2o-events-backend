const mongoose = require("mongoose");

let db; // Variable to store the database connection

const connectToDatabase = async () => {
  try {
    db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
};

module.exports = { connectToDatabase, getDatabase };
