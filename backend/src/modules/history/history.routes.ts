import { Router } from "express";
import { historyController } from "./history.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  historyIdParamSchema,
  requestIdParamSchema,
  historyPaginationQuerySchema,
} from "./history.dto.js";

const router = Router();

// General history collection routes
router.get("/", historyController.getAll);
router.post("/", historyController.create);
router.delete("/", historyController.clearAll);

// Specific /request/... paths before generic /:id parameter path to prevent Express route collisions
router.get(
  "/request/:requestId",
  validate(requestIdParamSchema),
  validate(historyPaginationQuerySchema),
  historyController.getByRequest,
);
router.get(
  "/request/:requestId/metrics",
  validate(requestIdParamSchema),
  historyController.getMetrics,
);
router.delete(
  "/request/:requestId",
  validate(requestIdParamSchema),
  historyController.clearRequestHistory,
);
router.get("/:id", validate(historyIdParamSchema), historyController.getById);

export default router;