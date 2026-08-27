import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", getMe);

export default router;
