import React from "react";
import type { FeedItem } from "./types";
import { MethodBadge } from "./methodBadge";

interface ExecutionFeedProps {
  items: FeedItem[];
  progress: number;
}

const CIRCUMFERENCE = 251.2;

export const ExecutionFeed: React.FC<ExecutionFeedProps> = ({ items, progress }) => {
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="flex w-1/2 flex-col border-r border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-density-comfortable">
        <h2 className="font-headline-md text-[14px] text-on-surface">Execution Feed</h2>
        <div className="flex items-center gap-2">
          <span className="font-code-sm text-code-sm text-slate-400">{progress}%</span>
          <svg viewBox="0 0 100 100" className="h-6 w-6 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className="circular-progress text-cyan-accent"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-density-comfortable">
        {items.map((item) => {
          if (item.status === "pending") {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border border-slate-800 bg-slate-950 p-2 opacity-50"
              >
                <div className="flex items-center gap-3">
                  <MethodBadge method={item.method} status={item.status} />
                  <span className="font-body-sm text-body-sm text-slate-400">{item.name}</span>
                </div>
                <span className="gap-4 font-code-sm text-code-sm text-slate-500">
                  Pending...
                </span>
              </div>
            );
          }

          if (item.status === "failed") {
            return (
              <div
                key={item.id}
                className="relative flex items-center justify-between overflow-hidden rounded border border-cyan-accent bg-slate-900 p-2"
              >
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-cyan-accent"></div>
                <div className="flex items-center gap-3 pl-2">
                  <MethodBadge method={item.method} />
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-code-sm text-code-sm text-slate-400">
                  <span className="text-method-delete-text">{item.statusCode}</span>
                  <span>{item.latencyMs}ms</span>
                  <div className="flex items-center gap-1 text-method-delete-text">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    <span>
                      {item.testsPassed}/{item.testsTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="flex cursor-pointer items-center justify-between rounded border border-slate-800 bg-slate-900 p-2 hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <MethodBadge method={item.method} />
                <span className="font-body-sm text-body-sm text-on-surface">{item.name}</span>
              </div>
              <div className="flex items-center gap-4 font-code-sm text-code-sm text-slate-400">
                <span className="text-method-get-text">{item.statusCode}</span>
                <span>{item.latencyMs}ms</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-method-get-text">
                    check_circle
                  </span>
                  <span>
                    {item.testsPassed}/{item.testsTotal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
