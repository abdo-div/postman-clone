
interface SideNavItem {
  icon: string;
  label: string;
  view: string;
}

interface SideNavBarProps {
  activeView: string;
  onNavigate?: (view: string) => void;
  onBack?: () => void;
  navItems: SideNavItem[];
  headerIcon?: string;
  headerTitle: string;
  headerSubtitle?: string;
}

export function SideNavBar({
  activeView,
  onNavigate,
  onBack,
  navItems,
  headerIcon = "api",
  headerTitle,
  headerSubtitle,
}: SideNavBarProps) {
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-200 ease-in-out md:flex">
      <div className="flex items-center gap-3 border-b border-outline-variant p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container-high">
          <span className="material-symbols-outlined text-primary">{headerIcon}</span>
        </div>
        <div className="overflow-hidden">
          <h2 className="truncate font-headline-md text-headline-md leading-tight text-primary">
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
              {headerSubtitle}
            </p>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2 font-label-caps text-label-caps">
        {navItems.map((item) => {
          const isActive = item.view === activeView;
          return (
            <a
              key={item.view}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (isActive) onBack?.();
                else onNavigate?.(item.view);
              }}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  isActive ? "" : "group-hover:text-on-surface"
                } transition-colors`}
              >
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
