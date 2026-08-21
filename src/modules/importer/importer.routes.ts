import { Router } from "express";
import { importerController } from "./importer.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { importPostmanSchema } from "./importer.dto.js";

const router = Router();

router.post(
  "/postman",
  validate(importPostmanSchema),
  importerController.importPostman,
);

export default router;
