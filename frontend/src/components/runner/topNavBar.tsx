import { useAuthStore } from "../../store/useAuthStore";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
  onRunCollection?: () => void;
}

const navItems = [
  { label: "Workbench", view: "workbench" },
  { label: "Environments", view: "environments" },
  { label: "History", view: "history" },
];

const actionIcons = ["settings", "help", "notifications"];

export function TopNavBar({ onBrandClick, onNavigate, onImportClick, onRunCollection }: TopNavBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 z-50 flex h-12 w-full items-center justify-between border-b border-[#2b354b] bg-[#151b2d] px-4">
      <div className="flex items-center gap-6">
        <button
          onClick={onBrandClick}
          className="text-[17px] font-bold text-[#4cd7f6] flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>api</span>
          API Workbench
        </button>

        <div className="hidden md:flex items-center h-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate?.(item.view)}
              className="flex h-full items-center px-3 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button className="mt-1 flex h-full items-center border-b-2 border-[#4cd7f6] px-3 pb-1 text-[#4cd7f6] text-xs font-semibold">
            Collection Runner
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onImportClick?.()}
          className="text-xs font-medium text-slate-300 hover:text-white bg-[#192237] border border-[#2b354b] px-3 py-1 rounded transition-colors"
        >
          Import
        </button>
        <button
          onClick={onRunCollection}
          className="flex items-center gap-1.5 rounded bg-[#4cd7f6] px-3 py-1 text-xs font-bold text-[#003640] transition-opacity hover:opacity-90 active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run Collection
        </button>
        <div className="ml-2 flex items-center gap-2 border-l border-[#2b354b] pl-3">
          {actionIcons.map((icon) => (
            <button key={icon} className="p-1 text-slate-400 transition-colors hover:text-[#4cd7f6]">
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </button>
          ))}
          <div className="ml-1 h-7 w-7 rounded-full bg-[#571bc1] flex items-center justify-center text-xs font-bold text-white border border-[#2b354b]">
            {user?.name?.slice(0, 2).toUpperCase() || "GU"}
          </div>
        </div>
      </div>
    </header>
  );
}
