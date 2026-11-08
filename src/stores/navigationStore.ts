import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appConfig } from "@/config/app";
interface NavigationState {
  collapsed: boolean;
  collapsedGroups: Record<string, boolean>;
  toggleSidebar: () => void;
  toggleGroup: (group: string) => void;
}
export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      collapsed: false,
      collapsedGroups: { 系统管理: true },
      toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
      toggleGroup: (group) =>
        set((state) => ({
          collapsedGroups: {
            ...state.collapsedGroups,
            [group]: !state.collapsedGroups[group],
          },
        })),
    }),
    { name: `${appConfig.storagePrefix}:navigation`, version: 1 },
  ),
);
