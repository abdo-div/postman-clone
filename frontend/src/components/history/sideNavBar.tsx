import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface SideNavBarProps {
  onNavigate?: (item: string) => void;
}

const mainNavItems = [
  { icon: "folder", label: "Collections", view: "workbench" },
  { icon: "settings_input_component", label: "Environments", view: "environments" },
  { icon: "history", label: "History", view: "history", active: true },
  { icon: "play_arrow", label: "Runner", view: "runner" },
];

export const SideNavBar: React.FC<SideNavBarProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();

  return (
    <aside className="z-40 hidden h-full w-60 shrink-0 flex-col border-r border-[#2b354b] bg-[#070d1f] text-[#dce1fb] md:flex">
      <div className="flex items-center space-x-3 border-b border-[#2b354b] p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#20293f] text-cyan-400 font-bold">
          <span className="material-symbols-outlined text-lg">api</span>
        </div>
        <div className="overflow-hidden">
          <div className="truncate font-semibold text-xs text-[#4cd7f6] leading-tight">
            API Workspace
          </div>
          <div className="truncate text-[10px] text-slate-400">
            {user?.email || "Personal Workspace"}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {mainNavItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate?.(item.view)}
            className={`w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              item.active
                ? "bg-[#571bc1] text-white"
                : "text-slate-400 hover:bg-[#151d30] hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
