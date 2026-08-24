import React, { useState } from "react";
import { detail } from "./mockData";
import { MethodBadge } from "./methodBadge";

const tabs = ["Test Results", "Request", "Response"] as const;
type Tab = (typeof tabs)[number];

export const DetailPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Test Results");

  return (
    <div className="flex w-1/2 flex-col bg-slate-900">
      <div className="flex h-10 border-b border-slate-800 bg-slate-950">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full border-r border-slate-800 px-4 font-body-sm text-body-sm transition-colors ${
                isActive
                  ? "border-t-2 border-l border-t-cyan-accent bg-slate-900 font-semibold text-on-surface"
                  : "bg-slate-950 text-slate-400 hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col gap-density-spacious overflow-y-auto p-density-spacious">
        {activeTab === "Test Results" && (
          <>
            <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
              <h3 className="flex items-center gap-2 font-headline-md text-[16px] text-on-surface">
                {detail.name}
                {detail.failed && (
                  <span className="rounded bg-method-delete-bg px-1.5 py-0.5 font-code-sm text-[10px] text-method-delete-text">
                    FAILED
                  </span>
                )}
              </h3>
              <p className="break-all font-code-sm text-code-sm text-slate-400">
                <MethodBadge method={detail.method} /> {detail.url}
              </p>
            </div>

            <div className="flex flex-col gap-density-comfortable">
              <div className="flex items-center gap-1 font-label-caps text-label-caps uppercase tracking-widest text-slate-500">
                <span className="material-symbols-outlined text-[14px]">bug_report</span>
                Assertion Failures ({detail.failures.length})
              </div>

              {detail.failures.map((failure) => (
                <div
                  key={failure.name}
                  className="flex flex-col overflow-hidden rounded border border-slate-800 bg-slate-950 font-code-sm text-code-sm"
                >
                  <div className="flex items-start gap-2 border-b border-slate-800 bg-method-delete-bg px-3 py-2">
                    <span className="material-symbols-outlined mt-0.5 text-[14px] text-method-delete-text">
                      close
                    </span>
                    <div>
                      <span className="block font-semibold text-on-surface">{failure.name}</span>
                      <span className="mt-1 block text-method-delete-text">{failure.message}</span>
                    </div>
                  </div>

                  <div className="relative flex bg-slate-900 py-2">
                    <div className="absolute bottom-0 left-0 top-0 flex w-8 select-none flex-col border-r border-slate-800 bg-slate-950 pt-2 pr-2 text-right text-slate-500">
                      <span>14</span>
                      <span>15</span>
                      <span className="text-slate-300">16</span>
                      <span>17</span>
                    </div>
                    <div className="w-full whitespace-pre pl-10 pr-2 text-slate-300">
                      <div>
                        <span className="text-blue-400">pm</span>.test(
                        <span className="text-emerald-400">"Status code is 200"</span>,{" "}
                        <span className="text-blue-400">function</span> {"() {"}
                      </div>
                      <div>
                        {" "}
                        <span className="text-blue-400">pm</span>.response.to.have.status(
                        <span className="text-amber-400">200</span>);
                      </div>
                      <div className="-mx-10 border-l-2 border-method-delete-text bg-slate-800/30 pl-10">
                        {"});"}{" "}
                        <span className="italic text-slate-500">// Execution failed here</span>
                      </div>
                      <div> </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "Request" && (
          <p className="font-body-sm text-body-sm text-slate-500">
            Request details for the selected run will appear here.
          </p>
        )}

        {activeTab === "Response" && (
          <p className="font-body-sm text-body-sm text-slate-500">
            Response body and headers will appear here.
          </p>
        )}
      </div>
    </div>
  );
};
