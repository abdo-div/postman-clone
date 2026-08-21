import { Types } from 'mongoose';
import { HistoryModel, IHistory } from './history.model.js';
import { NotFoundError } from '../../errors/app-error.js';

export class HistoryService {
  public async getHistoryById(id: string): Promise<IHistory> {
    const history = await HistoryModel.findById(id).lean();
    if (!history) {
      throw new NotFoundError(`History record with ID ${id} not found`);
    }
    return history as IHistory;
  }

  public async getHistoryByRequestId(requestId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      HistoryModel.find({ requestId })
        .sort({ executedAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(),
      HistoryModel.countDocuments({ requestId }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getRequestMetrics(requestId: string) {
    // Mongoose aggregation pipeline to compute performance metrics
    const stats = await HistoryModel.aggregate([
      { $match: { requestId: new Types.ObjectId(requestId) } },
      {
        $group: {
          _id: '$requestId',
          totalRuns: { $sum: 1 },
          avgLatencyMs: { $avg: '$metrics.durationMs' },
          minLatencyMs: { $min: '$metrics.durationMs' },
          maxLatencyMs: { $max: '$metrics.durationMs' },
          avgSizeBytes: { $avg: '$metrics.sizeBytes' },
        },
      },
    ]);

    if (stats.length === 0) {
      return { totalRuns: 0, avgLatencyMs: 0, minLatencyMs: 0, maxLatencyMs: 0, avgSizeBytes: 0 };
    }

    return {
      totalRuns: stats[0].totalRuns,
      avgLatencyMs: Math.round(stats[0].avgLatencyMs),
      minLatencyMs: stats[0].minLatencyMs,
      maxLatencyMs: stats[0].maxLatencyMs,
      avgSizeBytes: Math.round(stats[0].avgSizeBytes),
    };
  }

  public async clearHistoryForRequest(requestId: string): Promise<void> {
    await HistoryModel.deleteMany({ requestId });
  }
}