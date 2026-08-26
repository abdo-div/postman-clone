import { Schema, model, Document } from "mongoose";

export interface IEnvironmentVariable {
  id: string;
  key: string;
  initialValue: string;
  currentValue: string;
  secret: boolean;
  description: string;
}

export interface IEnvironment extends Document {
  name: string;
  isGlobal: boolean;
  variables: IEnvironmentVariable[];
  createdAt: Date;
  updatedAt: Date;
}

const environmentVariableSchema = new Schema<IEnvironmentVariable>(
  {
    id: { type: String, required: true },
    key: { type: String, default: "" },
    initialValue: { type: String, default: "" },
    currentValue: { type: String, default: "" },
    secret: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const environmentSchema = new Schema<IEnvironment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isGlobal: { type: Boolean, default: false },
    variables: { type: [environmentVariableSchema], default: [] },
  },
  { timestamps: true }
);

export const EnvironmentModel = model<IEnvironment>(
  "Environment",
  environmentSchema
);
