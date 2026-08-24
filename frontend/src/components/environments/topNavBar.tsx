import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (view: string) => void;
  onImportClick?: () => void;
}

const actionIcons = ["settings", "help", "notifications"];

export const TopNavBar: React.FC<TopNavBarProps> = ({ onBrandClick, onNavigate, onImportClick }) => {
  const { user } = useAuthStore();

  return (
    <nav className="z-50 flex h-12 w-full shrink-0 items-center justify-between border-b border-[#2b354b] bg-[#151b2d] px-4 font-body-md text-body-md text-[#dce1fb]">
      <div className="flex h-full items-center space-x-6">
        <button
          onClick={onBrandClick}
          className="text-[17px] font-bold text-[#4cd7f6] flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>api</span>
          API Workbench
        </button>
        <div className="hidden h-full items-center space-x-1 md:flex">
          <button
            onClick={() => onNavigate?.("workbench")}
            className="flex h-full items-center rounded px-3 py-1 text-slate-400 hover:text-white transition-colors text-xs"
          >
            Workbench
          </button>
          <button
            className="mt-1 flex h-full items-center border-b-2 border-primary px-3 pb-1 text-primary text-xs font-semibold"
          >
            Environments
          </button>
          <button
            onClick={() => onNavigate?.("history")}
            className="flex h-full items-center rounded px-3 py-1 text-slate-400 hover:text-white transition-colors text-xs"
          >
            History
          </button>
          <button
            onClick={() => onNavigate?.("runner")}
            className="flex h-full items-center rounded px-3 py-1 text-slate-400 hover:text-white transition-colors text-xs"
          >
            Collection Runner
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => onImportClick?.()}
          className="text-xs font-medium text-slate-300 hover:text-white bg-[#192237] border border-[#2b354b] px-3 py-1 rounded transition-colors"
        >
          Import
        </button>
        <button
          onClick={() => onNavigate?.("runner")}
          className="rounded bg-[#4cd7f6] px-3 py-1 text-xs font-bold text-[#003640] transition-opacity hover:opacity-90 active:scale-95"
        >
          Run Collection
        </button>
        <div className="ml-2 flex items-center space-x-2 border-l border-[#2b354b] pl-3">
          {actionIcons.map((icon) => (
            <button
              key={icon}
              className="p-1 text-slate-400 transition-colors hover:text-white active:scale-95"
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
            </button>
          ))}
          <div className="h-7 w-7 rounded-full bg-[#571bc1] flex items-center justify-center text-xs font-bold text-white border border-[#2b354b]">
            {user?.name?.slice(0, 2).toUpperCase() || "GU"}
          </div>
        </div>
      </div>
    </nav>
  );
};
