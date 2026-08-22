import { Router } from "express";
import { requestController } from "./request.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createRequestSchema,
  updateRequestSchema,
  requestIdParamSchema,
  getRequestsByCollectionSchema,
} from "./request.dto.js";

const router = Router();

router.post("/", validate(createRequestSchema), requestController.create);
router.get(
  "/collection/:collectionId",
  validate(getRequestsByCollectionSchema),
  requestController.getByCollection,
);
router.get("/:id", validate(requestIdParamSchema), requestController.getById);
router.patch("/:id", validate(updateRequestSchema), requestController.update);
router.delete("/:id", validate(requestIdParamSchema), requestController.delete);

export default router;
