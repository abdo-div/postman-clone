import mongoose from "mongoose";
import { EnvironmentModel, IEnvironment } from "./environment.model.js";
import { CreateEnvironmentInput, UpdateEnvironmentInput } from "./environment.dto.js";
import { NotFoundError } from "../../errors/app-error.js";

function formatEnvVariables(variablesRaw: any): any[] {
  if (!variablesRaw) return [];
  if (Array.isArray(variablesRaw)) {
    return variablesRaw.map((v, idx) => ({
      id: v.id || String(idx + 1),
      key: v.key || "",
      initialValue: v.initialValue || v.value || "",
      currentValue: v.currentValue || v.value || "",
      secret: Boolean(v.secret),
      description: v.description || "",
    }));
  }
  if (variablesRaw instanceof Map || typeof variablesRaw === "object") {
    const entries = variablesRaw instanceof Map ? Array.from(variablesRaw.entries()) : Object.entries(variablesRaw);
    return entries.map(([key, value], idx) => ({
      id: String(idx + 1),
      key,
      initialValue: String(value),
      currentValue: String(value),
      secret: key.toLowerCase().includes("token") || key.toLowerCase().includes("secret") || key.toLowerCase().includes("key") || key.toLowerCase().includes("password"),
      description: "",
    }));
  }
  return [];
}

function toVariablesMap(vars: any): Record<string, string> {
  if (!vars) return {};
  if (Array.isArray(vars)) {
    const map: Record<string, string> = {};
    for (const v of vars) {
      if (v.key && v.key.trim()) {
        map[v.key.trim()] = v.currentValue ?? v.initialValue ?? "";
      }
    }
    return map;
  }
  if (typeof vars === "object") {
    return vars;
  }
  return {};
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
          variables: {
            baseUrl: "https://jsonplaceholder.typicode.com",
            authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            apiVersion: "v1",
            timeout: "5000",
          },
        },
        {
          name: "Staging",
          isGlobal: false,
          variables: {
            baseUrl: "https://staging-api.example.com",
            authToken: "stg_secret_998844",
          },
        },
        {
          name: "Local Development",
          isGlobal: false,
          variables: {
            baseUrl: "http://localhost:5000",
            authToken: "dev_mock_token_123",
          },
        },
      ]);
    } catch {
      // ignore
    }
  }

  public async createEnvironment(input: CreateEnvironmentInput): Promise<any> {
    const data: any = { ...input };
    if (data.variables) {
      data.variables = toVariablesMap(data.variables);
    }
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
      variables: formatEnvVariables(e.variables),
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
    if (data.variables) {
      data.variables = toVariablesMap(data.variables);
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