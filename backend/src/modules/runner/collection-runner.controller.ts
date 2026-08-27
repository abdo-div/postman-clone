import { Request, Response, NextFunction } from "express";
import { CollectionRunnerService } from "./collection-runner.service.js";

export class CollectionRunnerController {
  private collectionRunnerService: CollectionRunnerService;

  constructor() {
    this.collectionRunnerService = new CollectionRunnerService();
  }

  public run = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { collectionId, environmentId } = req.body;

      const summary = await this.collectionRunnerService.runCollection({
        collectionId,
        environmentId,
      });

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const collectionRunnerController = new CollectionRunnerController();
