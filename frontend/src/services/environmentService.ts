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

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: "prod",
    name: "Production",
    isProd: true,
    variables: [
      {
        id: "1",
        key: "baseUrl",
        initialValue: "https://jsonplaceholder.typicode.com",
        currentValue: "https://jsonplaceholder.typicode.com",
        description: "Primary Production API Base URL",
      },
      {
        id: "2",
        key: "authToken",
        initialValue: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        currentValue: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        secret: true,
        description: "Production API Bearer Token",
      },
      {
        id: "3",
        key: "apiVersion",
        initialValue: "v1",
        currentValue: "v1",
        description: "Active API release version",
      },
      {
        id: "4",
        key: "timeout",
        initialValue: "5000",
        currentValue: "5000",
        description: "HTTP request timeout in ms",
      },
    ],
  },
  {
    id: "staging",
    name: "Staging (US-East)",
    isProd: false,
    variables: [
      {
        id: "s1",
        key: "baseUrl",
        initialValue: "https://staging-api.example.com",
        currentValue: "https://staging-api.example.com",
        description: "Staging cluster endpoint",
      },
      {
        id: "s2",
        key: "authToken",
        initialValue: "stg_secret_998844",
        currentValue: "stg_secret_998844",
        secret: true,
      },
    ],
  },
  {
    id: "local",
    name: "Local Development",
    isProd: false,
    variables: [
      {
        id: "l1",
        key: "baseUrl",
        initialValue: "http://localhost:5000",
        currentValue: "http://localhost:5000",
        description: "Local Express API Server",
      },
      {
        id: "l2",
        key: "authToken",
        initialValue: "dev_mock_token_123",
        currentValue: "dev_mock_token_123",
        secret: true,
      },
    ],
  },
];

export const environmentService = {
  async getEnvironments(): Promise<Environment[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/environments");
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((e) => ({
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
                }))
              : [],
        }));
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
    return DEFAULT_ENVIRONMENTS;
  },

  async saveEnvironments(envs: Environment[]): Promise<void> {
    localStorage.setItem("postman_environments", JSON.stringify(envs));
  },
};
