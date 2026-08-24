import React from "react";
import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { ExecutionHistory } from "./executionHistory";

interface HistoryPageProps {
  onExit?: () => void;
  onNavigate?: (item: string) => void;
  onImport?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onExit, onNavigate, onImport }) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-md text-on-background">
      <TopNavBar onBrandClick={onExit} onNavigate={onNavigate} onImportClick={onImport} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />
        <ExecutionHistory />
      </div>
    </div>
  );
};
