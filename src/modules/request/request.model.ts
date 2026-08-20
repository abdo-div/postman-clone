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
// src/modules/request/request.model.ts

// Pre-save hook: Sanitize and format URL string
requestSchema.pre('save', function () {
  if (this.url) {
    this.url = this.url.trim();
  }
  
});

// Instance method: Resolve full target URL including query parameters
requestSchema.methods.getFullUrl = function (): string {
  if (!this.queryParams || this.queryParams.size === 0) {
    return this.url;
  }
  
  const searchParams = new URLSearchParams();
  this.queryParams.forEach((value: string, key: string) => {
    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return this.url.includes('?') ? `${this.url}&${queryString}` : `${this.url}?${queryString}`;
};
export const RequestModel = model<IRequest>("Request", requestSchema);
