import { create } from "zustand";

interface SavedPropertiesState {
  savedIds: string[];
  setSavedIds: (ids: string[]) => void;
  setSaved: (id: string, saved: boolean) => void;
  isSaved: (id: string) => boolean;
  getSavedCount: () => number;
  clear: () => void;
}

export const useSavedPropertiesStore = create<SavedPropertiesState>((set, get) => ({
  savedIds: [],
  setSavedIds: (ids) => set({ savedIds: Array.from(new Set(ids)) }),
  setSaved: (id, saved) =>
    set((state) => ({
      savedIds: saved
        ? state.savedIds.includes(id)
          ? state.savedIds
          : [...state.savedIds, id]
        : state.savedIds.filter((savedId) => savedId !== id),
    })),
  isSaved: (id) => get().savedIds.includes(id),
  getSavedCount: () => get().savedIds.length,
  clear: () => set({ savedIds: [] }),
}));
