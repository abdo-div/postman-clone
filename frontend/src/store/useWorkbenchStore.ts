import { create } from "zustand";
import type { HeaderItem, ParamItem, RequestItem, FormDataItem, OAuth2Config } from "../services/collectionService";
import type { TestAssertionResult } from "../services/executorService";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export type BodyType = "none" | "json" | "raw" | "form-data";
export type AuthType = "none" | "bearer" | "basic" | "api-key" | "oauth2";
export type RequestTab = "Params" | "Headers" | "Body" | "Auth" | "Pre-request Script" | "Tests";
export type ResponseTab = "Body" | "Headers" | "Test Results";
export type ResponseBodyView = "Pretty" | "Raw" | "Preview";

export interface ExecutionResponse {
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: string | Record<string, unknown>;
  dataText: string;
  testResults: TestAssertionResult[];
  updatedEnvVars?: Record<string, string>;
}

interface WorkbenchState {
  // Request state
  method: HttpMethod;
  url: string;
  params: ParamItem[];
  headers: HeaderItem[];
  bodyType: BodyType;
  body: string;
  formData: FormDataItem[];
  authType: AuthType;
  bearerToken: string;
  basicAuth: { username: string; password: string };
  apiKey: { key: string; value: string; addTo: "header" | "query" };
  oauth2: OAuth2Config;
  testsScript: string;
  preRequestScript: string;

  // Request name / linked collection
  requestName: string;
  linkedCollectionId: string | null;
  linkedRequestId: string | null;

  // Response state
  isSending: boolean;
  response: ExecutionResponse | null;
  error: string | null;

  // UI state
  activeRequestTab: RequestTab;
  activeResponseTab: ResponseTab;
  responseBodyView: ResponseBodyView;
  hasUnsavedChanges: boolean;

  // Actions - request
  setMethod: (m: HttpMethod) => void;
  setUrl: (url: string) => void;
  setRequestName: (name: string) => void;
  setLinkedCollectionId: (id: string | null) => void;
  setLinkedRequestId: (id: string | null) => void;
  setParam: (id: string, field: keyof ParamItem, val: string | boolean) => void;
  addParam: () => void;
  deleteParam: (id: string) => void;
  setHeader: (id: string, field: keyof HeaderItem, val: string | boolean) => void;
  addHeader: () => void;
  deleteHeader: (id: string) => void;
  setBodyType: (bt: BodyType) => void;
  setBody: (b: string) => void;
  setFormData: (id: string, field: keyof FormDataItem, val: string | boolean | File | null) => void;
  addFormData: () => void;
  deleteFormData: (id: string) => void;
  resetFormData: (items?: FormDataItem[]) => void;
  setAuthType: (a: AuthType) => void;
  setBearerToken: (t: string) => void;
  setBasicAuth: (field: "username" | "password", val: string) => void;
  setApiKey: (field: "key" | "value" | "addTo", val: string) => void;
  setOAuth2: (field: keyof OAuth2Config, val: string | number | OAuth2Config["grantType"]) => void;
  setOAuth2Config: (config: OAuth2Config) => void;
  setTestsScript: (s: string) => void;
  setPreRequestScript: (s: string) => void;
  setActiveRequestTab: (t: RequestTab) => void;

  // Actions - response
  setActiveResponseTab: (t: ResponseTab) => void;
  setResponseBodyView: (v: ResponseBodyView) => void;
  setIsSending: (v: boolean) => void;
  setResponse: (r: ExecutionResponse | null) => void;
  setError: (e: string | null) => void;

  // Load a request into the workbench
  loadRequest: (req: {
    id?: string;
    name?: string;
    collectionId?: string;
    method: HttpMethod;
    url: string;
    headers?: HeaderItem[];
    queryParams?: ParamItem[];
    bodyType?: BodyType;
    body?: string;
    formData?: FormDataItem[];
    auth?: RequestItem["auth"];
    testsScript?: string;
    preRequestScript?: string;
  }) => void;

  // Get effective headers (including auth header)
  getEffectiveHeaders: () => Record<string, string>;
  // Get effective params as object
  getEffectiveParams: () => Record<string, string>;

