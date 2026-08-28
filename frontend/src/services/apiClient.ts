import axios from "axios";

// Automatically use /api/v1 (proxied via Vite in dev or relative in prod)
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token and user headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const userStr = localStorage.getItem("auth_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) config.headers["x-user-id"] = user.id;
        if (user?.email) config.headers["x-user-email"] = user.email;
      } catch {
        // ignore parse error
      }
    }

    const activeWorkspaceId = localStorage.getItem("active_workspace_id");
    if (activeWorkspaceId) {
      config.headers["x-workspace-id"] = activeWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      // Token might be expired
      console.warn("Unauthorized API call:", error.config?.url);
    }

    // Surface the server's structured error message so callers get a
    // specific, human-readable error instead of a generic axios message.
    if (data?.error) {
      const serverError = typeof data.error === "string" ? { message: data.error } : data.error;
      if (serverError?.message) {
        error.message = serverError.message;
      }
      error.serverCode = serverError?.code;
      error.operationId = serverError?.operationId;
    } else if (status === 500) {
      error.message = "Something went wrong on our end. Please try again later.";
    }

    return Promise.reject(error);
  },
);
