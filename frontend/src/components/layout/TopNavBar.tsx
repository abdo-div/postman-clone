import { useAuthStore } from "../../store/useAuthStore";

interface NavItem {
  label: string;
  view: string;
}

interface TopNavBarProps {
  activeView?: string;
  onBrandClick?: () => void;
  onNavigate?: (view: string) => void;
  onImportClick?: () => void;
  onBack?: () => void;
  backLabel?: string;
  navItems?: NavItem[];
  showActionIcons?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Workspaces", view: "workbench" },
  { label: "Environments", view: "environments" },
  { label: "History", view: "history" },
];

export function TopNavBar({
  activeView,
  onBrandClick,
  onNavigate,
  onImportClick,
  onBack,
  backLabel = "Back to Workbench",
  navItems = DEFAULT_NAV_ITEMS,
  showActionIcons = false,
}: TopNavBarProps) {
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
          <span className="material-symbols-outlined">api</span>
          API Workbench
        </button>

        <nav className="hidden h-full items-center gap-density-comfortable md:flex">
          {navItems.map((item) => (
            <a
              key={item.view}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.view);
              }}
              className={`flex h-12 items-center border-b-2 px-2 font-body-md text-body-md transition-colors active:scale-95 ${
                activeView === item.view
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-density-comfortable">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-outline-variant bg-surface px-3 py-1.5 font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {backLabel}
          </button>
        )}
        <button
          onClick={() => onImportClick?.()}
          className="rounded border border-outline-variant bg-surface px-3 py-1.5 font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          Import
        </button>

        <div className="ml-density-compact flex items-center gap-1 border-l border-outline-variant pl-density-comfortable">
          {showActionIcons && (
            <>
              <button
                title="Settings"
                className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
              <button
                title="Help"
                className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-lg">help</span>
              </button>
              <button
                title="Notifications"
                className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-lg">notifications</span>
              </button>
            </>
          )}
          <div className="ml-1 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary-container font-bold text-xs text-on-secondary-container">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
