import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { useSocket } from "./useSocket";
import { API } from "../lib/axiosClient";
import { persist } from "zustand/middleware";
import type { UserType, RegisterType, LoginType } from "../types/auth.type";

interface AuthState {
  user: UserType | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;

  register: (data: RegisterType) => void;
  login: (data: LoginType) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggingIn: false,
      isSigningUp: false,
      isAuthStatusLoading: false,

      register: async (data: RegisterType) => {
        set({ isSigningUp: true });
        try {
          const response = await API.post("/auth/register", data);
          set({ user: response.data.user });
          useSocket.getState().connectSocket();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("Registration failed");
          }
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data: LoginType) => {
        set({ isLoggingIn: true });
        try {
          const response = await API.post("/auth/login", data);
          set({ user: response.data.user });
          useSocket.getState().connectSocket();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("Login failed");
          }
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await API.post("/auth/logout");

          set({ user: null });
          useSocket.getState().disconnectSocket();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("Logout failed");
          }
        }
      },

      isAuthStatus: async () => {
        set({ isAuthStatusLoading: true });
        try {
          const response = await API.get("/auth/me");
          set({ user: response.data.user });
          useSocket.getState().connectSocket();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("Authentication Failed");
          }
        } finally {
          set({ isAuthStatusLoading: false });
        }
      },
    }),
    {
      name: "whop:root",
    }
  )
);