  // Mark changes
  setHasUnsavedChanges: (v: boolean) => void;
  clearResponse: () => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  method: "GET",
  url: "",
  params: [
    { id: "p1", enabled: true, key: "", value: "", description: "" },
  ],
  headers: [
    { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
    { id: "h2", enabled: true, key: "Accept", value: "application/json", description: "" },
  ],
  bodyType: "none",
  body: "",
  formData: [],
  authType: "none",
  bearerToken: "",
  basicAuth: { username: "", password: "" },
  apiKey: { key: "", value: "", addTo: "header" },
  oauth2: {
    grantType: "authorization_code",
    authUrl: "",
    tokenUrl: "",
    clientId: "",
    clientSecret: "",
    scope: "",
    username: "",
    password: "",
    redirectUri: "",
    accessToken: "",
    refreshToken: "",
    tokenType: "Bearer",
    expiresIn: 0,
    acquiredAt: 0,
  },
  testsScript: "",
  preRequestScript: "",
  requestName: "New Request",
  linkedCollectionId: null,
  linkedRequestId: null,
  isSending: false,
  response: null,
  error: null,
  activeRequestTab: "Params",
  activeResponseTab: "Body",
  responseBodyView: "Pretty",
  hasUnsavedChanges: false,

  setMethod: (m) => set({ method: m, hasUnsavedChanges: true }),
  setUrl: (url) => set({ url, hasUnsavedChanges: true }),
  setRequestName: (name) => set({ requestName: name, hasUnsavedChanges: true }),
  setLinkedCollectionId: (id) => set({ linkedCollectionId: id }),
  setLinkedRequestId: (id) => set({ linkedRequestId: id }),

  setParam: (id, field, val) =>
    set((s) => ({
      params: s.params.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
      hasUnsavedChanges: true,
    })),
  addParam: () =>
    set((s) => ({
      params: [
        ...s.params,
        { id: "p-" + Date.now(), enabled: true, key: "", value: "", description: "" },
      ],
    })),
  deleteParam: (id) => set((s) => ({ params: s.params.filter((p) => p.id !== id) })),

  setHeader: (id, field, val) =>
    set((s) => ({
      headers: s.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
      hasUnsavedChanges: true,
    })),
  addHeader: () =>
    set((s) => ({
      headers: [
        ...s.headers,
        { id: "h-" + Date.now(), enabled: true, key: "", value: "", description: "" },
      ],
    })),
  deleteHeader: (id) => set((s) => ({ headers: s.headers.filter((h) => h.id !== id) })),

  setBodyType: (bt) => set({ bodyType: bt, hasUnsavedChanges: true }),
  setBody: (b) => set({ body: b, hasUnsavedChanges: true }),
  setFormData: (id, field, val) =>
    set((s) => ({
      formData: s.formData.map((f) =>
        f.id === id
          ? {
              ...f,
              [field]: val,
              ...(field === "file" && val instanceof File
                ? { fileName: (val as File).name }
                : {}),
            }
          : f,
      ),
      hasUnsavedChanges: true,
    })),
  addFormData: () =>
    set((s) => ({
      formData: [
        ...s.formData,
        {
          id: "fd-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
          enabled: true,
          key: "",
          value: "",
          type: "text",
          description: "",
          fileName: "",
        },
      ],
    })),
  deleteFormData: (id) => set((s) => ({ formData: s.formData.filter((f) => f.id !== id) })),
  resetFormData: (items = []) => set({ formData: items }),
  setAuthType: (a) => set({ authType: a, hasUnsavedChanges: true }),
  setBearerToken: (t) => set({ bearerToken: t, hasUnsavedChanges: true }),
  setBasicAuth: (field, val) =>
    set((s) => ({
      basicAuth: { ...s.basicAuth, [field]: val },
      hasUnsavedChanges: true,
    })),
  setApiKey: (field, val) =>
    set((s) => ({
      apiKey: { ...s.apiKey, [field]: field === "addTo" ? (val === "query" ? "query" : "header") : val },
      hasUnsavedChanges: true,
    })),
  setOAuth2: (field, val) =>
    set((s) => ({
      oauth2: { ...s.oauth2, [field]: val },
      hasUnsavedChanges: true,
    })),
  setOAuth2Config: (config) => set({ oauth2: config, hasUnsavedChanges: true }),
  setTestsScript: (s) => set({ testsScript: s, hasUnsavedChanges: true }),
  setPreRequestScript: (s) => set({ preRequestScript: s, hasUnsavedChanges: true }),
  setActiveRequestTab: (t) => set({ activeRequestTab: t }),
  setActiveResponseTab: (t) => set({ activeResponseTab: t }),
  setResponseBodyView: (v) => set({ responseBodyView: v }),
  setIsSending: (v) => set({ isSending: v }),
  setResponse: (r) => set({ response: r, error: null }),
  setError: (e) => set({ error: e }),
  setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
  clearResponse: () => set({ response: null, error: null }),

  loadRequest: (req) => {
    const headers: HeaderItem[] =
      req.headers && req.headers.length > 0
        ? req.headers
        : [
            { id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" },
            { id: "h2", enabled: true, key: "Accept", value: "application/json", description: "" },
          ];

    const params: ParamItem[] =
      req.queryParams && req.queryParams.length > 0
        ? req.queryParams
        : [{ id: "p1", enabled: true, key: "", value: "", description: "" }];

    set({
      method: req.method || "GET",
      url: req.url || "",
      headers,
      params,
      bodyType: req.bodyType || "none",
      body: req.body || "",
      formData: req.formData ? req.formData.map((f) => ({ ...f, file: undefined, fileId: f.id })) : [],
      authType: (req.auth?.type || "none") as AuthType,
      bearerToken: req.auth?.token || "",
      basicAuth: {
        username: req.auth?.username || "",
        password: req.auth?.password || "",
      },
      apiKey: req.auth?.apiKey || { key: "", value: "", addTo: "header" },
      oauth2: req.auth?.oauth2 || {
        grantType: "authorization_code",
        authUrl: "",
        tokenUrl: "",
        clientId: "",
        clientSecret: "",
        scope: "",
        username: "",
        password: "",
        redirectUri: "",
        accessToken: "",
        refreshToken: "",
        tokenType: "Bearer",
        expiresIn: 0,
        acquiredAt: 0,
      },
      testsScript: req.testsScript || "",
      preRequestScript: req.preRequestScript || "",
      requestName: req.name || "Request",
      linkedCollectionId: req.collectionId || null,
      linkedRequestId: req.id || null,
      response: null,
      error: null,
      hasUnsavedChanges: false,
      activeRequestTab: "Params",
      activeResponseTab: "Body",
    });
  },

  getEffectiveHeaders: () => {
    const { headers, authType, bearerToken, basicAuth, apiKey, oauth2 } = get();
    const result: Record<string, string> = {};
    for (const h of headers) {
      if (h.enabled && h.key.trim()) {
        result[h.key.trim()] = h.value;
      }
    }
    if (authType === "bearer" && bearerToken) {
      result["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "basic" && basicAuth.username) {
      const encoded = btoa(`${basicAuth.username}:${basicAuth.password}`);
      result["Authorization"] = `Basic ${encoded}`;
    } else if (authType === "api-key" && apiKey.key && apiKey.addTo === "header" && apiKey.value) {
      result[apiKey.key.trim()] = apiKey.value;
    } else if (authType === "oauth2" && oauth2.accessToken) {
      result["Authorization"] = `${oauth2.tokenType || "Bearer"} ${oauth2.accessToken}`;
    }
    return result;
  },

  getEffectiveParams: () => {
    const { params, authType, apiKey } = get();
    const result: Record<string, string> = {};
    for (const p of params) {
      if (p.enabled && p.key.trim()) {
        result[p.key.trim()] = p.value;
      }
    }
    if (authType === "api-key" && apiKey.key && apiKey.addTo === "query" && apiKey.value) {
      result[apiKey.key.trim()] = apiKey.value;
    }
    return result;
  },
}));
