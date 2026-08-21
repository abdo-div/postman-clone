import { Router } from "express";
import { workspaceController } from "./workspace.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authorizeWorkspace } from "../../middlewares/rbac.middleware.js";
import { WorkspaceRole } from "./workspace.model.js";
import { createWorkspaceSchema, addMemberSchema } from "./workspace.dto.js";

const router = Router();

router.post("/", validate(createWorkspaceSchema), workspaceController.create);
router.get("/mine", workspaceController.listMine);

// RBAC Protected Route: Only Workspace Owners can manage workspace members
router.post(
  "/:workspaceId/members",
  validate(addMemberSchema),
  authorizeWorkspace(WorkspaceRole.OWNER),
  workspaceController.addMember,
);

export default router;
