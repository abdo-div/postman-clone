import React from "react";
import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { EditorPane } from "./editorPane";
import { ResultsPane } from "./resultsPane";

const editorTabs = ["Params", "Headers (7)", "Body", "Pre-request Script"];

export const TestEditorPage: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-container-lowest font-body-md text-on-surface">
      <TopNavBar />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-container">
          {/* Request Context Header */}
          <div className="flex h-12 shrink-0 items-center gap-4 border-b border-outline-variant bg-surface-container-low px-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-400/10 px-2 py-0.5 font-code-sm uppercase text-code-sm font-bold text-emerald-400">
                GET
              </span>
              <span className="truncate font-code-sm text-code-md text-on-surface">
                /api/v1/users/profile
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4 border-l border-outline-variant pl-4">
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">schedule</span> 142ms
              </div>
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">dns</span> 1.2KB
              </div>
              <div className="flex items-center gap-2 font-code-sm text-code-sm text-error">
                <span className="material-symbols-outlined text-sm">error</span> 401 Unauthorized
              </div>
            </div>
          </div>

          {/* Editor Tab Bar */}
          <div className="hide-scrollbar flex shrink-0 overflow-x-auto border-b border-outline-variant bg-surface-container-low">
            {editorTabs.map((tab) => (
              <button
                key={tab}
                className="border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                {tab}
              </button>
            ))}
            <button className="flex items-center gap-2 border-t-2 border-t-primary bg-surface px-4 py-2 font-body-sm text-body-sm font-semibold text-on-surface">
              Tests
              <span className="rounded-full bg-error-container px-1.5 text-[10px] font-bold text-on-error-container">
                1/4
              </span>
            </button>
            <button className="border-l border-r border-outline-variant px-4 py-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
              Settings
            </button>
          </div>

          {/* Split View */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            <EditorPane />
            <ResultsPane />
          </div>
        </main>
      </div>
    </div>
  );
};
