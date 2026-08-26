import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { ExecutionHistory } from "./executionHistory";

interface HistoryPageProps {
  onExit?: () => void;
  onNavigate?: (item: string) => void;
  onImport?: () => void;
  onOpenRequest?: () => void;
}

export function HistoryPage({
  onExit,
  onNavigate,
  onImport,
  onOpenRequest,
}: HistoryPageProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-body-md text-on-background">
      <TopNavBar onBrandClick={onExit} onNavigate={onNavigate} onImportClick={onImport} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar onNavigate={onNavigate} />
        <div className="flex-1 overflow-hidden">
          <ExecutionHistory onOpen={onOpenRequest} />
        </div>
      </div>
    </div>
  );
}
