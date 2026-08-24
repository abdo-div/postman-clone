import { apiClient } from "./apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data);
      return response.data;
    } catch (err: any) {
      // Fallback for offline / demo mode
      if (!err.response || err.code === "ERR_NETWORK") {
        const mockUser: User = {
          id: "demo-user-" + Date.now(),
          name: data.name || data.email.split("@")[0],
          email: data.email,
        };
        const mockToken = "mock_jwt_token_" + Date.now();
        return { token: mockToken, user: mockUser };
      }
      throw new Error(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    }
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (err: any) {
      // Fallback for offline / demo mode
      if (!err.response || err.code === "ERR_NETWORK") {
        const mockUser: User = {
          id: "demo-user-" + Date.now(),
          name: data.email.split("@")[0],
          email: data.email,
        };
        const mockToken = "mock_jwt_token_" + Date.now();
        return { token: mockToken, user: mockUser };
      }
      throw new Error(err.response?.data?.error || err.response?.data?.message || "Login failed");
    }
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },
};
