import { Worker, Job } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import {
  COLLECTION_RUNNER_QUEUE,
  CollectionRunJobPayload,
} from "./runner.queue.js";
import { CollectionRunnerService } from "./collection-runner.service.js";

const runnerService = new CollectionRunnerService();

export const collectionRunnerWorker = new Worker<CollectionRunJobPayload>(
  COLLECTION_RUNNER_QUEUE,
  async (job: Job<CollectionRunJobPayload>) => {
    console.log(
      `[Worker] Starting job ${job.id} for collection: ${job.data.collectionId}`,
    );

    // Execute collection runner pipeline
    const summary = await runnerService.runCollection({
      collectionId: job.data.collectionId,
      environmentId: job.data.environmentId,
    });

    console.log(
      `[Worker] Completed job ${job.id}. Executed ${summary.totalExecuted} requests.`,
    );
    return summary;
  },
  {
    connection: redisConnection,
    concurrency: 5, // Concurrent execution threads per worker instance
  },
);

collectionRunnerWorker.on("completed", (job) => {
  console.log(`[Worker Status] Job ${job.id} finished successfully`);
});

collectionRunnerWorker.on("failed", (job, err) => {
  console.error(
    `[Worker Status] Job ${job?.id} failed with error: ${err.message}`,
  );
});
