import type { EnvironmentListItem, EnvironmentVariable } from "./types";

export const workspace = {
  name: "Main Workspace",
  team: "Developer Team",
};

export const environments: EnvironmentListItem[] = [
  { id: "dev", name: "Development" },
  { id: "staging", name: "Staging" },
  { id: "prod", name: "Production" },
];

export const productionVariables: EnvironmentVariable[] = [
  {
    id: "base-url",
    key: "baseUrl",
    initialValue: "https://api.prod.com",
    currentValue: "https://api.prod.com",
    secret: false,
    description: "Production API base URL",
  },
  {
    id: "api-key",
    key: "apiKey",
    initialValue: "super_secret_key_123",
    currentValue: "super_secret_key_123",
    secret: true,
    description: "Primary authentication token",
  },
  {
    id: "timeout",
    key: "timeout",
    initialValue: "5000",
    currentValue: "5000",
    secret: false,
    description: "Request timeout in ms",
  },
];
