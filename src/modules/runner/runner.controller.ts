import { Request, Response, NextFunction } from "express";
import { RunnerService } from "./runner.service.js";

export class RunnerController {
  private runnerService: RunnerService;

  constructor() {
    this.runnerService = new RunnerService();
  }

  public run = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.runnerService.runScript(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const runnerController = new RunnerController();
