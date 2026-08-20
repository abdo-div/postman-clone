import { Schema, model, Document } from "mongoose";

export interface IEnvironment extends Document {
  name: string;
  isGlobal: boolean;
  variables: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const environmentSchema = new Schema<IEnvironment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isGlobal: { type: Boolean, default: false },
    variables: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

export const EnvironmentModel = model<IEnvironment>(
  "Environment",
  environmentSchema,
);
