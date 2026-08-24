import React, { useMemo, useState } from "react";
import { historyEntries } from "./mockData";
import type { HttpMethod, StatusCodeClass } from "./types";

const methodBadgeStyles: Record<HttpMethod, string> = {
  GET: "bg-emerald-400/10 text-emerald-400",
  POST: "bg-amber-400/10 text-amber-400",
  PUT: "bg-blue-400/10 text-blue-400",
  PATCH: "bg-blue-400/10 text-blue-400",
  DELETE: "bg-rose-400/10 text-rose-400",
};

const statusStyles: Record<StatusCodeClass, string> = {
  "2xx": "text-emerald-400",
  "4xx": "text-amber-400",
  "5xx": "text-rose-400",
};

type MethodFilter = "all" | HttpMethod;
type StatusFilter = "all" | StatusCodeClass;

export const ExecutionHistory: React.FC = () => {
  const [entries, setEntries] = useState(historyEntries);
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const visible = useMemo(
    () =>
      entries.filter((entry) => {
        const matchesQuery =
          entry.name.toLowerCase().includes(query.toLowerCase()) ||
          entry.url.toLowerCase().includes(query.toLowerCase());
        const matchesMethod = methodFilter === "all" || entry.method === methodFilter;
        const matchesStatus = statusFilter === "all" || entry.statusClass === statusFilter;
        return matchesQuery && matchesMethod && matchesStatus;
      }),
    [entries, query, methodFilter, statusFilter],
  );

  return (
    <div className="relative h-full overflow-y-auto bg-slate-950 p-6 pb-24 lg:ml-64">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Execution History</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review recently sent requests and test results.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-panel-level-1 p-3">
            <div className="relative flex w-full max-w-md items-center gap-3">
              <span className="material-symbols-outlined absolute left-3 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter requests..."
                className="w-full rounded border border-slate-800 bg-slate-950 py-1.5 pl-10 pr-3 font-code-md text-sm text-on-surface outline-none transition-colors placeholder:text-slate-700 focus:border-cyan-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
                className="rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-on-surface-variant outline-none focus:border-cyan-accent"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-on-surface-variant outline-none focus:border-cyan-accent"
              >
                <option value="all">All Statuses</option>
                <option value="2xx">2xx Success</option>
                <option value="4xx">4xx Client Error</option>
                <option value="5xx">5xx Server Error</option>
              </select>
              <select
                defaultValue="Today"
                className="rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-on-surface-variant outline-none focus:border-cyan-accent"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
              </select>
              <button className="flex items-center justify-center rounded border border-slate-800 bg-panel-level-1 px-3 py-1.5 text-on-surface transition-colors hover:border-cyan-accent">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-800 bg-panel-level-1">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950">
              <tr>
                <th className="w-24 px-4 py-2 font-semibold text-on-surface-variant">Method</th>
                <th className="px-4 py-2 font-semibold text-on-surface-variant">Request Name</th>
                <th className="w-[30%] px-4 py-2 font-semibold text-on-surface-variant">URL</th>
                <th className="w-28 px-4 py-2 font-semibold text-on-surface-variant">Status</th>
                <th className="w-24 px-4 py-2 font-semibold text-on-surface-variant">Time</th>
                <th className="w-32 px-4 py-2 font-semibold text-on-surface-variant">Tests</th>
                <th className="w-28 px-4 py-2 text-right font-semibold text-on-surface-variant">
                  Run At
                </th>
                <th className="w-16 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-code-md">
              {visible.map((entry) => (
                <tr key={entry.id} className="group transition-colors hover:bg-slate-800/50">
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-code-sm uppercase text-code-sm font-bold ${methodBadgeStyles[entry.method]}`}
                    >
                      {entry.method}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-2 text-on-surface">{entry.name}</td>
                  <td className="max-w-[250px] truncate px-4 py-2 text-outline">{entry.url}</td>
                  <td className="px-4 py-2">
                    <span className={`flex items-center gap-1 ${statusStyles[entry.statusClass]}`}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          entry.statusClass === "2xx"
                            ? "bg-emerald-400"
                            : entry.statusClass === "4xx"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                        }`}
                      ></span>
                      {entry.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-on-surface-variant">{entry.latencyMs}ms</td>
                  <td
                    className={`px-4 py-2 ${
                      entry.testsTotal == null
                        ? "text-on-surface-variant"
                        : entry.testsPassed === entry.testsTotal
                          ? "text-emerald-400"
                          : "text-rose-400"
                    }`}
                  >
                    {entry.testsTotal == null ? "-" : `${entry.testsPassed}/${entry.testsTotal} passed`}
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-on-surface-variant">
                    {entry.runAt}
                  </td>
                  <td className="flex justify-end gap-2 px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      title="Open"
                      className="text-cyan-accent transition-colors hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                    <button
                      title="Delete"
                      onClick={() =>
                        setEntries((current) => current.filter((e) => e.id !== entry.id))
                      }
                      className="text-rose-400 transition-colors hover:text-rose-300"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-on-surface-variant">
                    No requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 p-3 text-sm text-on-surface-variant">
            <span>
              Showing 1 to {visible.length} of {historyEntries.length * 12} requests
            </span>
            <div className="flex gap-2">
              <button className="cursor-not-allowed rounded border border-slate-800 px-2 py-1 opacity-50 transition-colors hover:bg-slate-800">
                Prev
              </button>
              <button className="rounded border border-slate-800 px-2 py-1 transition-colors hover:bg-slate-800">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
