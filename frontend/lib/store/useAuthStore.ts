import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_VERSION, isUsableToken, User } from "../api";

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => {
        if (token && isUsableToken(token)) {
          set({ token });
        } else {
          set({ token: null, user: null });
        }
      },
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      version: parseInt(AUTH_STORAGE_VERSION.replace(/\D/g, "")) || 1,
    }
  )
);
