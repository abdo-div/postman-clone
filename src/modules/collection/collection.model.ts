import { Schema, model, Document, Types } from "mongoose";

export interface ICollection extends Document {
  name: string;
  description?: string;
  parentId?: Types.ObjectId;
  variables: Map<string, string>;
  headers: Map<string, string>;
  auth?: {
    type: "bearer" | "basic" | "apiKey" | "none";
    config: Map<string, string>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    parentId: {
      type: Types.ObjectId,
      ref: "Collection",
      default: null,
      index: true,
    },
    variables: { type: Map, of: String, default: {} },
    headers: { type: Map, of: String, default: {} },
    auth: {
      type: {
        type: String,
        enum: ["bearer", "basic", "apiKey", "none"],
        default: "none",
      },
      config: { type: Map, of: String, default: {} },
    },
  },
  { timestamps: true },
);

collectionSchema.methods.getVariablesObject = function (): Record<string, string> {
  const obj: Record<string, string> = {};
  this.variables.forEach((val: string, key: string) => {
    obj[key] = val;
  });
  return obj;
};

// Cascade delete: Remove associated requests when a collection is deleted
collectionSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await model('Request').deleteMany({ collectionId: this._id });
  
});

export const CollectionModel = model<ICollection>(
  "Collection",
  collectionSchema,
);
