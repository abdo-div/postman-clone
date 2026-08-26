import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
  onBack?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onBrandClick,
  onNavigate,
  onImportClick,
  onBack,
}) => {
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "G";

  return (
    <header className="z-50 flex h-12 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-4">
      <div className="flex items-center gap-density-spacious">
        <button
          onClick={onBrandClick}
          className="mr-4 flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary"
        >
          <span className="material-symbols-outlined">terminal</span>
          API Workbench
        </button>

        <nav className="hidden h-full items-center gap-density-comfortable md:flex">
          <a
            href="#"
            onClick={() => onNavigate?.("workbench")}
            className="flex h-12 items-center px-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
          >
            Workspaces
          </a>
          <a
            href="#"
            onClick={() => onNavigate?.("environments")}
            className="flex h-12 items-center px-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
          >
            Environments
          </a>
          <a
            href="#"
            onClick={() => onNavigate?.("history")}
            className="flex h-12 items-center px-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
          >
            History
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-density-comfortable">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-outline-variant bg-surface px-3 py-1.5 font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Workbench
          </button>
        )}
        <button
          onClick={() => onImportClick?.()}
          className="rounded border border-outline-variant bg-surface px-3 py-1.5 font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          Import
        </button>

        <div className="ml-density-compact flex items-center gap-1 border-l border-outline-variant pl-density-comfortable">
          <button
            title="Settings"
            className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
          <div className="ml-1 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary-container font-bold text-xs text-on-secondary-container">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
