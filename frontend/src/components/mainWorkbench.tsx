import React, { useEffect, useState, useMemo } from "react";
import { useWorkbenchStore, type HttpMethod } from "../store/useWorkbenchStore";
import { useCollectionStore } from "../store/useCollectionStore";
import { useEnvironmentStore } from "../store/useEnvironmentStore";

import { useHistoryStore } from "../store/useHistoryStore";
import { useToastStore } from "../store/useToastStore";
import { useAuthStore } from "../store/useAuthStore";
import { executorService, executeTestScript, interpolateVariables } from "../services/executorService";
import type { View } from "../App";

interface MainWorkbenchProps {
  onNavigate?: (view: View) => void;
  onImport?: () => void;
  onLogout?: () => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20",
  POST: "text-violet-400 bg-violet-400/10 border-violet-500/20",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-500/20",
  PATCH: "text-orange-400 bg-orange-400/10 border-orange-500/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-500/20",
  OPTIONS: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
  HEAD: "text-pink-400 bg-pink-400/10 border-pink-500/20",
};

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

interface EngineSettings {
  timeoutMs: number;
  followRedirects: boolean;
  validateSsl: boolean;
}

const DEFAULT_ENGINE_SETTINGS: EngineSettings = { timeoutMs: 15000, followRedirects: true, validateSsl: true };

