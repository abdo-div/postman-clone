import rateLimit from "express-rate-limit";

/**
 * Strict limiter for authentication endpoints.
 * Allows 10 attempts per minute per IP before returning 429.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts. Please wait a minute and try again.",
    },
  },
  skipSuccessfulRequests: false,
});

/**
 * General limiter applied to all API routes.
 * Allows 200 requests per 15 minutes per IP.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please slow down and try again later.",
    },
  },
  skipSuccessfulRequests: true,
});
