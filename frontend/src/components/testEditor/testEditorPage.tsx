import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { EditorPane } from "./editorPane";
import { ResultsPane } from "./resultsPane";
import { useWorkbenchStore } from "../../store/useWorkbenchStore";

interface TestEditorPageProps {
  onBack?: () => void;
  onNavigate?: (item: string) => void;
  onImport?: () => void;
}

const METHOD_COLORS: Record<string, string> = {
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

export function TestEditorPage({
  onBack,
  onNavigate,
  onImport,
}: TestEditorPageProps) {
  const wb = useWorkbenchStore();
  const response = wb.response;

  const passedCount = response?.testResults.filter((r) => r.passed).length ?? 0;
  const totalCount = response?.testResults.length ?? 0;
  const hasTests = wb.testsScript.trim().length > 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-container-lowest font-body-md text-on-surface">
      <TopNavBar onBrandClick={onBack} onNavigate={onNavigate} onImportClick={onImport} onBack={onBack} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar onNavigate={onNavigate} onBack={onBack} />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-container">
          {/* Request Context Header */}
          <div className="flex h-12 shrink-0 items-center gap-4 border-b border-outline-variant bg-surface-container-low px-4">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 font-code-sm text-code-sm font-bold uppercase ${
                  METHOD_COLORS[wb.method] ?? "bg-surface-container-highest text-on-surface"
                }`}
              >
                {wb.method}
              </span>
              <span className="truncate font-code-sm text-code-md text-on-surface">
                {wb.url || "No URL set"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4 border-l border-outline-variant pl-4">
              {response && (
                <>
                  <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {response.durationMs}ms
                  </div>
                  <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">dns</span>
                    {formatBytes(response.sizeBytes)}
                  </div>
                  <div className={`flex items-center gap-2 font-code-sm text-code-sm ${statusColor(response.status)}`}>
                    <span className="material-symbols-outlined text-sm">
                      {response.status < 300
                        ? "check_circle"
                        : response.status < 400
                          ? "info"
                          : response.status < 500
                            ? "warning"
                            : "error"}
                    </span>
                    {response.status} {response.statusText}
                  </div>
                </>
              )}
              {!response && (
                <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                  No response yet
                </div>
              )}
            </div>
          </div>

          {/* Editor Tab Bar */}
          <div className="hide-scrollbar flex shrink-0 overflow-x-auto border-b border-outline-variant bg-surface-container-low">
            <button className="border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Params
            </button>
            <button className="border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Headers
            </button>
            <button className="border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Body
            </button>
            <button className="border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Pre-request Script
            </button>
            <button className="flex items-center gap-2 border-t-2 border-t-primary bg-surface px-4 py-2 font-body-sm text-body-sm font-semibold text-on-surface">
              Tests
              {hasTests && totalCount > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    passedCount === totalCount
                      ? "bg-emerald-400/20 text-emerald-400"
                      : "bg-error-container px-1.5 text-on-error-container"
                  }`}
                >
                  {passedCount}/{totalCount}
                </span>
              )}
              {hasTests && totalCount === 0 && (
                <span className="rounded-full bg-surface-container-highest px-1.5 text-[10px] font-bold text-on-surface-variant">
                  has script
                </span>
              )}
            </button>
            <button className="border-l border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Settings
            </button>
          </div>

          {/* Split View: Editor + Results */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            <EditorPane value={wb.testsScript} onChange={wb.setTestsScript} />
            <ResultsPane testResults={response?.testResults ?? []} />
          </div>
        </main>
      </div>
    </div>
  );
}
