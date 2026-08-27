import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { EnvironmentModel, IEnvironment, IEnvironmentVariable } from "./environment.model.js";
import { CreateEnvironmentInput, UpdateEnvironmentInput } from "./environment.dto.js";
import { NotFoundError } from "../../errors/app-error.js";

function inferSecret(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.includes("token") ||
    k.includes("secret") ||
    k.includes("key") ||
    k.includes("password")
  );
}

/**
 * Normalize incoming variables into the rich storage shape.
 * Accepts either an array of variable objects or a legacy key->value map.
 */
function normalizeVariables(variablesRaw: any): IEnvironmentVariable[] {
  if (!variablesRaw) return [];

  if (Array.isArray(variablesRaw)) {
    return variablesRaw
      .filter((v) => v && typeof v === "object")
      .map((v) => ({
        id: typeof v.id === "string" && v.id ? v.id : randomUUID(),
        key: String(v.key ?? ""),
        initialValue: String(v.initialValue ?? ""),
        currentValue: String(v.currentValue ?? ""),
        secret: Boolean(v.secret),
        description: String(v.description ?? ""),
      }));
  }

  if (variablesRaw instanceof Map || typeof variablesRaw === "object") {
    const entries =
      variablesRaw instanceof Map
        ? Array.from(variablesRaw.entries())
        : Object.entries(variablesRaw);
    return entries.map(([key, value]) => ({
      id: randomUUID(),
      key,
      initialValue: String(value),
      currentValue: String(value),
      secret: inferSecret(key),
      description: "",
    }));
  }

  return [];
}

export class EnvironmentService {
  public async seedDefaultEnvironmentsIfEmpty(): Promise<void> {
    if (process.env.NODE_ENV === "test" || mongoose.connection.readyState !== 1) return;
    try {
      const count = await EnvironmentModel.countDocuments();
      if (count > 0) return;

      await EnvironmentModel.create([
        {
          name: "Production",
          isGlobal: false,
          variables: [
            { id: randomUUID(), key: "baseUrl", initialValue: "https://jsonplaceholder.typicode.com", currentValue: "https://jsonplaceholder.typicode.com", secret: false, description: "Base API URL" },
            { id: randomUUID(), key: "authToken", initialValue: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", currentValue: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", secret: true, description: "" },
            { id: randomUUID(), key: "apiVersion", initialValue: "v1", currentValue: "v1", secret: false, description: "" },
            { id: randomUUID(), key: "timeout", initialValue: "5000", currentValue: "5000", secret: false, description: "" },
          ],
        },
        {
          name: "Staging",
          isGlobal: false,
          variables: [
            { id: randomUUID(), key: "baseUrl", initialValue: "https://staging-api.example.com", currentValue: "https://staging-api.example.com", secret: false, description: "" },
            { id: randomUUID(), key: "authToken", initialValue: "stg_secret_998844", currentValue: "stg_secret_998844", secret: true, description: "" },
          ],
        },
        {
          name: "Local Development",
          isGlobal: false,
          variables: [
            { id: randomUUID(), key: "baseUrl", initialValue: "http://localhost:5000", currentValue: "http://localhost:5000", secret: false, description: "" },
            { id: randomUUID(), key: "authToken", initialValue: "dev_mock_token_123", currentValue: "dev_mock_token_123", secret: true, description: "" },
          ],
        },
      ]);
    } catch {
      // ignore
    }
  }

  public async createEnvironment(input: CreateEnvironmentInput): Promise<any> {
    const data: any = { ...input };
    data.variables = normalizeVariables(data.variables);
    return await EnvironmentModel.create(data);
  }

  public async getAllEnvironments(): Promise<any[]> {
    await this.seedDefaultEnvironmentsIfEmpty();
    const envs = await EnvironmentModel.find().lean();
    if (!Array.isArray(envs)) return [];
    return envs.map((e: any) => ({
      ...e,
      id: e._id ? e._id.toString() : e.id,
      isProd: e.name ? e.name.toLowerCase().includes("prod") : false,
      variables: normalizeVariables(e.variables),
    }));
  }

  public async getEnvironmentById(id: string): Promise<any> {
    const env = await EnvironmentModel.findById(id);
    if (!env) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
    return env;
  }

  public async updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<any> {
    const data: any = { ...input };
    if ("variables" in data) {
      data.variables = normalizeVariables(data.variables);
    }
    const updated = await EnvironmentModel.findByIdAndUpdate(
      id,
      data as unknown as Partial<IEnvironment>,
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
    return updated;
  }

  public async deleteEnvironment(id: string): Promise<void> {
    const deleted = await EnvironmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
  }
}
