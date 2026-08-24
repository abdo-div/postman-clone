import { create } from "zustand";
import { collectionService, type Collection, type RequestItem } from "../services/collectionService";

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  activeRequestId: string | null;
  loadCollections: () => Promise<void>;
  addCollection: (name: string, description?: string) => Promise<Collection>;
  updateCollection: (id: string, name: string, description?: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addRequest: (collectionId: string, request?: Partial<RequestItem>) => Promise<RequestItem>;
  updateRequest: (collectionId: string, request: RequestItem) => Promise<void>;
  duplicateRequest: (collectionId: string, requestId: string) => Promise<RequestItem | null>;
  deleteRequest: (collectionId: string, requestId: string) => Promise<void>;
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

  updateCollection: async (id: string, name: string, description = "") => {
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? { ...c, name, description } : c)),
    }));
    await collectionService.updateCollection(id, name, description);
    get().saveCollectionsLocally();
  },

  deleteCollection: async (id: string) => {
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
    await collectionService.deleteCollection(id);
    get().saveCollectionsLocally();
  },

  addRequest: async (collectionId: string, partial: Partial<RequestItem> = {}) => {
    const newReq = await collectionService.createRequest(collectionId, partial);

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

  updateRequest: async (collectionId: string, request: RequestItem) => {
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
    await collectionService.updateRequest(request.id, request);
    get().saveCollectionsLocally();
  },

  duplicateRequest: async (collectionId: string, requestId: string) => {
    const orig = get().getRequestById(requestId);
    if (!orig) return null;

    const clonedPartial: Partial<RequestItem> = {
      name: `${orig.name} (Copy)`,
      method: orig.method,
      url: orig.url,
      headers: orig.headers ? [...orig.headers.map((h) => ({ ...h, id: "h-" + Math.random().toString(36).substring(2, 6) }))] : [],
      queryParams: orig.queryParams ? [...orig.queryParams.map((p) => ({ ...p, id: "p-" + Math.random().toString(36).substring(2, 6) }))] : [],
      bodyType: orig.bodyType,
      body: orig.body,
      auth: orig.auth ? { ...orig.auth } : { type: "none" },
      testsScript: orig.testsScript,
      preRequestScript: orig.preRequestScript,
    };

    return await get().addRequest(collectionId, clonedPartial);
  },

  deleteRequest: async (collectionId: string, requestId: string) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: (c.requests || []).filter((r) => r.id !== requestId) }
          : c,
      ),
      activeRequestId: state.activeRequestId === requestId ? null : state.activeRequestId,
    }));
    await collectionService.deleteRequest(requestId);
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
