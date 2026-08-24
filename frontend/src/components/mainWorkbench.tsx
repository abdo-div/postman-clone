import React, { useEffect, useState } from "react";
import { useWorkbenchStore, type HttpMethod } from "../store/useWorkbenchStore";
import { useCollectionStore } from "../store/useCollectionStore";
import { useEnvironmentStore } from "../store/useEnvironmentStore";
import { useHistoryStore } from "../store/useHistoryStore";
import { useToastStore } from "../store/useToastStore";
import { useAuthStore } from "../store/useAuthStore";
import { executorService } from "../services/executorService";
import type { View } from "../App";

interface MainWorkbenchProps {
  onNavigate?: (view: View) => void;
  onImport?: () => void;
  onLogout?: () => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-cyan-400 bg-cyan-400/10",
  POST: "text-violet-400 bg-violet-400/10",
  PUT: "text-amber-400 bg-amber-400/10",
  PATCH: "text-orange-400 bg-orange-400/10",
  DELETE: "text-red-400 bg-red-400/10",
  OPTIONS: "text-emerald-400 bg-emerald-400/10",
  HEAD: "text-pink-400 bg-pink-400/10",
};

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-400";
  if (status >= 400 && status < 500) return "text-red-400";
  if (status >= 500) return "text-red-500";
  return "text-on-surface-variant";
}

