import { Router } from "express";
import { ExecutorController } from "./executor.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { executeRequestSchema } from "./executor.dto.js";

/**
 * Express Router defining endpoints for the Request Executor feature module.
 */
const router: Router = Router();

/**
 * @route   POST /api/v1/executor/execute
 * @desc    Execute external HTTP request with variable replacement and latency metrics
 * @access  Public
 */
router.post(
  "/execute",
  validate(executeRequestSchema),
  ExecutorController.execute,
);

export default router;
