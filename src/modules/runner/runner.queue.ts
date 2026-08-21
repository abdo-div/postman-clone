import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis.js";

export const COLLECTION_RUNNER_QUEUE = "collection-runner-queue";

export interface CollectionRunJobPayload {
  collectionId: string;
  workspaceId: string;
  environmentId?: string;
  userId: string;
}

export const collectionRunnerQueue = new Queue<CollectionRunJobPayload>(
  COLLECTION_RUNNER_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100, // Retain last 100 completed jobs
      removeOnFail: 500, // Retain last 500 failed jobs for audit
    },
  },
);

export const enqueueCollectionRun = async (
  payload: CollectionRunJobPayload,
) => {
  const job = await collectionRunnerQueue.add(
    `run-collection-${payload.collectionId}`,
    payload,
  );
  return job;
};
