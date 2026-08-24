import React from "react";

const mainNavItems = [
  { icon: "folder", label: "Collections" },
  { icon: "settings_input_component", label: "Environments" },
  { icon: "history", label: "History", active: true },
  { icon: "dns", label: "Mock Servers" },
];

const footerNavItems = [
  { icon: "description", label: "Docs" },
  { icon: "delete", label: "Trash" },
];

export const SideNavBar: React.FC = () => {
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps lg:flex">
      <div className="flex items-center gap-3 border-b border-outline-variant p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-surface-container-highest">
          <span className="material-symbols-outlined text-primary">domain</span>
        </div>
        <div className="flex flex-col">
          <span className="truncate text-sm font-bold text-on-surface">Main Workspace</span>
          <span className="truncate text-xs text-on-surface-variant">Developer Team</span>
        </div>
      </div>

      <div className="p-3">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-highest py-2 transition-colors hover:bg-surface-container">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-code-sm uppercase text-code-sm">New Collection</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {mainNavItems.map((item) => (
          <button
            key={item.label}
            className={`w-full rounded px-3 py-2 text-left transition-all duration-200 ease-in-out ${
              item.active
                ? "rounded-lg bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="space-y-1 border-t border-outline-variant p-2 pb-16">
        {footerNavItems.map((item) => (
          <button
            key={item.label}
            className="w-full rounded px-3 py-2 text-left text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};
