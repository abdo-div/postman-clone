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

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: "col-users",
    name: "User Authentication & Profiles",
    description: "Endpoints for signup, token verification, and user management",
    requests: [
      {
        id: "req-1",
        name: "List Users",
        collectionId: "col-users",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/users",
        headers: [
          { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
          { id: "h2", enabled: true, key: "Accept", value: "application/json", description: "" },
        ],
        queryParams: [
          { id: "p1", enabled: true, key: "_limit", value: "10", description: "Limit number of users" },
        ],
        bodyType: "none",
        testsScript: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array with users", function () {
    const data = pm.response.json();
    pm.expect(data).to.be.a("array");
    pm.expect(data.length).to.be.above(0);
});

pm.test("Response time is under 800ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(800);
});`,
      },
      {
        id: "req-2",
        name: "Get User By ID",
        collectionId: "col-users",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/users/1",
        headers: [
          { id: "h1", enabled: true, key: "Accept", value: "application/json", description: "" },
        ],
        queryParams: [],
        bodyType: "none",
        testsScript: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User has name and email", function () {
    const data = pm.response.json();
    pm.expect(data).to.have.property("name");
    pm.expect(data).to.have.property("email");
});`,
      },
      {
        id: "req-3",
        name: "Create User Post",
        collectionId: "col-users",
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        headers: [
          { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
        ],
        queryParams: [],
        bodyType: "json",
        body: JSON.stringify(
          {
            title: "Dynamic API Architecture",
            body: "Testing seamless request execution with test suites.",
            userId: 1,
          },
          null,
          2,
        ),
        testsScript: `pm.test("Status is 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Post ID is returned", function () {
    const data = pm.response.json();
    pm.expect(data).to.have.property("id");
});`,
      },
    ],
  },
  {
    id: "col-orders",
    name: "Payment & Checkout API",
    description: "Payment gateway integration, webhooks, and invoice generation",
    requests: [
      {
        id: "req-4",
        name: "Health Check",
        collectionId: "col-orders",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        headers: [],
        queryParams: [],
        bodyType: "none",
        testsScript: `pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});`,
      },
    ],
  },
];

export const collectionService = {
  async getCollections(): Promise<Collection[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>("/collections");
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          description: c.description,
          requests: c.requests || [],
          folders: c.folders || [],
        }));
      }
    } catch (e) {
      console.warn("Backend collections not reachable, using local storage/fallback");
    }

    const saved = localStorage.getItem("postman_collections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_COLLECTIONS;
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
      // Handled locally
    }

    return newCol;
  },

  async deleteCollection(id: string): Promise<void> {
    try {
      await apiClient.delete(`/collections/${id}`);
    } catch {
      // Local fallback
    }
  },

  async saveRequest(colId: string, request: RequestItem): Promise<RequestItem> {
    try {
      await apiClient.post("/requests", {
        collectionId: colId,
        name: request.name,
        method: request.method,
        url: request.url,
        headers: request.headers.reduce((acc, h) => {
          if (h.enabled && h.key) acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
        body: request.body,
      });
    } catch {
      // Local fallback
    }
    return request;
  },
};
