import { Router } from "express";
import { executorController } from "./executor.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { executeRequestSchema } from "./executor.dto.js";

const router = Router();

router.post(
  "/execute",
  validate(executeRequestSchema),
  executorController.execute,
);

export default router;
