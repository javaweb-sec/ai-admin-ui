import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { signIn, type SessionUser } from "@/services/auth";
import { appConfig } from "@/config/app";
interface AuthState {
  user: SessionUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (username, password) => {
        const user = await signIn(username, password);
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    {
      name: `${appConfig.storagePrefix}:session`,
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ user }) => ({ user }),
    },
  ),
);
