import { Router } from "express";
import { runnerController } from "./runner.controller.js";
import { collectionRunnerController } from "./collection-runner.controller.js";
import { asyncRunnerController } from "./async-runner.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { runTestSchema } from "./runner.dto.js";
import { runCollectionSchema } from "./collection-runner.dto.js";
import {
  enqueueCollectionRunSchema,
  jobIdParamSchema,
} from "./async-runner.dto.js";

const router = Router();

// Synchronous execution endpoints
router.post("/run", validate(runTestSchema), runnerController.run);
router.post(
  "/run-collection",
  validate(runCollectionSchema),
  collectionRunnerController.run,
);

// Asynchronous background execution endpoints (BullMQ)
router.post(
  "/queue",
  validate(enqueueCollectionRunSchema),
  asyncRunnerController.enqueueRun,
);
router.get(
  "/queue/:jobId",
  validate(jobIdParamSchema),
  asyncRunnerController.getJobStatus,
);

export default router;
