import React from "react";

interface SideNavBarProps {
  onNavigate?: (item: string) => void;
  onBack?: () => void;
}

const mainNavItems = [
  { icon: "folder", label: "Collections", nav: "workbench" },
  { icon: "settings_input_component", label: "Environments", nav: "environments" },
  { icon: "history", label: "History", nav: "history" },
  { icon: "science", label: "Test Editor", nav: "testEditor", active: true },
];

export const SideNavBar: React.FC<SideNavBarProps> = ({ onNavigate, onBack }) => {
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-200 ease-in-out md:flex">
      <div className="flex items-center gap-3 border-b border-outline-variant p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-container-high">
          <span className="material-symbols-outlined text-primary">science</span>
        </div>
        <div className="overflow-hidden">
          <h2 className="truncate font-headline-md text-headline-md leading-tight text-primary">
            Test Editor
          </h2>
          <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
            Scripts & Assertions
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2 font-label-caps text-label-caps">
        {mainNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (item.nav === "testEditor") onBack?.();
              else onNavigate?.(item.nav);
            }}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              item.active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span
              className={`material-symbols-outlined text-lg ${
                item.active ? "" : "group-hover:text-on-surface"
              } transition-colors`}
            >
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};
