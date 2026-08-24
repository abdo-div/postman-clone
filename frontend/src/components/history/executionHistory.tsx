import React, { useEffect, useMemo, useState } from "react";
import { useHistoryStore } from "../../store/useHistoryStore";
import { useWorkbenchStore } from "../../store/useWorkbenchStore";
import { useToastStore } from "../../store/useToastStore";

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-400/10 text-emerald-400",
  POST: "bg-amber-400/10 text-amber-400",
  PUT: "bg-blue-400/10 text-blue-400",
  PATCH: "bg-orange-400/10 text-orange-400",
  DELETE: "bg-rose-400/10 text-rose-400",
  OPTIONS: "bg-emerald-400/10 text-emerald-400",
  HEAD: "bg-pink-400/10 text-pink-400",
};

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-400";
  if (status >= 400) return "text-rose-400";
  return "text-on-surface-variant";
}

function formatBytes(bytes = 0): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

interface ExecutionHistoryProps {
  onOpen?: () => void;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({ onOpen }) => {
  const { items, load, clearAll, searchQuery, filterMethod, filterStatus, setSearchQuery, setFilterMethod, setFilterStatus, getFiltered } = useHistoryStore();
  const loadRequest = useWorkbenchStore((s) => s.loadRequest);
  const { addToast } = useToastStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => getFiltered(), [items, searchQuery, filterMethod, filterStatus]);

  const handleOpen = (item: any) => {
    loadRequest({
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
      body: item.requestBody ? JSON.stringify(item.requestBody, null, 2) : "",
      bodyType: item.requestBody ? "json" : "none",
    });
    onOpen?.();
  };

  const handleClearAll = () => {
    clearAll();
    addToast({ type: "info", title: "History cleared" });
  };

  return (
    <div className="relative h-full overflow-y-auto bg-slate-950 p-6 pb-24 lg:ml-64">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Execution History</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {items.length} total requests · Review recently sent requests and test results.
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded border border-error/30 px-3 py-1.5 text-sm text-error hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-panel-level-1 p-3">
            <div className="relative flex w-full max-w-md items-center gap-3">
              <span className="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search by URL or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface-container-low py-2 pl-10 pr-3 font-code-sm text-sm text-on-surface outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="rounded border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container"
              >
                <option value="ALL">All Methods</option>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container"
              >
                <option value="ALL">All Status</option>
                <option value="2xx">2xx Success</option>
                <option value="4xx">4xx Client Error</option>
                <option value="5xx">5xx Server Error</option>
                <option value="error">Errors</option>
              </select>
            </div>
          </div>
        </div>

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">history</span>
            <p className="text-on-surface-variant">No history found</p>
            <p className="text-sm text-on-surface-variant/50 mt-1">
              {items.length === 0 ? "Send a request to see it here" : "Try adjusting your filters"}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest transition-colors hover:border-outline-variant"
            >
              <div className="flex items-center gap-4 p-4">
                <span
                  className={`shrink-0 rounded px-2 py-0.5 font-code-sm text-xs font-bold ${METHOD_STYLES[item.method] || "bg-outline/10 text-on-surface"}`}
                >
                  {item.method}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-code-sm text-sm text-on-surface">{item.url}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.timestamp}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`font-code-sm text-sm font-bold ${statusColor(item.status)}`}>
                    {item.status} {item.statusText}
                  </span>
                  <span className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">timer</span>
                    {item.durationMs}ms
                  </span>
                  {item.sizeBytes !== undefined && (
                    <span className="text-xs text-on-surface-variant">{formatBytes(item.sizeBytes)}</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 rounded border border-outline-variant/30 px-2 py-1 hover:bg-surface-container-highest"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {expandedId === item.id ? "expand_less" : "expand_more"}
                      </span>
                      Details
                    </button>
                    <button
                      onClick={() => handleOpen(item)}
                      className="text-xs text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 rounded border border-primary/30 px-2 py-1 hover:bg-primary-container/20"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      Open
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="border-t border-outline-variant/30 p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-2">Request Headers</p>
                    {item.requestHeaders && Object.entries(item.requestHeaders).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(item.requestHeaders).map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-xs">
                            <span className="text-cyan-400 font-mono shrink-0">{k}:</span>
                            <span className="text-on-surface-variant font-mono break-all">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant/40">No headers recorded</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-2">Response Preview</p>
                    {item.responseBody ? (
                      <pre className="text-xs font-mono text-on-surface-variant bg-surface-container rounded p-2 overflow-auto max-h-32 whitespace-pre-wrap break-all">
                        {typeof item.responseBody === "string"
                          ? item.responseBody.slice(0, 500)
                          : JSON.stringify(item.responseBody, null, 2).slice(0, 500)}
                        {JSON.stringify(item.responseBody).length > 500 && "..."}
                      </pre>
                    ) : (
                      <p className="text-xs text-on-surface-variant/40">No response body recorded</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
