import React from "react";
import { collectionName, metrics } from "./mockData";

export const RunnerHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-density-spacious border-b border-slate-800 bg-slate-900 p-density-spacious">
      <div className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-slate-500">
              Collection Runner
            </span>
            <div className="flex items-center gap-1 rounded bg-method-get-bg px-2 py-0.5 font-code-sm text-code-sm text-method-get-text">
              <span className="h-2 w-2 animate-pulse rounded-full bg-method-get-text"></span>
              Running
            </div>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{collectionName}</h1>
        </div>
        <div className="flex items-center gap-2 font-body-sm text-body-sm text-slate-400">
          <span className="h-2 w-2 rounded-full bg-method-get-text"></span>
          Connected
        </div>
      </div>

      <div className="grid grid-cols-4 gap-panel-gutter rounded-[2px] bg-slate-800 p-[1px]">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col bg-slate-900 p-density-comfortable">
            <span className="mb-1 font-label-caps text-label-caps text-slate-500">
              {metric.label}
            </span>
            <span
              className={`font-code-md text-code-md ${
                metric.accent === "pass"
                  ? "text-method-get-text"
                  : metric.accent === "fail"
                    ? "text-method-delete-text"
                    : "text-on-surface"
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