function readEngineSettings(): EngineSettings {
  try {
    return { ...DEFAULT_ENGINE_SETTINGS, ...JSON.parse(localStorage.getItem("workbench_settings") || "{}") };
  } catch {
    return DEFAULT_ENGINE_SETTINGS;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-400";
  if (status >= 400 && status < 500) return "text-red-400";
  if (status >= 500) return "text-red-500";
  return "text-slate-400";
}

export const MainWorkbench: React.FC<MainWorkbenchProps> = ({
  onNavigate,
  onImport,
  onLogout,
}) => {
  const wb = useWorkbenchStore();
  const {
    collections,
    loadCollections,
    activeRequestId,
    setActiveRequestId,
    addCollection,
    updateCollection,
    deleteCollection,
    addRequest,
    updateRequest,
    duplicateRequest,
    deleteRequest,
  } = useCollectionStore();

  const {
    getVariablesMap,
    interpolate,
    getActiveEnvironment,
    environments,
    setActiveEnvironmentId,
    activeEnvironmentId,
  } = useEnvironmentStore();

  const { addItem: addHistory } = useHistoryStore();
  const { addToast } = useToastStore();
  const { user, logout } = useAuthStore();

  const [sidebarTab, setSidebarTab] = useState<"Collections" | "Environments" | "History">("Collections");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [showMethodMenu, setShowMethodMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [responseBodyView, setResponseBodyView] = useState<"Pretty" | "Raw" | "Headers" | "Preview">("Pretty");
  const [historyItems, setHistoryItems] = useState(useHistoryStore.getState().items);

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalReqName, setSaveModalReqName] = useState("");
  const [saveModalColId, setSaveModalColId] = useState("");
  const [showCodeSnippetModal, setShowCodeSnippetModal] = useState(false);
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<"curl" | "fetch" | "axios" | "python" | "go">("curl");
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [engineSettings, setEngineSettings] = useState<EngineSettings>(readEngineSettings);

  // Context menus
  const [collectionMenuId, setCollectionMenuId] = useState<string | null>(null);
  const [requestMenuId, setRequestMenuId] = useState<string | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState("");

  useEffect(() => {
    loadCollections();
    useEnvironmentStore.getState().loadEnvironments();
    useHistoryStore.getState().load().then(() => {
      setHistoryItems(useHistoryStore.getState().items);
    });
  }, []);

  // Expand first collection and auto-select its first request once loaded
  useEffect(() => {
    if (collections.length === 0) return;
    const firstId = collections[0].id;
    setExpandedCollections((prev) => (prev.has(firstId) ? prev : new Set(prev).add(firstId)));

    if (!activeRequestId) {
      const firstRequest = collections[0].requests?.[0];
      if (firstRequest) {
        setActiveRequestId(firstRequest.id);
        wb.loadRequest(firstRequest);
      }
    }
  }, [collections]);

  // Keyboard shortcut listener (Ctrl+Enter = Send, Ctrl+S = Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleQuickSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wb, collections, activeRequestId]);

  const handleSelectRequest = (req: any) => {
    setActiveRequestId(req.id);
    wb.loadRequest(req);
  };

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const executePreRequestScript = (script: string, envVars: Record<string, string>) => {
    if (!script || !script.trim()) return envVars;
    const modifiedEnv = { ...envVars };
    try {
      const pm = {
        environment: {
          get: (k: string) => modifiedEnv[k],
          set: (k: string, v: any) => { modifiedEnv[k] = String(v); },
          has: (k: string) => k in modifiedEnv,
          unset: (k: string) => { delete modifiedEnv[k]; },
        },
        variables: {
          get: (k: string) => modifiedEnv[k],
          set: (k: string, v: any) => { modifiedEnv[k] = String(v); },
        },
      };
      const fn = new Function("pm", script);
      fn(pm);
    } catch (e: any) {
      addToast({ type: "warning", title: "Pre-request script error", description: e.message });
    }
    return modifiedEnv;
  };

  const buildFinalUrl = (url: string, params: any[], envVars: Record<string, string>) => {
    const enabledParams = params.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length === 0) return url;
    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(interpolateVariables(p.value, envVars))}`)
      .join("&");
    return url.includes("?") ? `${url}&${queryString}` : `${url}?${queryString}`;
  };

  const handleSend = async () => {
    if (!wb.url.trim()) {
      addToast({ type: "warning", title: "URL required", description: "Please enter a request URL" });
      return;
    }

    let envVars = getVariablesMap();

    // Execute pre-request script
    if (wb.preRequestScript.trim()) {
      envVars = executePreRequestScript(wb.preRequestScript, envVars);
    }

    const interpolatedUrl = buildFinalUrl(interpolate(wb.url), wb.params, envVars);
    const effectiveHeaders = wb.getEffectiveHeaders();

    const interpolatedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(effectiveHeaders)) {
      interpolatedHeaders[k] = interpolate(v);
    }

    wb.setIsSending(true);
    wb.clearResponse();

    try {
      let bodyToSend: any = undefined;
      if (wb.bodyType !== "none" && wb.body.trim() && wb.method !== "GET" && wb.method !== "HEAD") {
        try {
          bodyToSend = JSON.parse(interpolate(wb.body));
        } catch {
          bodyToSend = interpolate(wb.body);
        }
      }

      const result = await executorService.execute({
        url: interpolatedUrl,
        method: wb.method,
        headers: interpolatedHeaders,
        body: bodyToSend,
        environmentVariables: envVars,
        timeoutMs: engineSettings.timeoutMs,
      });

      // Run post-response test assertions
      let testResults: any[] = [];
      let updatedEnvVars: Record<string, string> = {};
      if (wb.testsScript.trim()) {
        const testRes = executeTestScript(
          wb.testsScript,
          {
            status: result.status,
            statusText: result.statusText,
            headers: result.headers,
            data: result.data,
            responseTime: result.metrics?.durationMs,
          },
          envVars,
        );
        testResults = testRes.results || [];
        updatedEnvVars = testRes.environmentVariables || {};
      }

      const dataText = typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2);

      wb.setResponse({
        status: result.status,
        statusText: result.statusText,
        durationMs: result.metrics?.durationMs || 0,
        sizeBytes: result.metrics?.sizeBytes || 0,
        headers: result.headers || {},
        data: result.data,
        dataText,
        testResults,
        updatedEnvVars,
      });

      // Log to history and save in MongoDB
      await addHistory({
        requestId: wb.linkedRequestId || undefined,
        method: wb.method,
        url: interpolatedUrl,
        status: result.status,
        statusText: result.statusText,
        durationMs: result.metrics?.durationMs || 0,
        sizeBytes: result.metrics?.sizeBytes || 0,
        requestHeaders: interpolatedHeaders,
        requestBody: bodyToSend,
        responseBody: result.data,
        responseHeaders: result.headers,
        testResults,
      });

      setHistoryItems(useHistoryStore.getState().items);

      const passedTests = testResults.filter((r: any) => r.passed).length;
      const failedTests = testResults.filter((r: any) => !r.passed).length;

      if (result.status >= 400) {
        addToast({
          type: "error",
          title: `${result.status} ${result.statusText}`,
          description: `${result.metrics?.durationMs}ms`,
          duration: 3000,
        });
      } else {
        addToast({
          type: "success",
          title: `${result.status} ${result.statusText}`,
          description: `${result.metrics?.durationMs}ms · ${formatBytes(result.metrics?.sizeBytes || 0)}${testResults.length ? ` · ${passedTests}/${testResults.length} tests passed` : ""}`,
          duration: 3000,
        });
      }

      if (failedTests > 0) {
        addToast({ type: "warning", title: `${failedTests} test(s) failed`, duration: 4000 });
      }
    } catch (err: any) {
      wb.setError(err.message || "Request failed");
      addToast({ type: "error", title: "Request Failed", description: err.message, duration: 5000 });
    } finally {
      wb.setIsSending(false);
    }
  };

  const handleQuickSave = async () => {
    if (wb.linkedCollectionId && wb.linkedRequestId) {
      await updateRequest(wb.linkedCollectionId, {
        id: wb.linkedRequestId,
        name: wb.requestName,
        collectionId: wb.linkedCollectionId,
        method: wb.method,
        url: wb.url,
        headers: wb.headers,
        queryParams: wb.params,
        bodyType: wb.bodyType,
        body: wb.body,
        auth: {
          type: wb.authType,
          token: wb.bearerToken,
          username: wb.basicAuth.username,
          password: wb.basicAuth.password,
        },
        testsScript: wb.testsScript,
        preRequestScript: wb.preRequestScript,
      });
      wb.setHasUnsavedChanges(false);
      addToast({ type: "success", title: "Request saved", description: `Updated ${wb.requestName}` });
    } else {
      setSaveModalReqName(wb.requestName || "New Request");
      setSaveModalColId(collections[0]?.id || "");
      setShowSaveModal(true);
    }
  };

  const handleSaveAsConfirm = async () => {
    if (!saveModalReqName.trim() || !saveModalColId) {
      addToast({ type: "warning", title: "Validation error", description: "Provide request name and select a collection" });
      return;
    }

    const created = await addRequest(saveModalColId, {
      name: saveModalReqName.trim(),
      collectionId: saveModalColId,
      method: wb.method,
      url: wb.url,
      headers: wb.headers,
      queryParams: wb.params,
      bodyType: wb.bodyType,
      body: wb.body,
      auth: {
        type: wb.authType,
        token: wb.bearerToken,
        username: wb.basicAuth.username,
        password: wb.basicAuth.password,
      },
      testsScript: wb.testsScript,
      preRequestScript: wb.preRequestScript,
    });

    wb.setRequestName(created.name);
    wb.setLinkedCollectionId(saveModalColId);
    wb.setLinkedRequestId(created.id);
    wb.setHasUnsavedChanges(false);
    setShowSaveModal(false);
    setExpandedCollections((prev) => new Set([...prev, saveModalColId]));
    addToast({ type: "success", title: "Request saved to collection", description: created.name });
  };

  const handleAddNewRequestToCol = async (colId: string) => {
    const created = await addRequest(colId, {
      name: "New Request",
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts",
      headers: [{ id: "h1", enabled: true, key: "Content-Type", value: "application/json", description: "" }],
      queryParams: [],
      bodyType: "none",
      body: "",
      testsScript: `pm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});`,
    });
    setExpandedCollections((prev) => new Set([...prev, colId]));
    handleSelectRequest(created);
    addToast({ type: "success", title: "Request added", description: created.name });
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    const col = await addCollection(newCollectionName.trim());
    setNewCollectionName("");
    setShowNewCollection(false);
    setExpandedCollections((prev) => new Set([...prev, col.id]));
    addToast({ type: "success", title: "Collection created", description: col.name });
  };

  const handleRenameCollectionConfirm = async (colId: string) => {
    if (editingColName.trim()) {
      await updateCollection(colId, editingColName.trim());
      addToast({ type: "success", title: "Collection renamed" });
    }
    setEditingColId(null);
    setEditingColName("");
  };

  const handleDeleteCollection = async (colId: string, colName: string) => {
    if (confirm(`Are you sure you want to delete collection "${colName}" and all its requests?`)) {
      await deleteCollection(colId);
      addToast({ type: "info", title: "Collection deleted", description: colName });
    }
    setCollectionMenuId(null);
  };

  const handleDuplicateRequest = async (colId: string, reqId: string) => {
    const dup = await duplicateRequest(colId, reqId);
    if (dup) {
      handleSelectRequest(dup);
      addToast({ type: "success", title: "Request duplicated", description: dup.name });
    }
    setRequestMenuId(null);
  };

  const handleDeleteRequest = async (colId: string, reqId: string, reqName: string) => {
    if (confirm(`Delete request "${reqName}"?`)) {
      await deleteRequest(colId, reqId);
      addToast({ type: "info", title: "Request deleted", description: reqName });
    }
    setRequestMenuId(null);
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  // Generate code snippet
  const generatedCode = useMemo(() => {
    const interpolatedUrl = buildFinalUrl(interpolate(wb.url || "https://api.example.com"), wb.params, getVariablesMap());
    const effectiveHeaders = wb.getEffectiveHeaders();

    if (selectedSnippetLang === "curl") {
      let headerFlags = Object.entries(effectiveHeaders)
        .map(([k, v]) => `  -H '${k}: ${v}'`)
        .join(" \\\n");
      if (headerFlags) headerFlags = " \\\n" + headerFlags;
      let bodyFlag = "";
      if (wb.bodyType !== "none" && wb.body && wb.method !== "GET" && wb.method !== "HEAD") {
        bodyFlag = ` \\\n  -d '${wb.body.replace(/'/g, "'\\''")}'`;
      }
      return `curl -X ${wb.method} '${interpolatedUrl}'${headerFlags}${bodyFlag}`;
    }

    if (selectedSnippetLang === "fetch") {
      const options: any = { method: wb.method, headers: effectiveHeaders };
      if (wb.bodyType !== "none" && wb.body && wb.method !== "GET" && wb.method !== "HEAD") {
        options.body = wb.body;
      }
      return `fetch("${interpolatedUrl}", ${JSON.stringify(options, null, 2)})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
    }

    if (selectedSnippetLang === "axios") {
      return `import axios from 'axios';\n\nconst response = await axios({\n  method: '${wb.method.toLowerCase()}',\n  url: '${interpolatedUrl}',\n  headers: ${JSON.stringify(effectiveHeaders, null, 2)},\n  data: ${wb.bodyType !== "none" && wb.body ? wb.body : "undefined"}\n});\nconsole.log(response.data);`;
    }

    if (selectedSnippetLang === "python") {
      return `import requests\n\nurl = "${interpolatedUrl}"\nheaders = ${JSON.stringify(effectiveHeaders, null, 2)}\npayload = ${wb.bodyType !== "none" && wb.body ? wb.body : "None"}\n\nresponse = requests.request("${wb.method}", url, headers=headers, json=payload)\nprint(response.text)`;
    }

    if (selectedSnippetLang === "go") {
      return `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io"\n)\n\nfunc main() {\n\turl := "${interpolatedUrl}"\n\treq, _ := http.NewRequest("${wb.method}", url, nil)\n\tres, _ := http.DefaultClient.Do(req)\n\tdefer res.Body.Close()\n\tbody, _ := io.ReadAll(res.Body)\n\tfmt.Println(string(body))\n}`;
    }

    return "";
  }, [wb, selectedSnippetLang]);

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(collectionSearch.toLowerCase()) ||
    (c.requests || []).some((r) => r.name.toLowerCase().includes(collectionSearch.toLowerCase())),
  );

  const activeEnv = getActiveEnvironment();
  const response = wb.response;

  const renderPrettyJson = (data: any) => {
    if (data === null || data === undefined) return <span className="text-slate-500">null</span>;
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    return (
      <pre className="whitespace-pre-wrap break-all text-xs font-mono text-slate-200 leading-relaxed">
        {json.split("\n").map((line, i) => {
          const colored = line
            .replace(/"([^"]+)":/g, '<span class="text-cyan-400">"$1"</span>:')
            .replace(/: "([^"]*?)"/g, ': <span class="text-amber-300">"$1"</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span class="text-violet-400">$1</span>')
            .replace(/: (true|false)/g, ': <span class="text-emerald-400">$1</span>')
            .replace(/: null/g, ': <span class="text-red-400">null</span>');
          return <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />;
        })}
      </pre>
    );
  };

  return (
    <div className="bg-[#0c1324] text-[#dce1fb] font-sans h-screen w-screen overflow-hidden flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* Top Nav */}
      <nav className="bg-[#151b2d] text-[#4cd7f6] border-b border-[#2b354b] flex justify-between items-center w-full px-4 h-12 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate?.("landing")}
            className="text-[17px] font-bold text-[#4cd7f6] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>api</span>
            API Workbench
          </button>

          <div className="hidden md:flex items-center gap-2 ml-4 border-l border-[#2b354b] pl-4">
            {/* Environment Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEnvMenu((v) => !v)}
                className="flex items-center gap-1.5 bg-[#070d1f] px-2.5 py-1 rounded border border-[#2b354b] hover:border-[#4cd7f6] transition-colors cursor-pointer text-[#bcc9cd] text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[14px] text-cyan-400">dns</span>
                <span className="max-w-[120px] truncate">{activeEnv?.name || "No Environment"}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {showEnvMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEnvMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 bg-[#151b2d] border border-[#2b354b] rounded-lg shadow-2xl z-50 min-w-[200px] py-1">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Environments</div>
                  {environments.map((env) => (
                    <button
                      key={env.id}
                      onClick={() => { setActiveEnvironmentId(env.id); setShowEnvMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#20293f] transition-colors ${activeEnvironmentId === env.id ? "text-[#4cd7f6] font-semibold" : "text-[#bcc9cd]"}`}
                    >
                      {activeEnvironmentId === env.id ? (
                        <span className="material-symbols-outlined text-[14px] text-cyan-400">check</span>
                      ) : (
                        <span className="w-[14px]" />
                      )}
                      <span className="truncate">{env.name}</span>
                      {env.isProd && <span className="ml-auto text-[9px] border border-red-400/30 text-red-400 px-1 rounded">PROD</span>}
                    </button>
                  ))}
                  <div className="border-t border-[#2b354b] mt-1 pt-1">
                    <button
                      onClick={() => { setShowEnvMenu(false); onNavigate?.("environments"); }}
                      className="w-full text-left px-3 py-2 text-xs text-[#4cd7f6] hover:bg-[#20293f] transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">settings</span>
                      Manage Environments
                    </button>
                  </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="hidden md:flex items-center h-full gap-1">
          <button className="text-[#4cd7f6] border-b-2 border-[#4cd7f6] px-4 flex items-center h-full text-xs font-semibold">
            Workbench
          </button>
          <button
            onClick={() => onNavigate?.("environments")}
            className="text-[#bcc9cd] hover:text-white px-4 flex items-center h-full hover:bg-[#20293f] transition-colors border-b-2 border-transparent text-xs"
          >
            Environments
          </button>
          <button
            onClick={() => onNavigate?.("history")}
            className="text-[#bcc9cd] hover:text-white px-4 flex items-center h-full hover:bg-[#20293f] transition-colors border-b-2 border-transparent text-xs"
          >
            History
          </button>
          <button
            onClick={() => onNavigate?.("runner")}
            className="text-[#bcc9cd] hover:text-white px-4 flex items-center h-full hover:bg-[#20293f] transition-colors border-b-2 border-transparent text-xs"
          >
            Collection Runner
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeSnippetModal(true)}
            title="Generate code snippets"
            className="bg-[#192237] text-cyan-300 border border-[#2b354b] hover:bg-[#20293f] transition-colors px-2.5 py-1 rounded text-xs flex items-center gap-1 font-mono"
          >
            <span className="material-symbols-outlined text-[15px]">code</span> &lt;/&gt; Code
          </button>

          <button
            onClick={() => onImport?.()}
            className="bg-[#192237] text-[#4cd7f6] border border-[#2b354b] hover:bg-[#20293f] transition-colors px-3 py-1 rounded text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">download</span> Import
          </button>

          <button
            onClick={() => onNavigate?.("runner")}
            className="bg-[#4cd7f6] text-[#003640] hover:opacity-90 transition-opacity px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run Collection
          </button>

          <div className="flex items-center gap-1 ml-1 border-l border-[#2b354b] pl-2">
            <button
              onClick={() => setShowShortcutsModal(true)}
              title="Keyboard Shortcuts"
              className="text-[#bcc9cd] hover:text-cyan-400 transition-colors p-1 rounded hover:bg-[#20293f]"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard</span>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Settings"
              className="text-[#bcc9cd] hover:text-cyan-400 transition-colors p-1 rounded hover:bg-[#20293f]"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            title={`Sign out (${user?.email || "Guest"})`}
            className="ml-2 w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center border border-[#2b354b] cursor-pointer overflow-hidden text-xs font-bold text-white hover:bg-violet-600 transition-colors"
          >
            {user?.name?.slice(0, 2).toUpperCase() || "GU"}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-[#070d1f] text-[#4cd7f6] h-full w-64 border-r border-[#2b354b] flex flex-col shrink-0 z-40 relative">
          <div className="p-3 border-b border-[#2b354b] shrink-0">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded bg-[#20293f] flex items-center justify-center border border-[#2b354b] shrink-0 text-cyan-400 font-bold text-xs">
                {user?.name?.slice(0, 1).toUpperCase() || "W"}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-[#4cd7f6] truncate leading-tight">API Workspace</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || "Local Workspace"}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-[#101729] p-1 rounded-lg border border-[#20293f] text-xs">
              {(["Collections", "Environments", "History"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`py-1 text-center rounded transition-colors text-[11px] font-medium ${
                    sidebarTab === tab ? "bg-[#571bc1] text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Sidebar View */}
          {sidebarTab === "Collections" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-2 shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-slate-400">search</span>
                  <input
                    className="w-full bg-[#101729] border border-[#2b354b] rounded pl-7 pr-2 py-1 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none text-xs"
                    placeholder="Search requests..."
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                {filteredCollections.map((col) => (
                  <div key={col.id} className="relative group/col">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#151d30] rounded cursor-pointer text-[#dce1fb] transition-colors">
                      <span
                        onClick={() => toggleCollection(col.id)}
                        className="material-symbols-outlined text-[14px] text-slate-400 hover:text-white"
                      >
                        {expandedCollections.has(col.id) ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                      </span>

                      <span
                        onClick={() => toggleCollection(col.id)}
                        className="material-symbols-outlined text-[15px] text-amber-400/90 shrink-0"
                      >
                        folder
                      </span>

                      {editingColId === col.id ? (
                        <input
                          value={editingColName}
                          onChange={(e) => setEditingColName(e.target.value)}
                          onBlur={() => handleRenameCollectionConfirm(col.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameCollectionConfirm(col.id); }}
                          autoFocus
                          className="flex-1 bg-[#0c1324] border border-cyan-400 rounded px-1 text-xs text-white outline-none"
                        />
                      ) : (
                        <span onClick={() => toggleCollection(col.id)} className="flex-1 truncate text-xs font-medium">
                          {col.name}
                        </span>
                      )}

                      <button
                        onClick={() => handleAddNewRequestToCol(col.id)}
                        title="Add Request"
                        className="opacity-0 group-hover/col:opacity-100 hover:text-cyan-400 p-0.5 rounded transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setCollectionMenuId(collectionMenuId === col.id ? null : col.id); }}
                          className="opacity-0 group-hover/col:opacity-100 hover:text-white p-0.5 rounded transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[14px]">more_vert</span>
                        </button>
                        {collectionMenuId === col.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setCollectionMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 bg-[#151b2d] border border-[#2b354b] rounded-lg shadow-xl z-50 min-w-[130px] py-1 text-xs">
                            <button
                              onClick={() => { handleAddNewRequestToCol(col.id); setCollectionMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-[#20293f] flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[13px]">add</span> Add Request
                            </button>
                            <button
                              onClick={() => { setEditingColId(col.id); setEditingColName(col.name); setCollectionMenuId(null); }}
                              className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-[#20293f] flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[13px]">edit</span> Rename
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(col.id, col.name)}
                              className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[13px]">delete</span> Delete
                            </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {expandedCollections.has(col.id) && (
                      <div className="pl-4 flex flex-col gap-0.5 mt-0.5">
                        {(col.requests || []).map((req) => (
                          <div
                            key={req.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer group/req transition-colors ${
                              activeRequestId === req.id ? "bg-[#20293f] text-white font-semibold shadow-sm" : "hover:bg-[#151d30] text-[#bcc9cd]"
                            }`}
                          >
                            <div onClick={() => handleSelectRequest(req)} className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={`font-mono text-[9px] font-bold px-1 rounded border w-[34px] text-center shrink-0 ${METHOD_COLORS[req.method]}`}>
                                {req.method.slice(0, 3)}
                              </span>
                              <span className="truncate text-xs">{req.name}</span>
                            </div>

                            <div className="relative shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); setRequestMenuId(requestMenuId === req.id ? null : req.id); }}
                                className="opacity-0 group-hover/req:opacity-100 hover:text-white p-0.5 rounded transition-opacity"
                              >
                                <span className="material-symbols-outlined text-[13px]">more_vert</span>
                              </button>
                              {requestMenuId === req.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setRequestMenuId(null)} />
                                  <div className="absolute right-0 top-full mt-1 bg-[#151b2d] border border-[#2b354b] rounded-lg shadow-xl z-50 min-w-[120px] py-1 text-xs">
                                    <button
                                      onClick={() => handleDuplicateRequest(col.id, req.id)}
                                      className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-[#20293f] flex items-center gap-1.5"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">content_copy</span> Duplicate
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRequest(col.id, req.id, req.name)}
                                      className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">delete</span> Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[#2b354b] shrink-0">
                {showNewCollection ? (
                  <div className="flex gap-1">
                    <input
                      className="flex-1 bg-[#101729] border border-[#4cd7f6] rounded px-2 py-1 text-xs text-[#dce1fb] focus:outline-none"
                      placeholder="Collection name..."
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateCollection(); if (e.key === "Escape") setShowNewCollection(false); }}
                      autoFocus
                    />
                    <button onClick={handleCreateCollection} className="px-2.5 bg-[#4cd7f6] text-[#003640] rounded text-xs font-bold">+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewCollection(true)}
                    className="bg-[#101729] border border-[#2b354b] text-[#dce1fb] text-xs py-1.5 px-3 rounded hover:border-[#4cd7f6] hover:text-[#4cd7f6] transition-colors flex items-center justify-center gap-1.5 w-full"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span> New Collection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Environments Sidebar View */}
          {sidebarTab === "Environments" && (
            <div className="flex-1 overflow-y-auto p-2 text-xs">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => { setActiveEnvironmentId(env.id); onNavigate?.("environments"); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${
                    activeEnvironmentId === env.id ? "bg-[#20293f] text-white font-semibold" : "hover:bg-[#151d30] text-[#bcc9cd]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-cyan-400">dns</span>
                  <span className="flex-1 truncate">{env.name}</span>
                  {env.isProd && <span className="text-[9px] border border-red-400/30 text-red-400 px-1 rounded">PROD</span>}
                  {activeEnvironmentId === env.id && <span className="text-[9px] text-cyan-400">active</span>}
                </div>
              ))}
              <button
                onClick={() => onNavigate?.("environments")}
                className="mt-3 text-[#4cd7f6] text-xs flex items-center gap-1 px-3 py-1.5 hover:bg-[#151d30] rounded-lg w-full border border-dashed border-[#2b354b]"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> Manage Environments
              </button>
            </div>
          )}

          {/* History Sidebar View */}
          {sidebarTab === "History" && (
            <div className="flex-1 overflow-y-auto text-xs">
              {historyItems.slice(0, 30).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    wb.loadRequest({
                      method: item.method,
                      url: item.url,
                      headers: item.requestHeaders
                        ? Object.entries(item.requestHeaders).map(([k, v], i) => ({
                            id: `h-${i}`,
                            enabled: true,
                            key: k,
                            value: String(v),
                          }))
                        : [],
                      queryParams: [],
                    });
                    addToast({ type: "info", title: "Loaded from history", description: item.url });
                  }}
                  className="flex items-center gap-2 px-3 py-2 border-b border-[#1a2235] hover:bg-[#151d30] cursor-pointer transition-colors"
                >
                  <span className={`font-mono text-[9px] font-bold px-1 rounded border w-[32px] text-center shrink-0 ${METHOD_COLORS[item.method]}`}>
                    {item.method.slice(0, 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold ${statusColor(item.status)}`}>{item.status}</div>
                    <div className="text-slate-400 truncate">{item.url.replace(/^https?:\/\//, "")}</div>
                  </div>
                </div>
              ))}
              {historyItems.length === 0 && (
                <div className="text-center text-slate-500 p-6">No history records yet</div>
              )}
            </div>
          )}
        </aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col bg-[#0c1324] overflow-hidden min-w-0">
          {/* Request Header Bar */}
          <div className="px-3 py-2 bg-[#151b2d] border-b border-[#2b354b] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <input
                value={wb.requestName}
                onChange={(e) => wb.setRequestName(e.target.value)}
                className="bg-transparent border border-transparent hover:border-[#2b354b] focus:border-[#4cd7f6] rounded px-1.5 py-0.5 text-xs font-semibold text-white outline-none max-w-[240px] truncate"
                placeholder="Request name..."
              />
              {wb.hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickSave}
                title="Save Request (Ctrl+S)"
                className="flex items-center gap-1 px-3 py-1 bg-[#20293f] hover:bg-[#2c3854] text-xs font-semibold text-cyan-400 border border-[#2b354b] rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">save</span> Save
              </button>
              <button
                onClick={() => {
                  setSaveModalReqName(wb.requestName || "New Request");
                  setSaveModalColId(collections[0]?.id || "");
                  setShowSaveModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#101729] hover:bg-[#20293f] text-xs text-slate-300 border border-[#2b354b] rounded transition-colors"
              >
                Save As...
              </button>
            </div>
          </div>

          {/* URL & Method Input Bar */}
          <div className="p-3 bg-[#111728] border-b border-[#2b354b] flex items-center gap-2 shrink-0">
            {/* Method selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMethodMenu((v) => !v)}
                className={`flex items-center gap-1.5 bg-[#192237] px-3 py-1.5 rounded-lg border border-[#2b354b] cursor-pointer text-xs font-bold h-[36px] ${METHOD_COLORS[wb.method]}`}
              >
                {wb.method}
                <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
              </button>
              {showMethodMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMethodMenu(false)} />
                  <div className="absolute left-0 top-full mt-1 bg-[#151b2d] border border-[#2b354b] rounded-lg shadow-2xl z-50 py-1 min-w-[110px]">
                  {HTTP_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => { wb.setMethod(m); setShowMethodMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#20293f] transition-colors ${METHOD_COLORS[m]}`}
                    >
                      {m}
                    </button>
                  ))}
                  </div>
                </>
              )}
            </div>

            {/* URL input */}
            <div className="flex-1 flex items-center bg-[#070d1f] border border-[#2b354b] rounded-lg h-[36px] focus-within:border-[#4cd7f6] overflow-hidden px-3 shadow-inner">
              <input
                className="flex-1 bg-transparent border-none text-[#dce1fb] font-mono text-xs focus:outline-none"
                placeholder="https://api.example.com/v1/resource or {{baseUrl}}/endpoint"
                value={wb.url}
                onChange={(e) => wb.setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={wb.isSending}
              className="bg-[#4cd7f6] text-[#003640] text-xs font-bold px-6 rounded-lg h-[36px] hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {wb.isSending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  SENDING...
                </>
              ) : (
                <>
                  SEND
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </>
              )}
            </button>
          </div>

          {/* Request Config Tabs */}
          <div className="flex items-center border-b border-[#2b354b] px-3 shrink-0 bg-[#151b2d] text-xs">
            {(["Params", "Headers", "Body", "Auth", "Pre-request Script", "Tests"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => wb.setActiveRequestTab(tab)}
                className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
                  wb.activeRequestTab === tab ? "text-[#4cd7f6] border-[#4cd7f6]" : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                {tab}
                {tab === "Headers" && (
                  <span className="bg-[#20293f] text-white px-1.5 rounded-full text-[10px] ml-1.5">
                    {wb.headers.filter((h) => h.enabled && h.key).length}
                  </span>
                )}
                {tab === "Pre-request Script" && wb.preRequestScript && (
                  <span className="bg-amber-400/20 text-amber-300 px-1 rounded-full text-[9px] ml-1">JS</span>
                )}
                {tab === "Tests" && wb.testsScript && (
                  <span className="bg-[#571bc1] text-white px-1.5 rounded-full text-[10px] ml-1">JS</span>
                )}
              </button>
            ))}
          </div>

          {/* Params Tab */}
          {wb.activeRequestTab === "Params" && (
            <div className="flex-1 overflow-auto p-3 bg-[#151b2d]">
              <table className="w-full text-left border-collapse border border-[#2b354b] bg-[#0c1324] text-xs rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#101729] text-slate-400">
                    <th className="w-8 border border-[#2b354b] text-center p-1"></th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Key</th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Value</th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Description</th>
                    <th className="w-8 border border-[#2b354b]"></th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {wb.params.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1a233a] group">
                      <td className="border border-[#2b354b] text-center">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => wb.setParam(row.id, "enabled", e.target.checked)}
                          className="w-3.5 h-3.5 accent-cyan-400"
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className={`w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-[#dce1fb] ${!row.enabled && "opacity-40"}`}
                          value={row.key}
                          placeholder="parameter_name"
                          onChange={(e) => wb.setParam(row.id, "key", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className={`w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-[#adc6ff] ${!row.enabled && "opacity-40"}`}
                          value={row.value}
                          placeholder="value or {{var}}"
                          onChange={(e) => wb.setParam(row.id, "value", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className="w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-slate-400"
                          value={row.description || ""}
                          placeholder="description (optional)"
                          onChange={(e) => wb.setParam(row.id, "description", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] text-center opacity-0 group-hover:opacity-100">
                        <span
                          onClick={() => wb.deleteParam(row.id)}
                          className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          delete
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-[#2b354b]"></td>
                    <td className="border border-[#2b354b] p-0" colSpan={3}>
                      <button onClick={wb.addParam} className="w-full px-3 py-2 text-left text-slate-500 hover:text-[#4cd7f6] transition-colors text-xs">
                        + Add parameter
                      </button>
                    </td>
                    <td className="border border-[#2b354b]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Headers Tab */}
          {wb.activeRequestTab === "Headers" && (
            <div className="flex-1 overflow-auto p-3 bg-[#151b2d]">
              <table className="w-full text-left border-collapse border border-[#2b354b] bg-[#0c1324] text-xs rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#101729] text-slate-400">
                    <th className="w-8 border border-[#2b354b] text-center p-1"></th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Header</th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Value</th>
                    <th className="border border-[#2b354b] py-2 px-3 font-mono">Description</th>
                    <th className="w-8 border border-[#2b354b]"></th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {wb.headers.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1a233a] group">
                      <td className="border border-[#2b354b] text-center">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => wb.setHeader(row.id, "enabled", e.target.checked)}
                          className="w-3.5 h-3.5 accent-cyan-400"
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className={`w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-[#dce1fb] ${!row.enabled && "opacity-40"}`}
                          value={row.key}
                          placeholder="Header-Name"
                          onChange={(e) => wb.setHeader(row.id, "key", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className={`w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-[#adc6ff] ${!row.enabled && "opacity-40"}`}
                          value={row.value}
                          placeholder="value or {{var}}"
                          onChange={(e) => wb.setHeader(row.id, "value", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] p-0">
                        <input
                          className="w-full bg-transparent border-none px-3 py-1.5 focus:outline-none text-slate-400"
                          value={row.description || ""}
                          placeholder="description"
                          onChange={(e) => wb.setHeader(row.id, "description", e.target.value)}
                        />
                      </td>
                      <td className="border border-[#2b354b] text-center opacity-0 group-hover:opacity-100">
                        <span
                          onClick={() => wb.deleteHeader(row.id)}
                          className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          delete
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-[#2b354b]"></td>
                    <td className="border border-[#2b354b] p-0" colSpan={3}>
                      <button onClick={wb.addHeader} className="w-full px-3 py-2 text-left text-slate-500 hover:text-[#4cd7f6] transition-colors text-xs">
                        + Add header
                      </button>
                    </td>
                    <td className="border border-[#2b354b]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Body Tab */}
          {wb.activeRequestTab === "Body" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#151b2d]">
              <div className="flex items-center gap-4 px-4 py-2 border-b border-[#2b354b] text-xs">
                {(["none", "json", "raw"] as const).map((bt) => (
                  <label key={bt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={wb.bodyType === bt}
                      onChange={() => wb.setBodyType(bt)}
                      className="accent-cyan-400"
                    />
                    <span className={wb.bodyType === bt ? "text-[#4cd7f6] font-semibold" : "text-slate-400"}>
                      {bt === "none" ? "none" : bt === "json" ? "JSON" : "raw text"}
                    </span>
                  </label>
                ))}
              </div>
              {wb.bodyType !== "none" ? (
                <textarea
                  className="flex-1 bg-[#070d1f] text-[#dce1fb] font-mono text-xs p-4 resize-none focus:outline-none border-none leading-relaxed"
                  placeholder={wb.bodyType === "json" ? '{\n  "key": "value",\n  "userId": "{{userId}}"\n}' : "Enter request body payload..."}
                  value={wb.body}
                  onChange={(e) => wb.setBody(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-3xl mb-2 text-slate-600">block</span>
                  This request does not include a body payload
                </div>
              )}
            </div>
          )}

          {/* Auth Tab */}
          {wb.activeRequestTab === "Auth" && (
            <div className="flex-1 overflow-auto p-4 bg-[#151b2d] text-xs">
              <div className="flex gap-4 mb-4">
                {(["none", "bearer", "basic"] as const).map((at) => (
                  <label key={at} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={wb.authType === at}
                      onChange={() => wb.setAuthType(at)}
                      className="accent-cyan-400"
                    />
                    <span className={wb.authType === at ? "text-[#4cd7f6] font-semibold" : "text-slate-400"}>
                      {at === "none" ? "No Auth" : at === "bearer" ? "Bearer Token" : "Basic Auth"}
                    </span>
                  </label>
                ))}
              </div>
              {wb.authType === "bearer" && (
                <div className="max-w-xl space-y-2">
                  <label className="block text-slate-300 font-medium">Bearer Token</label>
                  <input
                    className="w-full bg-[#070d1f] border border-[#2b354b] rounded-lg px-3 py-2 text-[#dce1fb] font-mono focus:border-[#4cd7f6] focus:outline-none"
                    placeholder="{{authToken}} or paste JWT token..."
                    value={wb.bearerToken}
                    onChange={(e) => wb.setBearerToken(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">Header will automatically be injected as: <code className="text-cyan-400">Authorization: Bearer &lt;token&gt;</code></p>
                </div>
              )}
              {wb.authType === "basic" && (
                <div className="max-w-xl flex flex-col gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Username</label>
                    <input
                      className="w-full bg-[#070d1f] border border-[#2b354b] rounded-lg px-3 py-2 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none"
                      value={wb.basicAuth.username}
                      onChange={(e) => wb.setBasicAuth("username", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full bg-[#070d1f] border border-[#2b354b] rounded-lg px-3 py-2 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none"
                      value={wb.basicAuth.password}
                      onChange={(e) => wb.setBasicAuth("password", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pre-request Script Tab */}
          {wb.activeRequestTab === "Pre-request Script" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#151b2d]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2b354b] text-xs text-slate-400">
                <span>Pre-request Script (Runs before request is sent)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => wb.setPreRequestScript(`pm.environment.set("timestamp", Date.now());\n`)}
                    className="text-cyan-400 hover:underline"
                  >
                    + Set Timestamp
                  </button>
                  <button
                    onClick={() => wb.setPreRequestScript(wb.preRequestScript + `pm.variables.set("guid", Math.random().toString(36).substring(2));\n`)}
                    className="text-cyan-400 hover:underline"
                  >
                    + Random String
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 bg-[#070d1f] text-[#dce1fb] font-mono text-xs p-4 resize-none focus:outline-none border-none leading-relaxed"
                placeholder={`// Use pm.environment.set() or pm.variables.set() to set dynamic values\npm.environment.set("requestId", "req_" + Date.now());\n\nconsole.log("Pre-request script executed");`}
                value={wb.preRequestScript}
                onChange={(e) => wb.setPreRequestScript(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          {/* Tests Tab */}
          {wb.activeRequestTab === "Tests" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#151b2d]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2b354b] text-xs text-slate-400">
                <span>Test Scripts & Assertions (Postman-style pm API)</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => wb.setTestsScript(`pm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});\n`)}
                    className="text-cyan-400 hover:underline"
                  >
                    + Status 200
                  </button>
                  <button
                    onClick={() => wb.setTestsScript(wb.testsScript + `\npm.test("Response time < 500ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(500);\n});\n`)}
                    className="text-cyan-400 hover:underline"
                  >
                    + Latency Check
                  </button>
                  <button
                    onClick={() => wb.setTestsScript(wb.testsScript + `\npm.test("Check property exists", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.have.property("id");\n});\n`)}
                    className="text-cyan-400 hover:underline"
                  >
                    + Property Check
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 bg-[#070d1f] text-[#dce1fb] font-mono text-xs p-4 resize-none focus:outline-none border-none leading-relaxed"
                placeholder={`// Write assertions using pm.test and pm.expect\npm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("Response is valid JSON", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.be.a("object");\n});`}
                value={wb.testsScript}
                onChange={(e) => wb.setTestsScript(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          {/* Divider */}
          <div className="h-[2px] bg-[#2b354b] w-full shrink-0" />

          {/* Response Panel */}
          <div className="flex flex-col" style={{ height: "42%" }}>
            {/* Response header */}
            <div className="flex items-center justify-between border-b border-[#2b354b] px-4 py-2 shrink-0 bg-[#070d1f]">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Response</h3>
                {response && (
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={`font-bold ${statusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">timer</span>
                      {response.durationMs}ms
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">sd_storage</span>
                      {formatBytes(response.sizeBytes)}
                    </span>
                    {response.testResults.length > 0 && (
                      <span className={`flex items-center gap-1 font-semibold ${response.testResults.every((r) => r.passed) ? "text-emerald-400" : "text-red-400"}`}>
                        <span className="material-symbols-outlined text-[13px]">science</span>
                        {response.testResults.filter((r) => r.passed).length}/{response.testResults.length} tests passed
                      </span>
                    )}
                  </div>
                )}
                {wb.isSending && <span className="text-xs text-cyan-400 animate-pulse">Executing request...</span>}
                {wb.error && !response && <span className="text-xs text-red-400">{wb.error}</span>}
              </div>

              <div className="flex items-center gap-1.5">
                {(["Pretty", "Raw", "Headers"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setResponseBodyView(v)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      responseBodyView === v ? "bg-[#20293f] text-[#4cd7f6] font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                {response && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(response.dataText);
                      addToast({ type: "info", title: "Copied response to clipboard" });
                    }}
                    title="Copy response body"
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#151b2d] transition-colors ml-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                )}
              </div>
            </div>

            {/* Response body content */}
            <div className="flex-1 overflow-auto bg-[#070d1f]">
              {!response && !wb.isSending && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">send</span>
                  <p className="text-xs font-medium">Hit Send to execute this request and view response</p>
                  <p className="text-[11px] text-slate-600 mt-1">Shortcut: Press Ctrl+Enter</p>
                </div>
              )}

              {wb.error && !response && (
                <div className="p-4">
                  <div className="border border-red-500/30 bg-red-900/20 rounded-lg p-3 text-red-400 text-xs font-mono">
                    <span className="material-symbols-outlined text-sm mr-2 align-middle">error</span>
                    {wb.error}
                  </div>
                </div>
              )}

              {response && responseBodyView === "Pretty" && (
                <div className="p-4">{renderPrettyJson(response.data)}</div>
              )}

              {response && responseBodyView === "Raw" && (
                <div className="p-4">
                  <pre className="text-xs font-mono text-[#dce1fb] whitespace-pre-wrap break-all">{response.dataText}</pre>
                </div>
              )}

              {response && responseBodyView === "Headers" && (
                <div className="p-4">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-[#2b354b]">
                        <th className="py-2 pr-4 font-semibold">Header</th>
                        <th className="py-2 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(response.headers).map(([k, v]) => (
                        <tr key={k} className="border-b border-[#1b2336] hover:bg-[#101729]">
                          <td className="py-1.5 pr-4 text-cyan-400">{k}</td>
                          <td className="py-1.5 text-slate-300 break-all">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Test results strip */}
            {response && response.testResults.length > 0 && (
              <div className="border-t border-[#2b354b] bg-[#0c1324] px-4 py-2 flex gap-2.5 overflow-x-auto shrink-0">
                {response.testResults.map((t, i) => (
                  <div
                    key={i}
                    title={t.error}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs shrink-0 font-medium ${
                      t.passed
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                        : "bg-red-950/60 text-red-300 border border-red-500/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {t.passed ? "check_circle" : "cancel"}
                    </span>
                    <span className="truncate max-w-[200px]">{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Save / Save As Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151b2d] border border-[#2b354b] rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">save</span> Save Request
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Request Name</label>
              <input
                className="w-full bg-[#070d1f] border border-[#2b354b] rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                value={saveModalReqName}
                onChange={(e) => setSaveModalReqName(e.target.value)}
                placeholder="e.g., Get All Users"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Save to Collection</label>
              <select
                className="w-full bg-[#070d1f] border border-[#2b354b] rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                value={saveModalColId}
                onChange={(e) => setSaveModalColId(e.target.value)}
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#20293f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsConfirm}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#4cd7f6] text-[#003640] hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Snippet Modal */}
      {showCodeSnippetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151b2d] border border-[#2b354b] rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">code</span> Code Snippet Generator
              </h3>
              <button
                onClick={() => setShowCodeSnippetModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="flex gap-2 border-b border-[#2b354b] pb-2 text-xs font-medium">
              {(["curl", "fetch", "axios", "python", "go"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedSnippetLang(lang)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    selectedSnippetLang === lang ? "bg-[#571bc1] text-white" : "text-slate-400 hover:text-white hover:bg-[#20293f]"
                  }`}
                >
                  {lang === "curl" ? "cURL" : lang === "fetch" ? "JS (Fetch)" : lang === "axios" ? "Node (Axios)" : lang === "python" ? "Python (Requests)" : "Go"}
                </button>
              ))}
            </div>

            <div className="relative bg-[#070d1f] border border-[#2b354b] rounded-lg p-4 font-mono text-xs text-slate-200 overflow-auto max-h-72">
              <pre className="whitespace-pre-wrap">{generatedCode}</pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  addToast({ type: "success", title: "Copied code snippet" });
                }}
                className="absolute top-3 right-3 bg-[#20293f] hover:bg-[#2e3b5a] text-cyan-400 border border-[#2b354b] px-2.5 py-1 rounded text-xs flex items-center gap-1 font-sans"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151b2d] border border-[#2b354b] rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">keyboard</span> Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#2b354b]">
                <span className="text-slate-300">Send Request</span>
                <kbd className="bg-[#070d1f] border border-[#2b354b] px-2 py-0.5 rounded text-cyan-400 font-mono">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#2b354b]">
                <span className="text-slate-300">Save Request</span>
                <kbd className="bg-[#070d1f] border border-[#2b354b] px-2 py-0.5 rounded text-cyan-400 font-mono">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#2b354b]">
                <span className="text-slate-300">Switch Views</span>
                <span className="text-slate-400 font-mono">Top Bar Links</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowShortcutsModal(false)} className="px-4 py-2 bg-[#20293f] rounded-lg text-xs text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#151b2d] border border-[#2b354b] rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">settings</span> Engine Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Request Timeout (ms)</label>
                <input
                  type="number"
                  value={engineSettings.timeoutMs}
                  onChange={(e) => setEngineSettings({ ...engineSettings, timeoutMs: Math.max(1000, parseInt(e.target.value) || 15000) })}
                  className="w-full bg-[#070d1f] border border-[#2b354b] rounded px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#2b354b]">
                <span className="text-slate-300">Follow Redirects</span>
                <input
                  type="checkbox"
                  checked={engineSettings.followRedirects}
                  onChange={(e) => setEngineSettings({ ...engineSettings, followRedirects: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#2b354b]">
                <span className="text-slate-300">SSL Certificate Validation</span>
                <input
                  type="checkbox"
                  checked={engineSettings.validateSsl}
                  onChange={(e) => setEngineSettings({ ...engineSettings, validateSsl: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  localStorage.setItem("workbench_settings", JSON.stringify(engineSettings));
                  setShowSettingsModal(false);
                  addToast({ type: "success", title: "Settings saved", description: `Timeout ${engineSettings.timeoutMs}ms` });
                }}
                className="px-4 py-2 bg-cyan-400 text-slate-900 font-bold rounded-lg text-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};