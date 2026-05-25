import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  isLogin: boolean;
  adminName: string;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLogin: false as boolean,
      adminName: "",
      login: (name) => set({ isLogin: true, adminName: name }),
      logout: () => set({ isLogin: false, adminName: "" }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
