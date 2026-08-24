import React from "react";
import { feedItems, runProgress } from "./mockData";
import { TopNavBar } from "./topNavBar";
import { RunnerHeader } from "./runnerHeader";
import { ExecutionFeed } from "./executionFeed";
import { DetailPanel } from "./detailPanel";

interface CollectionRunnerPageProps {
  onExit?: () => void;
  onNavigate?: (item: string) => void;
}

export const CollectionRunnerPage: React.FC<CollectionRunnerPageProps> = ({
  onExit,
  onNavigate,
}) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-on-surface">
      <TopNavBar onBrandClick={onExit} onNavigate={onNavigate} />

      <main className="flex flex-1 flex-col overflow-hidden pt-12">
        <RunnerHeader />

        <div className="flex flex-1 overflow-hidden">
          <ExecutionFeed items={feedItems} progress={runProgress} />
          <DetailPanel />
        </div>
      </main>
    </div>
  );
};
