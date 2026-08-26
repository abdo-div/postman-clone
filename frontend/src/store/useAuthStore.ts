import { create } from "zustand";
import { authService, type User, type LoginDto, type RegisterDto } from "../services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<boolean>;
  register: (dto: RegisterDto) => Promise<boolean>;
  guestLogin: () => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = authService.getCurrentUser();
  const initialToken = authService.getToken();

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialToken || initialUser),
    isLoading: false,
    error: null,

    login: async (dto) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authService.login(dto);
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        set({
          user: res.user,
          token: res.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to sign in";
        set({
          error: msg,
          isLoading: false,
        });
        return false;
      }
    },

    register: async (dto) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authService.register(dto);
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        set({
          user: res.user,
          token: res.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to sign up";
        set({
          error: msg,
          isLoading: false,
        });
        return false;
      }
    },

    guestLogin: () => {
      const guestUser: User = {
        id: "507f1f77bcf86cd799439011",
        name: "Developer Guest",
        email: "guest@postman-clone.local",
      };
      localStorage.setItem("auth_user", JSON.stringify(guestUser));
      set({
        user: guestUser,
        token: "guest_session_token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    },

    logout: () => {
      authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