export const MainWorkbench: React.FC<MainWorkbenchProps> = ({
  onNavigate,
  onImport,
  onLogout,
}) => {
  const wb = useWorkbenchStore();
  const { collections, loadCollections, activeRequestId, setActiveRequestId, addCollection, getActiveRequest } = useCollectionStore();
  const { getVariablesMap, interpolate, getActiveEnvironment, environments, setActiveEnvironmentId, activeEnvironmentId } = useEnvironmentStore();
  const { addItem: addHistory } = useHistoryStore();
  const { addToast } = useToastStore();
  const { user, logout } = useAuthStore();

  const [sidebarTab, setSidebarTab] = useState<"Collections" | "Environments" | "History">("Collections");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set(["col-users"]));
  const [showMethodMenu, setShowMethodMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [responseBodyView, setResponseBodyView] = useState<"Pretty" | "Raw" | "Headers">("Pretty");
  const [historyItems, setHistoryItems] = useState(useHistoryStore.getState().items);

  useEffect(() => {
    loadCollections();
    useHistoryStore.getState().load();
    setHistoryItems(useHistoryStore.getState().items);
  }, []);

  // Load first request initially
  useEffect(() => {
    if (collections.length > 0 && !activeRequestId) {
      const firstCollection = collections[0];
      const firstRequest = firstCollection.requests?.[0];
      if (firstRequest) {
        setActiveRequestId(firstRequest.id);
        wb.loadRequest(firstRequest);
      }
    }
  }, [collections]);

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

  const handleSend = async () => {
    if (!wb.url.trim()) {
      addToast({ type: "warning", title: "URL required", description: "Please enter a request URL" });
      return;
    }

    const envVars = getVariablesMap();
    const interpolatedUrl = buildFinalUrl(interpolate(wb.url), wb.params);
    const effectiveHeaders = wb.getEffectiveHeaders();

    // Interpolate header values
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
        timeoutMs: 15000,
      });

      // Run test scripts
      let testResults: any[] = [];
      let updatedEnvVars: Record<string, string> = {};
      if (wb.testsScript.trim()) {
        const testRes = await executorService.runTests(
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

      // Log to history
      addHistory({
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

  const buildFinalUrl = (url: string, params: any[]) => {
    const enabledParams = params.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length === 0) return url;
    const queryString = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(interpolate(p.value))}`).join("&");
    return url.includes("?") ? `${url}&${queryString}` : `${url}?${queryString}`;
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    const col = await addCollection(newCollectionName.trim());
    setNewCollectionName("");
    setShowNewCollection(false);
    setExpandedCollections((prev) => new Set([...prev, col.id]));
    addToast({ type: "success", title: "Collection created", description: col.name });
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(collectionSearch.toLowerCase()) ||
    (c.requests || []).some((r) => r.name.toLowerCase().includes(collectionSearch.toLowerCase())),
  );

  const activeEnv = getActiveEnvironment();
  const response = wb.response;

  const renderPrettyJson = (data: any) => {
    if (data === null || data === undefined) return <span className="text-on-surface-variant">null</span>;
    const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    return (
      <pre className="whitespace-pre-wrap break-all text-xs font-mono text-on-surface leading-relaxed">
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
    <div className="bg-[#0c1324] text-[#dce1fb] font-sans h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Nav */}
      <nav className="bg-[#151b2d] text-[#4cd7f6] border-b border-[#3d494c] flex justify-between items-center w-full px-4 h-12 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate?.("landing")} className="text-[18px] font-bold text-[#4cd7f6] flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>api</span>
            API Workbench
          </button>

          <div className="hidden md:flex items-center gap-2 ml-4 border-l border-[#3d494c] pl-4">
            {/* Environment Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEnvMenu((v) => !v)}
                className="flex items-center gap-1 bg-[#070d1f] px-2 py-1 rounded border border-[#3d494c] hover:border-[#4cd7f6] transition-colors cursor-pointer text-[#bcc9cd] text-xs"
              >
                <span className="material-symbols-outlined text-[14px]">dns</span>
                <span>{activeEnv?.name || "No Environment"}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {showEnvMenu && (
                <div className="absolute left-0 top-full mt-1 bg-[#151b2d] border border-[#3d494c] rounded shadow-xl z-50 min-w-[180px]">
                  {environments.map((env) => (
                    <button
                      key={env.id}
                      onClick={() => { setActiveEnvironmentId(env.id); setShowEnvMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#2e3447] transition-colors ${activeEnvironmentId === env.id ? "text-[#4cd7f6]" : "text-[#bcc9cd]"}`}
                    >
                      {activeEnvironmentId === env.id && <span className="material-symbols-outlined text-[12px]">check</span>}
                      {env.name}
                      {env.isProd && <span className="ml-auto text-[9px] border border-red-400/20 text-red-400 px-1 rounded">PROD</span>}
                    </button>
                  ))}
                  <div className="border-t border-[#3d494c] mt-1">
                    <button
                      onClick={() => { setShowEnvMenu(false); onNavigate?.("environments"); }}
                      className="w-full text-left px-3 py-2 text-xs text-[#4cd7f6] hover:bg-[#2e3447] transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[12px]">settings</span>
                      Manage Environments
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-end h-full">
          <button className="text-[#4cd7f6] border-b-2 border-[#4cd7f6] pb-1 px-4 flex items-center h-full pt-1 hover:bg-[#2e3447] transition-colors text-sm">Workspaces</button>
          <button onClick={() => onNavigate?.("environments")} className="text-[#bcc9cd] px-4 flex items-center h-full hover:bg-[#2e3447] transition-colors border-b-2 border-transparent text-sm">Environments</button>
          <button onClick={() => onNavigate?.("history")} className="text-[#bcc9cd] px-4 flex items-center h-full hover:bg-[#2e3447] transition-colors border-b-2 border-transparent text-sm">History</button>
          <button onClick={() => onNavigate?.("runner")} className="text-[#bcc9cd] px-4 flex items-center h-full hover:bg-[#2e3447] transition-colors border-b-2 border-transparent text-sm">Runner</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onImport?.()} className="bg-[#191f31] text-[#4cd7f6] border border-[#3d494c] hover:bg-[#2e3447] transition-colors px-3 py-1 rounded text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">download</span> Import
          </button>
          <button
            onClick={() => onNavigate?.("runner")}
            className="bg-[#4cd7f6] text-[#003640] hover:opacity-90 transition-opacity px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run Collection
          </button>
          <div className="flex items-center gap-1 ml-2 border-l border-[#3d494c] pl-2">
            <button className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1 rounded hover:bg-[#2e3447]"><span className="material-symbols-outlined text-[20px]">settings</span></button>
            <button className="text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors p-1 rounded hover:bg-[#2e3447]"><span className="material-symbols-outlined text-[20px]">help</span></button>
          </div>
          <button
            onClick={handleLogout}
            title={`Sign out (${user?.email || "Guest"})`}
            className="ml-2 w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center border border-[#3d494c] cursor-pointer overflow-hidden text-xs font-bold text-white hover:bg-violet-600 transition-colors"
          >
            {user?.name?.slice(0, 2).toUpperCase() || "GU"}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-[#070d1f] text-[#4cd7f6] h-full w-64 border-r border-[#3d494c] flex flex-col shrink-0 z-40 relative">
          <div className="p-3 border-b border-[#3d494c] shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded bg-[#2e3447] flex items-center justify-center border border-[#3d494c] shrink-0 text-cyan-400 font-bold text-sm">
                {user?.name?.slice(0, 1).toUpperCase() || "W"}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-semibold text-[#4cd7f6] truncate leading-tight">Main Workspace</div>
                <div className="text-[11px] text-[#bcc9cd] truncate">{user?.email || "Guest Mode"}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {(["Collections", "Environments", "History"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`px-3 py-1.5 flex items-center gap-2 w-full text-left rounded-lg transition-colors ${sidebarTab === tab ? "bg-[#571bc1] text-[#c4abff]" : "text-[#bcc9cd] hover:bg-[#191f31]"}`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {tab === "Collections" ? "folder" : tab === "Environments" ? "settings_input_component" : "history"}
                  </span>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Tab */}
          {sidebarTab === "Collections" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-2 shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[14px] text-[#bcc9cd]">search</span>
                  <input
                    className="w-full bg-[#191f31] border border-[#3d494c] rounded pl-7 pr-2 py-1 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none text-xs"
                    placeholder="Filter collections..."
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
                {filteredCollections.map((col) => (
                  <div key={col.id}>
                    <div
                      onClick={() => toggleCollection(col.id)}
                      className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#191f31] rounded cursor-pointer text-[#dce1fb]"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#bcc9cd]">
                        {expandedCollections.has(col.id) ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-amber-400/80">folder</span>
                      <span className="flex-1 truncate text-xs">{col.name}</span>
                      <span className="text-[#bcc9cd] opacity-50 text-[10px]">{(col.requests || []).length}</span>
                    </div>

                    {expandedCollections.has(col.id) && (
                      <div className="pl-4 flex flex-col gap-0.5 mt-0.5">
                        {(col.requests || []).map((req) => (
                          <div
                            key={req.id}
                            onClick={() => handleSelectRequest(req)}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${activeRequestId === req.id ? "bg-[#2e3447] text-white font-semibold" : "hover:bg-[#191f31] text-[#bcc9cd]"}`}
                          >
                            <span className={`font-mono text-[9px] font-bold px-1 rounded w-[32px] text-center shrink-0 ${METHOD_COLORS[req.method]}`}>
                              {req.method.slice(0, 3)}
                            </span>
                            <span className="truncate text-xs">{req.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[#3d494c] shrink-0">
                {showNewCollection ? (
                  <div className="flex gap-1">
                    <input
                      className="flex-1 bg-[#191f31] border border-[#4cd7f6] rounded px-2 py-1 text-xs text-[#dce1fb] focus:outline-none"
                      placeholder="Collection name..."
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateCollection(); if (e.key === "Escape") setShowNewCollection(false); }}
                      autoFocus
                    />
                    <button onClick={handleCreateCollection} className="px-2 bg-[#4cd7f6] text-[#003640] rounded text-xs font-bold">+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewCollection(true)}
                    className="bg-[#191f31] border border-[#3d494c] text-[#dce1fb] text-xs py-1.5 px-3 rounded hover:border-[#4cd7f6] hover:text-[#4cd7f6] transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> New Collection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Environments sidebar */}
          {sidebarTab === "Environments" && (
            <div className="flex-1 overflow-y-auto p-2 text-xs">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => { setActiveEnvironmentId(env.id); onNavigate?.("environments"); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer mb-1 ${activeEnvironmentId === env.id ? "bg-[#2e3447] text-white" : "hover:bg-[#191f31] text-[#bcc9cd]"}`}
                >
                  <span className="material-symbols-outlined text-[14px]">dns</span>
                  <span className="flex-1 truncate">{env.name}</span>
                  {env.isProd && <span className="text-[9px] border border-red-400/20 text-red-400 px-1 rounded">PROD</span>}
                  {activeEnvironmentId === env.id && <span className="text-[9px] text-cyan-400">active</span>}
                </div>
              ))}
              <button
                onClick={() => onNavigate?.("environments")}
                className="mt-2 text-[#4cd7f6] text-xs flex items-center gap-1 px-3 py-1 hover:bg-[#191f31] rounded w-full"
              >
                <span className="material-symbols-outlined text-[14px]">add</span> New Environment
              </button>
            </div>
          )}

          {/* History sidebar */}
          {sidebarTab === "History" && (
            <div className="flex-1 overflow-y-auto text-xs">
              {historyItems.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    wb.loadRequest({
                      method: item.method as any,
                      url: item.url,
                      headers: item.requestHeaders
                        ? Object.entries(item.requestHeaders).map(([k, v], i) => ({
                            id: `h-${i}`,
                            enabled: true,
                            key: k,
                            value: v,
                          }))
                        : [],
                      queryParams: [],
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 border-b border-[#1a2235] hover:bg-[#191f31] cursor-pointer"
                >
                  <span className={`font-mono text-[9px] font-bold px-1 rounded w-[28px] text-center shrink-0 ${METHOD_COLORS[item.method]}`}>
                    {item.method.slice(0, 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold ${statusColor(item.status)}`}>{item.status}</div>
                    <div className="text-[#bcc9cd] truncate">{item.url.replace(/^https?:\/\//, "")}</div>
                  </div>
                </div>
              ))}
              {historyItems.length === 0 && (
                <div className="text-center text-[#bcc9cd] p-4">No history yet</div>
              )}
            </div>
          )}
        </aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col bg-[#0c1324] overflow-hidden min-w-0">
          {/* Request Bar */}
          <div className="p-2 bg-[#151b2d] border-b border-[#3d494c] flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-[#bcc9cd] shrink-0">
              <span className="text-[#bcc9cd]/60">{wb.requestName}</span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              {/* Method selector */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowMethodMenu((v) => !v)}
                  className={`flex items-center gap-1 bg-[#191f31] px-3 py-1.5 rounded border border-[#3d494c] cursor-pointer text-xs font-bold h-[34px] ${METHOD_COLORS[wb.method]}`}
                >
                  {wb.method}
                  <span className="material-symbols-outlined text-[16px] text-[#bcc9cd]">arrow_drop_down</span>
                </button>
                {showMethodMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-[#151b2d] border border-[#3d494c] rounded shadow-xl z-50">
                    {HTTP_METHODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => { wb.setMethod(m); setShowMethodMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-[#2e3447] transition-colors ${METHOD_COLORS[m]}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* URL bar */}
              <div className="flex-1 flex items-center bg-[#0c1324] border border-[#3d494c] rounded h-[34px] focus-within:border-[#4cd7f6] overflow-hidden">
                <input
                  className="flex-1 bg-transparent border-none text-[#dce1fb] font-mono text-xs focus:outline-none px-3"
                  placeholder="https://api.example.com/v1/endpoint or {{baseUrl}}/endpoint"
                  value={wb.url}
                  onChange={(e) => wb.setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }}
                />
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={wb.isSending}
                className="bg-[#4cd7f6] text-[#003640] text-xs font-bold px-6 rounded h-[34px] hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                {wb.isSending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>SEND <span className="material-symbols-outlined text-[14px]">send</span></>
                )}
              </button>
            </div>
          </div>

          {/* Request Config Tabs */}
          <div className="flex items-center border-b border-[#3d494c] px-2 shrink-0 pt-1 bg-[#151b2d] text-xs">
            {(["Params", "Headers", "Body", "Auth", "Tests"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => wb.setActiveRequestTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${wb.activeRequestTab === tab ? "text-[#4cd7f6] border-[#4cd7f6]" : "text-[#bcc9cd] border-transparent hover:text-white"}`}
              >
                {tab}
                {tab === "Headers" && (
                  <span className="bg-[#2e3447] text-white px-1.5 rounded-full text-[10px] ml-1">
                    {wb.headers.filter((h) => h.enabled && h.key).length}
                  </span>
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
              <table className="w-full text-left border-collapse border border-[#3d494c] bg-[#0c1324] text-xs">
                <thead>
                  <tr className="bg-[#191f31] text-[#bcc9cd]">
                    <th className="w-8 border border-[#3d494c] text-center p-1"></th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Key</th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Value</th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Description</th>
                    <th className="w-8 border border-[#3d494c]"></th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {wb.params.map((row) => (
                    <tr key={row.id} className="hover:bg-[#2e3447]/30 group">
                      <td className="border border-[#3d494c] text-center">
                        <input type="checkbox" checked={row.enabled} onChange={(e) => wb.setParam(row.id, "enabled", e.target.checked)} className="w-3 h-3 accent-cyan-400" />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className={`w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#dce1fb] ${!row.enabled && "opacity-40"}`} value={row.key} placeholder="key" onChange={(e) => wb.setParam(row.id, "key", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className={`w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#adc6ff] ${!row.enabled && "opacity-40"}`} value={row.value} placeholder="value" onChange={(e) => wb.setParam(row.id, "value", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className="w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#bcc9cd]" value={row.description || ""} placeholder="description" onChange={(e) => wb.setParam(row.id, "description", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] text-center opacity-0 group-hover:opacity-100">
                        <span onClick={() => wb.deleteParam(row.id)} className="material-symbols-outlined text-[14px] text-[#bcc9cd] hover:text-red-400 cursor-pointer">delete</span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-[#3d494c]"></td>
                    <td className="border border-[#3d494c] p-0" colSpan={3}>
                      <button onClick={wb.addParam} className="w-full px-2 py-1.5 text-left text-[#bcc9cd]/50 hover:text-[#4cd7f6] transition-colors text-xs">+ Add param</button>
                    </td>
                    <td className="border border-[#3d494c]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Headers Tab */}
          {wb.activeRequestTab === "Headers" && (
            <div className="flex-1 overflow-auto p-3 bg-[#151b2d]">
              <table className="w-full text-left border-collapse border border-[#3d494c] bg-[#0c1324] text-xs">
                <thead>
                  <tr className="bg-[#191f31] text-[#bcc9cd]">
                    <th className="w-8 border border-[#3d494c] text-center p-1"></th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Key</th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Value</th>
                    <th className="border border-[#3d494c] py-1.5 px-2 font-mono">Description</th>
                    <th className="w-8 border border-[#3d494c]"></th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {wb.headers.map((row) => (
                    <tr key={row.id} className="hover:bg-[#2e3447]/30 group">
                      <td className="border border-[#3d494c] text-center">
                        <input type="checkbox" checked={row.enabled} onChange={(e) => wb.setHeader(row.id, "enabled", e.target.checked)} className="w-3 h-3 accent-cyan-400" />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className={`w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#dce1fb] ${!row.enabled && "opacity-40"}`} value={row.key} placeholder="key" onChange={(e) => wb.setHeader(row.id, "key", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className={`w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#adc6ff] ${!row.enabled && "opacity-40"}`} value={row.value} placeholder="value" onChange={(e) => wb.setHeader(row.id, "value", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] p-0">
                        <input className="w-full bg-transparent border-none px-2 py-1.5 focus:outline-none text-[#bcc9cd]" value={row.description || ""} placeholder="description" onChange={(e) => wb.setHeader(row.id, "description", e.target.value)} />
                      </td>
                      <td className="border border-[#3d494c] text-center opacity-0 group-hover:opacity-100">
                        <span onClick={() => wb.deleteHeader(row.id)} className="material-symbols-outlined text-[14px] text-[#bcc9cd] hover:text-red-400 cursor-pointer">delete</span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-[#3d494c]"></td>
                    <td className="border border-[#3d494c] p-0" colSpan={3}>
                      <button onClick={wb.addHeader} className="w-full px-2 py-1.5 text-left text-[#bcc9cd]/50 hover:text-[#4cd7f6] transition-colors text-xs">+ Add header</button>
                    </td>
                    <td className="border border-[#3d494c]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Body Tab */}
          {wb.activeRequestTab === "Body" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#151b2d]">
              <div className="flex items-center gap-4 px-4 py-2 border-b border-[#3d494c] text-xs">
                {(["none", "json", "raw"] as const).map((bt) => (
                  <label key={bt} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" checked={wb.bodyType === bt} onChange={() => wb.setBodyType(bt)} className="accent-cyan-400" />
                    <span className={wb.bodyType === bt ? "text-[#4cd7f6]" : "text-[#bcc9cd]"}>{bt === "none" ? "none" : bt === "json" ? "JSON" : "raw"}</span>
                  </label>
                ))}
              </div>
              {wb.bodyType !== "none" ? (
                <textarea
                  className="flex-1 bg-[#0c1324] text-[#dce1fb] font-mono text-xs p-4 resize-none focus:outline-none border-none"
                  placeholder={wb.bodyType === "json" ? '{\n  "key": "value"\n}' : "Enter request body..."}
                  value={wb.body}
                  onChange={(e) => wb.setBody(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#bcc9cd]/30 text-sm">
                  This request has no body
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
                    <input type="radio" checked={wb.authType === at} onChange={() => wb.setAuthType(at)} className="accent-cyan-400" />
                    <span className={wb.authType === at ? "text-[#4cd7f6]" : "text-[#bcc9cd]"}>
                      {at === "none" ? "No Auth" : at === "bearer" ? "Bearer Token" : "Basic Auth"}
                    </span>
                  </label>
                ))}
              </div>
              {wb.authType === "bearer" && (
                <div>
                  <label className="block text-[#bcc9cd] mb-1">Bearer Token</label>
                  <input
                    className="w-full bg-[#0c1324] border border-[#3d494c] rounded px-3 py-2 text-[#dce1fb] font-mono focus:border-[#4cd7f6] focus:outline-none"
                    placeholder="{{authToken}} or paste token..."
                    value={wb.bearerToken}
                    onChange={(e) => wb.setBearerToken(e.target.value)}
                  />
                  <p className="mt-1 text-[#bcc9cd]/50">Will be sent as: <span className="text-[#4cd7f6]">Authorization: Bearer &lt;token&gt;</span></p>
                </div>
              )}
              {wb.authType === "basic" && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[#bcc9cd] mb-1">Username</label>
                    <input className="w-full bg-[#0c1324] border border-[#3d494c] rounded px-3 py-2 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none" value={wb.basicAuth.username} onChange={(e) => wb.setBasicAuth("username", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[#bcc9cd] mb-1">Password</label>
                    <input type="password" className="w-full bg-[#0c1324] border border-[#3d494c] rounded px-3 py-2 text-[#dce1fb] focus:border-[#4cd7f6] focus:outline-none" value={wb.basicAuth.password} onChange={(e) => wb.setBasicAuth("password", e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {wb.activeRequestTab === "Tests" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#151b2d]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#3d494c] text-xs text-[#bcc9cd]">
                <span>Test Script (JavaScript / pm.test)</span>
                <div className="flex gap-2">
                  <button onClick={() => wb.setTestsScript(`pm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});\n`)} className="text-[#4cd7f6] hover:underline">+ Status Check</button>
                  <button onClick={() => wb.setTestsScript(wb.testsScript + `\npm.test("Response time < 500ms", function () {\n    pm.expect(pm.response.responseTime).to.be.below(500);\n});\n`)} className="text-[#4cd7f6] hover:underline">+ Timing Check</button>
                </div>
              </div>
              <textarea
                className="flex-1 bg-[#0c1324] text-[#dce1fb] font-mono text-xs p-4 resize-none focus:outline-none border-none"
                placeholder={`// Write test assertions using Postman-style pm API\npm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("Has data", function () {\n    const json = pm.response.json();\n    pm.expect(json).to.have.property("id");\n});`}
                value={wb.testsScript}
                onChange={(e) => wb.setTestsScript(e.target.value)}
                spellCheck={false}
              />
            </div>
          )}

          {/* Divider */}
          <div className="h-[2px] bg-[#3d494c] w-full cursor-row-resize hover:bg-[#4cd7f6] transition-colors shrink-0" />

          {/* Response Panel */}
          <div className="flex flex-col" style={{ height: "40%" }}>
            {/* Response header */}
            <div className="flex items-center justify-between border-b border-[#3d494c] px-4 py-2 shrink-0 bg-[#070d1f]">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-[#dce1fb]">Response</h3>
                {response && (
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={`font-bold ${statusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-[#bcc9cd] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">timer</span>
                      {response.durationMs}ms
                    </span>
                    <span className="text-[#bcc9cd] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">sd_storage</span>
                      {formatBytes(response.sizeBytes)}
                    </span>
                    {response.testResults.length > 0 && (
                      <span className={`flex items-center gap-1 ${response.testResults.every((r) => r.passed) ? "text-emerald-400" : "text-red-400"}`}>
                        <span className="material-symbols-outlined text-[12px]">science</span>
                        {response.testResults.filter((r) => r.passed).length}/{response.testResults.length} tests
                      </span>
                    )}
                  </div>
                )}
                {wb.isSending && <span className="text-xs text-[#bcc9cd] animate-pulse">Sending request...</span>}
                {wb.error && !response && <span className="text-xs text-red-400">{wb.error}</span>}
              </div>
              <div className="flex items-center gap-2">
                {(["Pretty", "Raw", "Headers"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setResponseBodyView(v)}
                    className={`text-xs px-2 py-0.5 rounded ${responseBodyView === v ? "bg-[#2e3447] text-[#4cd7f6]" : "text-[#bcc9cd] hover:text-white"}`}
                  >
                    {v}
                  </button>
                ))}
                {response && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(response.dataText); addToast({ type: "info", title: "Copied to clipboard", duration: 2000 }); }}
                    className="text-[#bcc9cd] hover:text-white p-1 rounded hover:bg-[#191f31]"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                )}
              </div>
            </div>

            {/* Response body */}
            <div className="flex-1 overflow-auto bg-[#0c1324]">
              {!response && !wb.isSending && (
                <div className="h-full flex flex-col items-center justify-center text-[#bcc9cd]/30">
                  <span className="material-symbols-outlined text-4xl mb-2">send</span>
                  <p className="text-sm">Send a request to see the response</p>
                  <p className="text-xs mt-1">Press Ctrl+Enter to send</p>
                </div>
              )}
              {wb.error && !response && (
                <div className="p-4">
                  <div className="border border-red-500/30 bg-red-900/20 rounded p-3 text-red-400 text-xs font-mono">
                    <span className="material-symbols-outlined text-sm mr-2">error</span>
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
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="text-[#bcc9cd] border-b border-[#3d494c]">
                        <th className="py-1.5 pr-4 font-mono font-semibold">Header</th>
                        <th className="py-1.5 font-mono font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(response.headers).map(([k, v]) => (
                        <tr key={k} className="border-b border-[#3d494c]/50 hover:bg-[#191f31]">
                          <td className="py-1.5 pr-4 text-[#4cd7f6] font-mono">{k}</td>
                          <td className="py-1.5 text-[#bcc9cd] font-mono break-all">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Test results strip at bottom */}
            {response && response.testResults.length > 0 && (
              <div className="border-t border-[#3d494c] bg-[#070d1f] px-4 py-2 flex gap-3 overflow-x-auto shrink-0">
                {response.testResults.map((t, i) => (
                  <div
                    key={i}
                    title={t.error}
                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs shrink-0 ${t.passed ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30" : "bg-red-900/40 text-red-400 border border-red-500/30"}`}
                  >
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {t.passed ? "check_circle" : "cancel"}
                    </span>
                    <span className="truncate max-w-[180px]">{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};