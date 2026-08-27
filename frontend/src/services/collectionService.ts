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

export interface FormDataItem {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  type: "text" | "file";
  description?: string;
  fileName?: string;
  file?: File | null;
  fileId?: string; // track same file across renders during a session
}

export type OAuth2GrantType = "authorization_code" | "client_credentials" | "password";

export interface OAuth2Config {
  grantType: OAuth2GrantType;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  username: string;
  password: string;
  redirectUri: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  acquiredAt: number;
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
  formData?: FormDataItem[];
  auth?: {
    type: "none" | "bearer" | "basic" | "api-key" | "oauth2";
    token?: string;
    username?: string;
    password?: string;
    apiKey?: { key: string; value: string; addTo: "header" | "query" };
    oauth2?: OAuth2Config;
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
      const res = await apiClient.get<{ success: boolean; data: Array<Record<string, unknown>> }>("/collections");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        const formatted = list.map((c) => ({
          id: (c._id || c.id) as string,
          name: c.name as string,
          description: (c.description || "") as string,
          workspaceId: c.workspaceId as string | undefined,
          requests: ((c.requests as Array<Record<string, unknown>> || [])).map((r) => ({
            id: (r._id || r.id) as string,
            name: r.name as string,
            collectionId: (c._id || c.id) as string,
            method: (r.method || "GET") as RequestItem["method"],
            url: (r.url || "") as string,
            headers: Array.isArray(r.headers) ? r.headers as HeaderItem[] : [],
            queryParams: Array.isArray(r.queryParams) ? r.queryParams as ParamItem[] : [],
            bodyType: (r.bodyType || (r.body as Record<string, unknown>)?.mode || "none") as RequestItem["bodyType"],
            body: (typeof r.body === "string" ? r.body : (r.body as Record<string, unknown>)?.rawContent || "") as string,
            formData: Array.isArray(r.formData)
              ? (r.formData as FormDataItem[]).map((f) => ({ ...f, file: undefined, fileId: undefined }))
              : Array.isArray((r.body as Record<string, unknown>)?.formData)
                ? ((r.body as Record<string, unknown>).formData as FormDataItem[]).map((f) => ({ ...f, file: undefined, fileId: undefined }))
                : [],
            testsScript: ((r as Record<string, unknown>).testsScript || (r as Record<string, unknown>).testScript || "") as string,
            preRequestScript: (r.preRequestScript || "") as string,
            auth: (r.auth || { type: "none" }) as RequestItem["auth"],
          })),
          folders: (Array.isArray(c.folders) ? c.folders : []) as CollectionFolder[],
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
      formData: (req.formData || []).map(({ id, enabled, key, value, type, description, fileName }) => ({
        id: id || "fd-" + Date.now(),
        enabled,
        key,
        value,
        type,
        description: description || "",
        fileName: fileName || "",
      })),
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
      formData: req.formData || [],
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
        formData: (req.formData || []).map(({ id, enabled, key, value, type, description, fileName }) => ({
          id: id || "fd-" + Date.now(),
          enabled,
          key,
          value,
          type,
          description: description || "",
          fileName: fileName || "",
        })),
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
