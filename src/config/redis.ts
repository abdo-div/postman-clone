import { Redis } from "ioredis";
import { env } from "./env.config.js";

const redisUrl = process.env.REDIS_URL || env.REDIS_URL;

export const redisConnection = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null, // Required by BullMQ
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    });

redisConnection.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Redis connection established successfully");
  }
});

redisConnection.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("⚠️ Redis connection error:", err.message);
  }
});
