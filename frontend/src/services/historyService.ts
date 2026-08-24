import { apiClient } from "./apiClient";

export interface HistoryItem {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  url: string;
  status: number;
  statusText?: string;
  durationMs: number;
  sizeBytes?: number;
  timestamp: string;
  requestBody?: any;
  requestHeaders?: Record<string, string>;
  responseBody?: any;
  responseHeaders?: Record<string, string>;
}

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: "hist-1",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users",
    status: 200,
    statusText: "OK",
    durationMs: 142,
    sizeBytes: 1245,
    timestamp: "Just now",
  },
  {
    id: "hist-2",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    status: 201,
    statusText: "Created",
    durationMs: 284,
    sizeBytes: 340,
    timestamp: "5 mins ago",
  },
  {
    id: "hist-3",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users/999",
    status: 404,
    statusText: "Not Found",
    durationMs: 98,
    sizeBytes: 24,
    timestamp: "12 mins ago",
  },
  {
    id: "hist-4",
    method: "DELETE",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    status: 200,
    statusText: "OK",
    durationMs: 110,
    sizeBytes: 2,
    timestamp: "1 hour ago",
  },
];

export const historyService = {
  getHistory(): HistoryItem[] {
    const saved = localStorage.getItem("postman_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_HISTORY;
  },

  addHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: "hist-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    const current = this.getHistory();
    const updated = [newItem, ...current.slice(0, 49)]; // keep latest 50 items
    localStorage.setItem("postman_history", JSON.stringify(updated));
    return newItem;
  },

  clearHistory(): void {
    localStorage.removeItem("postman_history");
  },
};
