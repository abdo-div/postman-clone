import { create } from "zustand";
import { collectionService, type Collection, type RequestItem } from "../services/collectionService";

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  activeRequestId: string | null;
  loadCollections: () => Promise<void>;
  addCollection: (name: string, description?: string) => Promise<Collection>;
  deleteCollection: (id: string) => void;
  addRequest: (collectionId: string, request?: Partial<RequestItem>) => RequestItem;
  updateRequest: (collectionId: string, request: RequestItem) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
  setActiveRequestId: (id: string | null) => void;
  getActiveRequest: () => RequestItem | null;
  getRequestById: (id: string) => RequestItem | null;
  saveCollectionsLocally: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  isLoading: false,
  activeRequestId: null,

  loadCollections: async () => {
    set({ isLoading: true });
    const colls = await collectionService.getCollections();
    set({ collections: colls, isLoading: false });
  },

  addCollection: async (name: string, description = "") => {
    const newCol = await collectionService.createCollection(name, description);
    set((state) => ({ collections: [...state.collections, newCol] }));
    get().saveCollectionsLocally();
    return newCol;
  },

  deleteCollection: (id: string) => {
    collectionService.deleteCollection(id);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      activeRequestId:
        state.activeRequestId &&
        state.collections
          .find((c) => c.id === id)
          ?.requests?.some((r) => r.id === state.activeRequestId)
          ? null
          : state.activeRequestId,
    }));
    get().saveCollectionsLocally();
  },

  addRequest: (collectionId: string, partial: Partial<RequestItem> = {}) => {
    const newReq: RequestItem = {
      id: "req-" + Date.now(),
      name: partial.name || "New Request",
      collectionId,
      method: partial.method || "GET",
      url: partial.url || "",
      headers: partial.headers || [
        { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
      ],
      queryParams: partial.queryParams || [],
      bodyType: partial.bodyType || "none",
      body: partial.body || "",
      auth: partial.auth || { type: "none" },
      testsScript: partial.testsScript || "",
      preRequestScript: partial.preRequestScript || "",
      ...partial,
    };

    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: [...(c.requests || []), newReq] }
          : c,
      ),
      activeRequestId: newReq.id,
    }));
    get().saveCollectionsLocally();
    return newReq;
  },

  updateRequest: (collectionId: string, request: RequestItem) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: (c.requests || []).map((r) =>
                r.id === request.id ? request : r,
              ),
            }
          : c,
      ),
    }));
    get().saveCollectionsLocally();
  },

  deleteRequest: (collectionId: string, requestId: string) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: (c.requests || []).filter((r) => r.id !== requestId) }
          : c,
      ),
      activeRequestId: state.activeRequestId === requestId ? null : state.activeRequestId,
    }));
    get().saveCollectionsLocally();
  },

  setActiveRequestId: (id: string | null) => set({ activeRequestId: id }),

  getActiveRequest: (): RequestItem | null => {
    const { collections, activeRequestId } = get();
    if (!activeRequestId) return null;
    for (const col of collections) {
      const req = (col.requests || []).find((r) => r.id === activeRequestId);
      if (req) return req;
    }
    return null;
  },

  getRequestById: (id: string): RequestItem | null => {
    const { collections } = get();
    for (const col of collections) {
      const req = (col.requests || []).find((r) => r.id === id);
      if (req) return req;
    }
    return null;
  },

  saveCollectionsLocally: () => {
    const { collections } = get();
    localStorage.setItem("postman_collections", JSON.stringify(collections));
  },
}));
