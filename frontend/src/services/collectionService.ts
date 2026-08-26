import { apiClient } from "./apiClient";

export interface HeaderItem {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description?: string;
}

export interface ParamItem {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description?: string;
}

export interface RequestItem {
  id: string;
  name: string;
  collectionId?: string;
  folderId?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  url: string;
  headers: HeaderItem[];
  queryParams: ParamItem[];
  bodyType?: "none" | "json" | "raw" | "form-data";
  body?: string;
  auth?: {
    type: "none" | "bearer" | "basic" | "api-key";
    token?: string;
    username?: string;
    password?: string;
    apiKey?: { key: string; value: string; addTo: "header" | "query" };
  };
  testsScript?: string;
  preRequestScript?: string;
}

export interface CollectionFolder {
  id: string;
  name: string;
  requests: RequestItem[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  folders?: CollectionFolder[];
  requests?: RequestItem[];
  createdAt?: string;
  updatedAt?: string;
}

function headersToMap(headers: HeaderItem[] = []): Record<string, string> {
  const res: Record<string, string> = {};
  for (const h of headers) {
    if (h.enabled && h.key && h.key.trim()) {
      res[h.key.trim()] = h.value;
    }
  }
  return res;
}

function paramsToMap(params: ParamItem[] = []): Record<string, string> {
  const res: Record<string, string> = {};
  for (const p of params) {
    if (p.enabled && p.key && p.key.trim()) {
      res[p.key.trim()] = p.value;
    }
  }
  return res;
}

export const collectionService = {
  async getCollections(): Promise<Collection[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/collections");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        const formatted = list.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          description: c.description || "",
          workspaceId: c.workspaceId,
          requests: (c.requests || []).map((r: any) => ({
            id: r._id || r.id,
            name: r.name,
            collectionId: c._id || c.id,
            method: r.method || "GET",
            url: r.url || "",
            headers: Array.isArray(r.headers) ? r.headers : [],
            queryParams: Array.isArray(r.queryParams) ? r.queryParams : [],
            bodyType: r.bodyType || r.body?.mode || "none",
            body: r.body || (typeof r.body === "object" ? r.body?.rawContent : "") || "",
            testsScript: r.testsScript || r.testScript || "",
            preRequestScript: r.preRequestScript || "",
            auth: r.auth || { type: "none" },
          })),
          folders: c.folders || [],
        }));
        localStorage.setItem("postman_collections", JSON.stringify(formatted));
        return formatted;
      }
    } catch {
      console.warn("Backend collections unreachable, reading from localStorage/cache");
    }

    const saved = localStorage.getItem("postman_collections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  },

  async createCollection(name: string, description = ""): Promise<Collection> {
    const newCol: Collection = {
      id: "col-" + Date.now(),
      name,
      description,
      requests: [],
      folders: [],
    };

    try {
      const res = await apiClient.post("/collections", { name, description });
      const created = res.data?.data || res.data;
      if (created?._id || created?.id) {
        newCol.id = created._id || created.id;
      }
    } catch {
      // Local fallback
    }

    return newCol;
  },

  async updateCollection(id: string, name: string, description = ""): Promise<void> {
    try {
      await apiClient.patch(`/collections/${id}`, { name, description });
    } catch {
      // ignore
    }
  },

  async deleteCollection(id: string): Promise<void> {
    try {
      await apiClient.delete(`/collections/${id}`);
    } catch {
      // Local fallback
    }
  },

  async createRequest(colId: string, req: Partial<RequestItem>): Promise<RequestItem> {
    const requestPayload = {
      collectionId: colId,
      name: req.name || "New Request",
      method: req.method || "GET",
      url: req.url || "https://jsonplaceholder.typicode.com/users",
      headers: headersToMap(req.headers),
      queryParams: paramsToMap(req.queryParams),
      body: {
        mode: req.bodyType || "none",
        rawContent: req.body || "",
      },
      testScript: req.testsScript || "",
      preRequestScript: req.preRequestScript || "",
    };

    const newReq: RequestItem = {
      id: "req-" + Date.now(),
      name: req.name || "New Request",
      collectionId: colId,
      method: req.method || "GET",
      url: req.url || "https://jsonplaceholder.typicode.com/users",
      headers: req.headers || [{ id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" }],
      queryParams: req.queryParams || [],
      bodyType: req.bodyType || "none",
      body: req.body || "",
      auth: req.auth || { type: "none" },
      testsScript: req.testsScript || "",
      preRequestScript: req.preRequestScript || "",
    };

    try {
      const res = await apiClient.post("/requests", requestPayload);
      const created = res.data?.data || res.data;
      if (created?._id || created?.id) {
        newReq.id = created._id || created.id;
      }
    } catch {
      // Local fallback
    }

    return newReq;
  },

  async updateRequest(requestId: string, req: Partial<RequestItem>): Promise<void> {
    try {
      await apiClient.patch(`/requests/${requestId}`, {
        name: req.name,
        method: req.method,
        url: req.url,
        headers: headersToMap(req.headers),
        queryParams: paramsToMap(req.queryParams),
        body: {
          mode: req.bodyType || "none",
          rawContent: req.body || "",
        },
        testScript: req.testsScript,
        preRequestScript: req.preRequestScript,
      });
    } catch {
      // Local fallback
    }
  },

  async deleteRequest(requestId: string): Promise<void> {
    try {
      await apiClient.delete(`/requests/${requestId}`);
    } catch {
      // Local fallback
    }
  },
};
