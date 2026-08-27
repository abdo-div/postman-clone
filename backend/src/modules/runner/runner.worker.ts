import { Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis.js';
import { COLLECTION_RUNNER_QUEUE, CollectionRunJobPayload } from './runner.queue.js';
import { CollectionRunnerService } from './collection-runner.service.js';
import { getSocketServer } from '../../config/socket.js';

const runnerService = new CollectionRunnerService();

export const collectionRunnerWorker = new Worker<CollectionRunJobPayload>(
  COLLECTION_RUNNER_QUEUE,
  async (job: Job<CollectionRunJobPayload>) => {
    const socket = getSocketServer();
    const room = `job:${job.id}`;

    // 1. Emit Job Started Event
    socket.to(room).emit('runner:started', {
      jobId: job.id,
      collectionId: job.data.collectionId,
      timestamp: Date.now(),
    });

    // 2. Execute collection with progress callback
    const summary = await runnerService.runCollection({
      collectionId: job.data.collectionId,
      environmentId: job.data.environmentId,
      onProgress: (progressData) => {
        // Stream individual request execution results in real-time
        socket.to(room).emit('runner:progress', {
          jobId: job.id,
          ...progressData,
        });

        // Update BullMQ internal progress percentage
        job.updateProgress(progressData.percentage);
      },
    });

    // 3. Emit Job Completed Event
    socket.to(room).emit('runner:completed', {
      jobId: job.id,
      summary,
      timestamp: Date.now(),
    });

    return summary;
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

collectionRunnerWorker.on('failed', (job, err) => {
  if (job) {
    try {
      const socket = getSocketServer();
      socket.to(`job:${job.id}`).emit('runner:failed', {
        jobId: job.id,
        error: err.message,
        timestamp: Date.now(),
      });
    } catch {
      // Ignore if socket server is uninitialized in unit test environments
    }
  }
});