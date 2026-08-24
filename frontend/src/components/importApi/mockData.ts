import type { ApiDefinitionPreview } from "./types";

export const apiPreview: ApiDefinitionPreview = {
  title: "Users API v2.0",
  spec: "OAS 3.0",
  baseUrl: "Base URL: https://api.example.com/v2",
  extraEndpoints: 9,
  endpoints: [
    { id: "get-users", method: "GET", path: "/users" },
    { id: "post-users", method: "POST", path: "/users" },
    { id: "get-user", method: "GET", path: "/users/{id}" },
    { id: "put-user", method: "PUT", path: "/users/{id}" },
    { id: "delete-user", method: "DELETE", path: "/users/{id}" },
  ],
};
