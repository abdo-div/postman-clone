import React, { useEffect } from "react";
import { TopNavBar } from "./topNavBar";
import { useRunnerStore } from "../../store/useRunnerStore";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useEnvironmentStore } from "../../store/useEnvironmentStore";
import { useToastStore } from "../../store/useToastStore";

interface CollectionRunnerPageProps {
  onExit?: () => void;
  onNavigate?: (item: string) => void;
  onImport?: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-400/10",
  POST: "text-violet-400 bg-violet-400/10",
  PUT: "text-amber-400 bg-amber-400/10",
  PATCH: "text-orange-400 bg-orange-400/10",
  DELETE: "text-red-400 bg-red-400/10",
  OPTIONS: "text-cyan-400 bg-cyan-400/10",
  HEAD: "text-pink-400 bg-pink-400/10",
};

function statusColor(status?: number): string {
  if (!status) return "text-on-surface-variant";
  if (status >= 200 && status < 300) return "text-emerald-400";
  if (status >= 400) return "text-red-400";
  return "text-amber-400";
}

export const CollectionRunnerPage: React.FC<CollectionRunnerPageProps> = ({
  onExit,
  onNavigate,
  onImport,
}) => {
  const runner = useRunnerStore();
  const { collections, loadCollections } = useCollectionStore();
  const { getVariablesMap, environments, activeEnvironmentId, setActiveEnvironmentId } = useEnvironmentStore();
  const { addToast } = useToastStore();
  const [activeStepDetail, setActiveStepDetail] = React.useState<string | null>(null);

  useEffect(() => {
    loadCollections();
    useEnvironmentStore.getState().loadEnvironments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCollection = collections.find((c) => c.id === runner.selectedCollectionId) || collections[0];

  useEffect(() => {
    if (!runner.selectedCollectionId && collections.length > 0) {
      runner.setSelectedCollectionId(collections[0].id);
    }
  }, [collections, runner.selectedCollectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRun = async () => {
    if (!selectedCollection) {
      addToast({ type: "warning", title: "Select a collection first" });
      return;
    }
    if ((selectedCollection.requests || []).length === 0) {
      addToast({ type: "warning", title: "Collection is empty", description: "Add requests to the collection first" });
      return;
    }
    const envVars = getVariablesMap();
    await runner.runCollection(selectedCollection, envVars);
    addToast({
      type: runner.summary?.testsFailed === 0 ? "success" : "warning",
      title: "Collection run completed",
      description: `${runner.summary?.testsPassed || 0} passed · ${runner.summary?.testsFailed || 0} failed`,
    });
  };

  const activeStep = activeStepDetail ? runner.steps.find((s) => s.id === activeStepDetail) : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-on-surface">
      <TopNavBar onBrandClick={onExit} onNavigate={onNavigate} onImportClick={onImport} onRunCollection={handleRun} />

      <main className="flex flex-1 flex-col overflow-hidden pt-12">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-label-caps text-xs uppercase tracking-widest text-slate-500">
                  Collection Runner
                </span>
                {runner.runStatus === "running" && (
                  <div className="flex items-center gap-1 rounded bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                    Running
                  </div>
                )}
                {runner.runStatus === "completed" && (
                  <div className="flex items-center gap-1 rounded bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Completed
                  </div>
                )}
                {runner.runStatus === "aborted" && (
                  <div className="flex items-center gap-1 rounded bg-red-400/10 px-2 py-0.5 text-xs text-red-400">
                    <span className="material-symbols-outlined text-xs">cancel</span>
                    Aborted
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-on-surface">
                {selectedCollection?.name || "No Collection Selected"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {runner.runStatus === "running" ? (
                <button
                  onClick={runner.abortRun}
                  className="flex items-center gap-2 rounded bg-red-500/20 border border-red-500/40 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">stop</span>
                  Abort Run
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  className="flex items-center gap-2 rounded bg-emerald-500 px-6 py-2 text-sm font-bold text-[#003640] hover:bg-emerald-400 transition-colors shadow"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Run Collection
                </button>
              )}
            </div>
          </div>

          {/* Config row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">Collection:</label>
              <select
                value={runner.selectedCollectionId || ""}
                onChange={(e) => runner.setSelectedCollectionId(e.target.value)}
                disabled={runner.runStatus === "running"}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-on-surface outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({(c.requests || []).length} requests)</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">Environment:</label>
              <select
                value={activeEnvironmentId}
                onChange={(e) => setActiveEnvironmentId(e.target.value)}
                disabled={runner.runStatus === "running"}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-on-surface outline-none focus:border-emerald-400 disabled:opacity-50"
              >
                {environments.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">Iterations:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={runner.iterations}
                onChange={(e) => runner.setIterations(parseInt(e.target.value) || 1)}
                disabled={runner.runStatus === "running"}
                className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-on-surface outline-none focus:border-emerald-400 disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">Delay (ms):</label>
              <input
                type="number"
                min={0}
                max={5000}
                step={100}
                value={runner.delayMs}
                onChange={(e) => runner.setDelayMs(parseInt(e.target.value) || 0)}
                disabled={runner.runStatus === "running"}
                className="w-20 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-on-surface outline-none focus:border-emerald-400 disabled:opacity-50"
              />
            </div>
            <label className="flex items-center gap-1.5 text-on-surface-variant">
              <input
                type="checkbox"
                checked={runner.stopOnError}
                onChange={(e) => runner.setStopOnError(e.target.checked)}
                className="accent-red-400"
              />
              Stop on error
            </label>
            {runner.runStatus !== "idle" && (
              <button
                onClick={runner.reset}
                disabled={runner.runStatus === "running"}
                className="text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-50 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                Reset
              </button>
            )}
          </div>

          {/* Progress bar */}
          {runner.runStatus !== "idle" && (
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${runner.progress}%` }}
              />
            </div>
          )}

          {/* Summary metrics */}
          {runner.summary && (
            <div className="grid grid-cols-5 gap-1 rounded bg-slate-800 p-0.5">
              {[
                { label: "Total", value: runner.summary.totalRequests },
                { label: "Completed", value: runner.summary.completed },
                { label: "Tests Passed", value: runner.summary.testsPassed, accent: "pass" },
                { label: "Tests Failed", value: runner.summary.testsFailed, accent: "fail" },
                { label: "Duration", value: `${(runner.summary.totalDurationMs / 1000).toFixed(2)}s` },
              ].map((m) => (
                <div key={m.label} className="flex flex-col bg-slate-900 px-3 py-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{m.label}</span>
                  <span className={`text-sm font-bold font-mono ${m.accent === "pass" ? "text-emerald-400" : m.accent === "fail" ? "text-red-400" : "text-on-surface"}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution Feed + Detail */}
        <div className="flex flex-1 overflow-hidden">
          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {runner.steps.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/40">
                <span className="material-symbols-outlined text-5xl mb-3">play_circle</span>
                <p>Click "Run Collection" to start</p>
              </div>
            )}
            {runner.steps.map((step) => (
              <div
                key={step.id}
                onClick={() => setActiveStepDetail(activeStepDetail === step.id ? null : step.id)}
                className={`cursor-pointer flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-slate-900 ${
                  step.status === "passed" ? "border-emerald-500/30 bg-slate-950" :
                  step.status === "failed" ? "border-red-500/30 bg-slate-950" :
                  step.status === "running" ? "border-cyan-500/50 bg-cyan-900/10 animate-pulse" :
                  "border-slate-800 bg-slate-950"
                }`}
              >
                <div className="shrink-0 w-5">
                  {step.status === "passed" && (
                    <span className="material-symbols-outlined text-emerald-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                  {step.status === "failed" && (
                    <span className="material-symbols-outlined text-red-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  )}
                  {step.status === "running" && (
                    <span className="material-symbols-outlined text-cyan-400 text-sm animate-spin">progress_activity</span>
                  )}
                  {step.status === "pending" && (
                    <span className="material-symbols-outlined text-slate-600 text-sm">radio_button_unchecked</span>
                  )}
                </div>

                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${METHOD_COLORS[step.method] || "bg-slate-700 text-slate-300"}`}>
                  {step.method}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{step.requestName}</p>
                  <p className="text-xs text-on-surface-variant truncate font-mono">{step.url}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  {step.responseStatus !== undefined && (
                    <span className={`font-bold font-mono ${statusColor(step.responseStatus)}`}>{step.responseStatus}</span>
                  )}
                  {step.durationMs !== undefined && (
                    <span className="text-on-surface-variant">{step.durationMs}ms</span>
                  )}
                  {(step.testsPassed !== undefined || step.testsFailed !== undefined) && (
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400">{step.testsPassed || 0}✓</span>
                      {(step.testsFailed || 0) > 0 && <span className="text-red-400">{step.testsFailed}✗</span>}
                    </div>
                  )}
                  {step.error && (
                    <span className="text-red-400 max-w-[120px] truncate" title={step.error}>{step.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {activeStep && (
            <div className="w-96 shrink-0 border-l border-slate-800 bg-slate-900 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-on-surface">{activeStep.requestName}</h3>
                <button onClick={() => setActiveStepDetail(null)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-label-caps text-on-surface-variant">Method & URL</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[activeStep.method]}`}>{activeStep.method}</span>
                    <span className="font-mono text-on-surface break-all">{activeStep.url}</span>
                  </div>
                </div>

                {activeStep.responseStatus !== undefined && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant">Response</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`font-bold font-mono text-sm ${statusColor(activeStep.responseStatus)}`}>{activeStep.responseStatus}</span>
                      <span className="text-on-surface-variant">{activeStep.durationMs}ms</span>
                    </div>
                  </div>
                )}

                {activeStep.testResults && activeStep.testResults.length > 0 && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant">Test Results</span>
                    <div className="mt-2 space-y-1.5">
                      {activeStep.testResults.map((t, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded ${t.passed ? "bg-emerald-900/30 border border-emerald-500/20" : "bg-red-900/30 border border-red-500/20"}`}>
                          <span className="material-symbols-outlined text-xs mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {t.passed ? "check_circle" : "cancel"}
                          </span>
                          <div>
                            <p className={t.passed ? "text-emerald-400" : "text-red-400"}>{t.name}</p>
                            {t.error && <p className="text-red-300 mt-0.5">{t.error}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep.error && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant">Error</span>
                    <div className="mt-1 rounded border border-red-500/30 bg-red-900/20 p-2 text-red-400 font-mono">{activeStep.error}</div>
                  </div>
                )}

                {activeStep.response && (
                  <div>
                    <span className="font-label-caps text-on-surface-variant">Response Body</span>
                    <pre className="mt-1 rounded border border-slate-700 bg-slate-950 p-2 font-mono text-on-surface-variant overflow-auto max-h-48 whitespace-pre-wrap break-all">
                      {typeof activeStep.response.data === "string"
                        ? activeStep.response.data.slice(0, 800)
                        : JSON.stringify(activeStep.response.data, null, 2).slice(0, 800)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
