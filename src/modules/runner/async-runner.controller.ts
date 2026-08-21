import { Request, Response, NextFunction } from "express";
import { enqueueCollectionRun, collectionRunnerQueue } from "./runner.queue.js";
import { NotFoundError } from "../../errors/app-error.js";

export class AsyncRunnerController {
  public enqueueRun = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { collectionId, environmentId, workspaceId } = req.body;

      const job = await enqueueCollectionRun({
        collectionId,
        workspaceId,
        environmentId,
        userId: req.user?.id || "system",
      });

      res.status(202).json({
        success: true,
        message: "Collection execution queued successfully",
        data: {
          jobId: job.id,
          status: await job.getState(),
          queuedAt: job.timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getJobStatus = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const job = await collectionRunnerQueue.getJob(req.params.jobId);
      if (!job) {
        throw new NotFoundError(`Execution job ${req.params.jobId} not found`);
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      res.status(200).json({
        success: true,
        data: {
          jobId: job.id,
          status: state,
          progress,
          result: state === "completed" ? result : null,
          error: state === "failed" ? failedReason : null,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const asyncRunnerController = new AsyncRunnerController();
