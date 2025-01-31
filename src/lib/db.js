import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_DATABASE_URL environment variable inside .env.local");
}

// Global cache to prevent multiple connections in dev mode
let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};

export default connectDB;