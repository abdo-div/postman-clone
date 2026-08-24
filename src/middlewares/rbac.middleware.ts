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

import jwt from "jsonwebtoken";

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

/**
 * Middleware to resolve or mock authenticated user context from JWT token or request headers
 */
export const authUserMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const userIdHeader = req.headers["x-user-id"] as string;
  const userEmailHeader = req.headers["x-user-email"] as string;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key_123") as {
        userId?: string;
        id?: string;
        email?: string;
      };
      if (decoded && (decoded.userId || decoded.id)) {
        req.user = {
          id: decoded.userId || decoded.id || "507f1f77bcf86cd799439011",
          email: decoded.email || userEmailHeader || "user@example.com",
        };
        return next();
      }
    } catch {
      // If token is invalid, fallback to header or dev user
    }
  }

  if (userIdHeader) {
    req.user = {
      id: userIdHeader,
      email: userEmailHeader || "user@example.com",
    };
  } else {
    // Fallback development/testing default user (valid 24 hex char ObjectId)
    req.user = {
      id: "507f1f77bcf86cd799439011",
      email: "developer@postman-clone.local",
    };
  }
  next();
};

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
