import React, { useMemo, useState } from "react";
import { assertions } from "./mockData";
import type { AssertionStatus } from "./types";

const statusFilters: { id: "all" | AssertionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "passed", label: "Passed" },
  { id: "failed", label: "Failed" },
  { id: "skipped", label: "Skipped" },
];

export const ResultsPane: React.FC = () => {
  const [filter, setFilter] = useState<"all" | AssertionStatus>("all");

  const counts = useMemo(
    () => ({
      passed: assertions.filter((a) => a.status === "passed").length,
      failed: assertions.filter((a) => a.status === "failed").length,
    }),
    [],
  );

  const visible =
    filter === "all" ? assertions : assertions.filter((a) => a.status === filter);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-outline-variant bg-surface-container-low lg:w-2/5 lg:border-t-0">
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container px-4 py-2">
        <span className="font-headline-md text-headline-md text-on-surface">Test Results</span>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-1">
            <span className="material-symbols-outlined text-sm text-emerald-400">
              check_circle
            </span>
            <span className="font-code-sm text-code-sm text-emerald-400">{counts.passed} Passed</span>
          </div>
          <div className="flex items-center gap-1 rounded border border-error/30 bg-error-container px-2 py-1">
            <span className="material-symbols-outlined text-sm text-error">cancel</span>
            <span className="font-code-sm text-code-sm text-error">{counts.failed} Failed</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-container-lowest px-3 py-1.5">
        {statusFilters.map(({ id, label }) => {
          const isActive = filter === id;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded px-2 py-1 font-body-sm text-body-sm transition-colors ${
                isActive
                  ? "bg-surface-container-highest text-on-surface"
                  : id === "failed"
                    ? "text-error hover:bg-surface-container-highest"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {id === "all" ? `${label} (${assertions.length})` : label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {visible.map((assertion) =>
          assertion.status === "failed" ? (
            <div
              key={assertion.id}
              className="relative flex items-start gap-3 overflow-hidden rounded-lg border border-error/50 bg-surface p-3"
            >
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-error"></div>
              <span
                style={{ fontVariationSettings: "'FILL' 1" }}
                className="material-symbols-outlined ml-1 mt-0.5 shrink-0 text-error"
              >
                cancel
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h4 className="font-code-md font-medium text-code-md text-on-surface">
                    {assertion.name}
                  </h4>
                  <span className="shrink-0 font-code-sm text-code-sm text-on-surface-variant">
                    {assertion.durationMs ?? "--"}
                  </span>
                </div>
                {assertion.error && (
                  <div className="break-words rounded border border-error/30 bg-surface-container-lowest p-2 font-code-sm text-code-sm text-error">
                    {assertion.error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              key={assertion.id}
              className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface p-3"
            >
              <span
                style={{ fontVariationSettings: "'FILL' 1" }}
                className="material-symbols-outlined mt-0.5 shrink-0 text-emerald-400"
              >
                check_circle
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="truncate font-medium font-code-md text-code-md text-on-surface">
                    {assertion.name}
                  </h4>
                  <span className="shrink-0 font-code-sm text-code-sm text-on-surface-variant">
                    {assertion.durationMs ?? "--"}
                  </span>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
