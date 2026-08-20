import { Schema, model, Document, Types } from "mongoose";

export interface IRequest extends Document {
  collectionId: Types.ObjectId;
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  headers: Map<string, string>;
  queryParams: Map<string, string>;
  body: {
    mode: "raw" | "json" | "from-data" | "none";
    rawContent?: string;
  };
  preRequestScript?: string;
  testScript?: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      required: true,
      default: "GET",
    },
    url: { type: String, required: true, trim: true },
    headers: { type: Map, of: String, default: {} },
    queryParams: { type: Map, of: String, default: {} },
    body: {
      mode: {
        type: String,
        enum: ["raw", "json", "form-data", "none"],
        default: "none",
      },
      rawContent: { type: String, default: "" },
    },
    preRequestScript: { type: String, default: "" },
    testScript: { type: String, default: "" },
  },
  { timestamps: true },
);

export const RequestModel = model<IRequest>("Request", requestSchema);
