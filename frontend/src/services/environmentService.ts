import { apiClient } from "./apiClient";

export interface EnvironmentVariable {
  id: string;
  key: string;
  initialValue: string;
  currentValue: string;
  secret?: boolean;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  isProd?: boolean;
  variables: EnvironmentVariable[];
}

function variablesToPayload(vars: EnvironmentVariable[] = []) {
  return vars.map((v) => ({
    id: v.id,
    key: v.key,
    initialValue: v.initialValue ?? "",
    currentValue: v.currentValue ?? v.initialValue ?? "",
    secret: Boolean(v.secret),
    description: v.description ?? "",
  }));
}

export const environmentService = {
  async getEnvironments(): Promise<Environment[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/environments");
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((e) => ({
          id: e._id || e.id,
          name: e.name,
          isProd: e.name.toLowerCase().includes("prod"),
          variables: Array.isArray(e.variables)
            ? e.variables.map((v: any, idx: number) => ({
                id: v.id || String(idx + 1),
                key: v.key || "",
                initialValue: v.initialValue || v.value || "",
                currentValue: v.currentValue || v.value || "",
                secret: Boolean(v.secret),
                description: v.description || "",
              }))
            : typeof e.variables === "object"
              ? Object.entries(e.variables).map(([k, v], idx) => ({
                  id: String(idx + 1),
                  key: k,
                  initialValue: String(v),
                  currentValue: String(v),
                  secret: false,
                  description: "",
                }))
              : [],
        }));
        localStorage.setItem("postman_environments", JSON.stringify(formatted));
        return formatted;
      }
    } catch {
      // Local fallback
    }

    const saved = localStorage.getItem("postman_environments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  },

  async createEnvironment(name: string, isProd = false, variables: EnvironmentVariable[] = []): Promise<Environment> {
    const newEnv: Environment = {
      id: "env-" + Date.now(),
      name,
      isProd,
      variables,
    };

    try {
      const res = await apiClient.post("/environments", {
        name,
        isGlobal: false,
        variables: variablesToPayload(variables),
      });
      const created = res.data?.data || res.data;
      if (created?._id || created?.id) {
        newEnv.id = created._id || created.id;
      }
    } catch {
      // Local fallback
    }

    return newEnv;
  },

  async updateEnvironment(id: string, name: string, variables: EnvironmentVariable[]): Promise<void> {
    try {
      await apiClient.patch(`/environments/${id}`, {
        name,
        variables: variablesToPayload(variables),
      });
    } catch {
      // Local fallback
    }
  },

  async deleteEnvironment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/environments/${id}`);
    } catch {
      // Local fallback
    }
  },

  async saveEnvironments(envs: Environment[]): Promise<void> {
    localStorage.setItem("postman_environments", JSON.stringify(envs));
  },
};
