import { create } from "zustand";
import { historyService, type HistoryItem } from "../services/historyService";

interface HistoryState {
  items: HistoryItem[];
  searchQuery: string;
  filterMethod: string;
  filterStatus: string;
  load: () => void;
  addItem: (item: Omit<HistoryItem, "id" | "timestamp">) => HistoryItem;
  clearAll: () => void;
  setSearchQuery: (q: string) => void;
  setFilterMethod: (m: string) => void;
  setFilterStatus: (s: string) => void;
  getFiltered: () => HistoryItem[];
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  searchQuery: "",
  filterMethod: "ALL",
  filterStatus: "ALL",

  load: () => {
    const items = historyService.getHistory();
    set({ items });
  },

  addItem: (item) => {
    const newItem = historyService.addHistoryItem(item);
    set((s) => ({ items: [newItem, ...s.items] }));
    return newItem;
  },

  clearAll: () => {
    historyService.clearHistory();
    set({ items: [] });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterMethod: (m) => set({ filterMethod: m }),
  setFilterStatus: (s) => set({ filterStatus: s }),

  getFiltered: () => {
    const { items, searchQuery, filterMethod, filterStatus } = get();
    return items.filter((item) => {
      const matchesQuery =
        !searchQuery ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.method.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod =
        filterMethod === "ALL" || item.method === filterMethod;
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "2xx" && item.status >= 200 && item.status < 300) ||
        (filterStatus === "4xx" && item.status >= 400 && item.status < 500) ||
        (filterStatus === "5xx" && item.status >= 500) ||
        (filterStatus === "error" && (item.status < 200 || item.status >= 400));
      return matchesQuery && matchesMethod && matchesStatus;
    });
  },
}));
