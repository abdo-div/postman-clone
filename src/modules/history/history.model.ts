import { Schema, model, Document, Types } from "mongoose";

export interface IHistory extends Document {
  requestId: Types.ObjectId;
  requestSnapshot: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
  responseSnapshot: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: string;
  };
  metrics: {
    durationMs: number;
    sizeBytes: number;
  };
  testResults: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
  executedAt: Date;
}

const historySchema = new Schema<IHistory>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "Request", index: true },
    requestSnapshot: {
      method: { type: String, required: true },
      url: { type: String, required: true },
      headers: { type: Map, of: String, default: {} },
      body: { type: String, default: "" },
    },
    responseSnapshot: {
      status: { type: Number, required: true },
      statusText: { type: String, required: true },
      headers: { type: Map, of: String, default: {} },
      data: { type: String, default: "" },
    },
    metrics: {
      durationMs: { type: Number, required: true },
      sizeBytes: { type: Number, required: true },
    },
    testResults: [
      {
        name: { type: String, required: true },
        passed: { type: Boolean, required: true },
        error: { type: String },
      },
    ],
    executedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);
// src/modules/history/history.model.ts

// Static method: Fetch average response duration for a specific request ID
historySchema.statics.getAverageLatency = async function (requestId: Types.ObjectId): Promise<number> {
  const stats = await this.aggregate([
    { $match: { requestId } },
    { $group: { _id: '$requestId', avgLatency: { $avg: '$metrics.durationMs' } } }
  ]);

  return stats.length > 0 ? Math.round(stats[0].avgLatency) : 0;
};
export const HistoryModel = model<IHistory>("History", historySchema);
