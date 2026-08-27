import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisConnection } from '../../config/redis.js';

export class HealthController {
  // Liveness Probe: Verifies the Express HTTP process is alive
  public getLiveness = (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  };

  // Readiness Probe: Verifies core dependencies (MongoDB + Redis) are connected
  public getReadiness = async (_req: Request, res: Response): Promise<void> => {
    const mongoStatus = mongoose.connection.readyState === 1;
    let redisStatus = false;

    try {
      const ping = await redisConnection.ping();
      redisStatus = ping === 'PONG';
    } catch {
      redisStatus = false;
    }

    const isReady = mongoStatus && redisStatus;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'unhealthy',
      checks: {
        database: mongoStatus ? 'up' : 'down',
        redis: redisStatus ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    });
  };
}

export const healthController = new HealthController();