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
  requestBody?: string | Record<string, unknown>;
  requestHeaders?: Record<string, string>;
  responseBody?: string | Record<string, unknown>;
  responseHeaders?: Record<string, string>;
  testResults?: Array<{ name: string; passed: boolean; error?: string }>;
}

export const historyService = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Array<Record<string, unknown>> }>("/history");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        const items = list.map((item) => ({
          id: (item.id || item._id || "hist-" + Date.now()) as string,
          requestId: item.requestId as string | undefined,
          method: (item.method || (item.requestSnapshot as Record<string, unknown>)?.method || "GET") as HistoryItem["method"],
          url: (item.url || (item.requestSnapshot as Record<string, unknown>)?.url || "") as string,
          status: Number(item.status || (item.responseSnapshot as Record<string, unknown>)?.status || 200),
          statusText: (item.statusText || (item.responseSnapshot as Record<string, unknown>)?.statusText || "OK") as string,
          durationMs: Number(item.durationMs || (item.metrics as Record<string, unknown>)?.durationMs || 0),
          sizeBytes: Number(item.sizeBytes || (item.metrics as Record<string, unknown>)?.sizeBytes || 0),
          timestamp: (item.timestamp || (item.executedAt ? new Date(item.executedAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just now")) as string,
          requestHeaders: (item.requestHeaders || (item.requestSnapshot as Record<string, unknown>)?.headers || {}) as Record<string, string>,
          requestBody: (item.requestBody || (item.requestSnapshot as Record<string, unknown>)?.body || "") as string | Record<string, unknown>,
          responseHeaders: (item.responseHeaders || (item.responseSnapshot as Record<string, unknown>)?.headers || {}) as Record<string, string>,
          responseBody: (item.responseBody || (item.responseSnapshot as Record<string, unknown>)?.data || "") as string | Record<string, unknown>,
          testResults: (item.testResults || []) as Array<{ name: string; passed: boolean; error?: string }>,
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
