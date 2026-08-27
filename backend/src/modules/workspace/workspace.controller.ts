import { Request, Response, NextFunction } from "express";
import { WorkspaceService } from "./workspace.service.js";

export class WorkspaceController {
  private workspaceService: WorkspaceService;

  constructor() {
    this.workspaceService = new WorkspaceService();
  }

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspace = await this.workspaceService.createWorkspace(
        req.user!.id,
        req.body.name,
        req.body.description,
      );
      res.status(201).json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  };

  public listMine = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaces = await this.workspaceService.getUserWorkspaces(
        req.user!.id,
      );
      res.status(200).json({ success: true, data: workspaces });
    } catch (error) {
      next(error);
    }
  };

  public addMember = async (
    req: Request<{ workspaceId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const updatedWorkspace = await this.workspaceService.addMember(
        req.params.workspaceId,
        req.body.userId,
        req.body.role,
      );
      res.status(200).json({ success: true, data: updatedWorkspace });
    } catch (error) {
      next(error);
    }
  };
}

export const workspaceController = new WorkspaceController();
