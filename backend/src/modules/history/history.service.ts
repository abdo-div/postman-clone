import { Types } from "mongoose";
import { HistoryModel, IHistory } from "./history.model.js";
import { NotFoundError } from "../../errors/app-error.js";

export class HistoryService {
  public async createHistory(data: any): Promise<IHistory> {
    const payload: any = {
      requestSnapshot: {
        method: data.method || data.requestSnapshot?.method || "GET",
        url: data.url || data.requestSnapshot?.url || "",
        headers: data.requestHeaders || data.requestSnapshot?.headers || {},
        body: typeof data.requestBody === "object" ? JSON.stringify(data.requestBody) : (data.requestBody || data.requestSnapshot?.body || ""),
      },
      responseSnapshot: {
        status: data.status || data.responseSnapshot?.status || 200,
        statusText: data.statusText || data.responseSnapshot?.statusText || "OK",
        headers: data.responseHeaders || data.responseSnapshot?.headers || {},
        data: typeof data.responseBody === "object" ? JSON.stringify(data.responseBody) : (data.responseBody || data.responseSnapshot?.data || ""),
      },
      metrics: {
        durationMs: data.durationMs || data.metrics?.durationMs || 0,
        sizeBytes: data.sizeBytes || data.metrics?.sizeBytes || 0,
      },
      testResults: data.testResults || [],
      executedAt: data.executedAt || new Date(),
    };

    if (data.requestId && Types.ObjectId.isValid(data.requestId)) {
      payload.requestId = new Types.ObjectId(data.requestId);
    }

    const record = await HistoryModel.create(payload);
    return record as IHistory;
  }

  public async getAllHistory(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      HistoryModel.find()
        .sort({ executedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HistoryModel.countDocuments(),
    ]);

    const formatted = data.map((item: any) => ({
      id: item._id.toString(),
      requestId: item.requestId ? item.requestId.toString() : undefined,
      method: item.requestSnapshot?.method || "GET",
      url: item.requestSnapshot?.url || "",
      status: item.responseSnapshot?.status || 200,
      statusText: item.responseSnapshot?.statusText || "OK",
      durationMs: item.metrics?.durationMs || 0,
      sizeBytes: item.metrics?.sizeBytes || 0,
      requestHeaders: item.requestSnapshot?.headers instanceof Map ? Object.fromEntries(item.requestSnapshot.headers) : item.requestSnapshot?.headers || {},
      requestBody: item.requestSnapshot?.body || "",
      responseHeaders: item.responseSnapshot?.headers instanceof Map ? Object.fromEntries(item.responseSnapshot.headers) : item.responseSnapshot?.headers || {},
      responseBody: item.responseSnapshot?.data || "",
      testResults: item.testResults || [],
      timestamp: item.executedAt ? new Date(item.executedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now",
      executedAt: item.executedAt,
    }));

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
        .sort({ executedAt: -1 })
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
    if (!Types.ObjectId.isValid(requestId)) {
      return { totalRuns: 0, avgLatencyMs: 0, minLatencyMs: 0, maxLatencyMs: 0, avgSizeBytes: 0 };
    }

    const stats = await HistoryModel.aggregate([
      { $match: { requestId: new Types.ObjectId(requestId) } },
      {
        $group: {
          _id: "$requestId",
          totalRuns: { $sum: 1 },
          avgLatencyMs: { $avg: "$metrics.durationMs" },
          minLatencyMs: { $min: "$metrics.durationMs" },
          maxLatencyMs: { $max: "$metrics.durationMs" },
          avgSizeBytes: { $avg: "$metrics.sizeBytes" },
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

  public async clearAllHistory(): Promise<void> {
    await HistoryModel.deleteMany({});
  }
}