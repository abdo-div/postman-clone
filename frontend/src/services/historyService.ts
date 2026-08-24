import { apiClient } from "./apiClient";

export interface HistoryItem {
  id: string;
  requestId?: string;
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
  testResults?: Array<{ name: string; passed: boolean; error?: string }>;
}

export const historyService = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/history");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        const items = list.map((item: any) => ({
          id: item.id || item._id || "hist-" + Date.now(),
          requestId: item.requestId,
          method: item.method || item.requestSnapshot?.method || "GET",
          url: item.url || item.requestSnapshot?.url || "",
          status: item.status || item.responseSnapshot?.status || 200,
          statusText: item.statusText || item.responseSnapshot?.statusText || "OK",
          durationMs: item.durationMs || item.metrics?.durationMs || 0,
          sizeBytes: item.sizeBytes || item.metrics?.sizeBytes || 0,
          timestamp: item.timestamp || (item.executedAt ? new Date(item.executedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now"),
          requestHeaders: item.requestHeaders || item.requestSnapshot?.headers || {},
          requestBody: item.requestBody || item.requestSnapshot?.body || "",
          responseHeaders: item.responseHeaders || item.responseSnapshot?.headers || {},
          responseBody: item.responseBody || item.responseSnapshot?.data || "",
          testResults: item.testResults || [],
        }));
        localStorage.setItem("postman_history", JSON.stringify(items));
        return items;
      }
    } catch {
      // Local fallback
    }

    const saved = localStorage.getItem("postman_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  },

  async addHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): Promise<HistoryItem> {
    const newItem: HistoryItem = {
      ...item,
      id: "hist-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    try {
      const res = await apiClient.post("/history", {
        requestId: item.requestId,
        method: item.method,
        url: item.url,
        status: item.status,
        statusText: item.statusText,
        durationMs: item.durationMs,
        sizeBytes: item.sizeBytes,
        requestHeaders: item.requestHeaders,
        requestBody: item.requestBody,
        responseHeaders: item.responseHeaders,
        responseBody: item.responseBody,
        testResults: item.testResults,
      });
      const created = res.data?.data;
      if (created?._id || created?.id) {
        newItem.id = created._id || created.id;
      }
    } catch {
      // Local fallback
    }

    const currentSaved = localStorage.getItem("postman_history");
    let list: HistoryItem[] = [];
    if (currentSaved) {
      try {
        list = JSON.parse(currentSaved);
      } catch {
        list = [];
      }
    }
    const updated = [newItem, ...list.slice(0, 49)];
    localStorage.setItem("postman_history", JSON.stringify(updated));

    return newItem;
  },

  async clearHistory(): Promise<void> {
    try {
      await apiClient.delete("/history");
    } catch {
      // Local fallback
    }
    localStorage.removeItem("postman_history");
  },
};
