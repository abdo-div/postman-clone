import { Request, Response, NextFunction } from "express";
import { ExecutorService } from "./executor.service.js";
import { ExecuteRequestInput, ExecutionResponse } from "./executor.dto.js";

/**
 * Controller handling inbound HTTP requests for the Request Execution engine.
 */
export class ExecutorController {
  /**
   * Endpoint handler for POST /api/v1/executor/execute
   */
  static execute = async (
    req: Request<unknown, unknown, ExecuteRequestInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // 1. Pass validated body to the domain service
      const result: ExecutionResponse = await ExecutorService.execute(req.body);

      // 2. Return standardized success response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      // 3. Delegate error to the global error handling middleware
      next(error);
    }
  };
}
