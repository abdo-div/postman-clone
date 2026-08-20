import { Router } from "express";
import { runnerController } from "./runner.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { runTestSchema } from "./runner.dto.js";

const router = Router();

router.post("/run", validate(runTestSchema), runnerController.run);

export default router;
