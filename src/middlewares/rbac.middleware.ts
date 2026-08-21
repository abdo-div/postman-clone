import { Request, Response, NextFunction } from "express";
import {
  WorkspaceModel,
  WorkspaceRole,
} from "../modules/workspace/workspace.model.js";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/app-error.js";

// Weight mapping for hierarchical role enforcement
const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.VIEWER]: 1,
  [WorkspaceRole.EDITOR]: 2,
  [WorkspaceRole.OWNER]: 3,
};

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authorizeWorkspace = (requiredRole: WorkspaceRole) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Workspace ID can come from params, headers, or body
      const workspaceId =
        req.params.workspaceId ||
        (req.headers["x-workspace-id"] as string) ||
        req.body?.workspaceId;

      if (!workspaceId) {
        throw new ForbiddenError(
          "Workspace context (x-workspace-id) is missing",
        );
      }

      const workspace = await WorkspaceModel.findById(workspaceId).lean();
      if (!workspace) {
        throw new NotFoundError(`Workspace with ID ${workspaceId} not found`);
      }

      // Check if user is owner or member
      const member = workspace.members.find(
        (m) => m.userId.toString() === req.user!.id,
      );

      const isOwner = workspace.ownerId.toString() === req.user!.id;
      const userRole = isOwner ? WorkspaceRole.OWNER : member?.role;

      if (!userRole) {
        throw new ForbiddenError("You are not a member of this workspace");
      }

      // Role check based on hierarchy weight
      if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
        throw new ForbiddenError(
          `Insufficient permissions. Requires ${requiredRole} role or higher.`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
