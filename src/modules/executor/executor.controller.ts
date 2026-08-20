import { Request, Response, NextFunction } from "express";
import { ExecutorService } from "./executor.service.js";

export class ExecutorController {
  private executorService: ExecutorService;

  constructor() {
    this.executorService = new ExecutorService();
  }

  // Bind 'this' using an arrow function so context isn't lost in Express routing
  public execute = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.executorService.execute(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const executorController = new ExecutorController();
