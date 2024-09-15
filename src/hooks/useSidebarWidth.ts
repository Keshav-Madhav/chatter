import { create } from "zustand";

type props = {
  width: number;
  setWidth: (width: number) => void;
};

export const useSidebarWidth = create<props>((set) => ({
  width: 30,
  setWidth: (width) => set({ width }),
}));