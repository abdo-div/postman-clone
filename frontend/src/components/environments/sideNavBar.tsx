import React from "react";
import { workspace } from "./mockData";

const mainNavItems = [
  { icon: "folder", label: "Collections" },
  { icon: "settings_input_component", label: "Environments", active: true },
  { icon: "history", label: "History" },
  { icon: "dns", label: "Mock Servers" },
];

const footerNavItems = [
  { icon: "description", label: "Docs" },
  { icon: "delete", label: "Trash" },
];

export const SideNavBar: React.FC = () => {
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps text-primary transition-all duration-200 ease-in-out md:flex">
      <div className="flex items-center space-x-3 border-b border-outline-variant p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-container-high text-primary-container">
          <span className="material-symbols-outlined text-lg">business</span>
        </div>
        <div className="overflow-hidden">
          <div className="truncate font-headline-md text-headline-md leading-tight text-primary">
            {workspace.name}
          </div>
          <div className="truncate font-body-sm text-body-sm text-on-surface-variant">
            {workspace.team}
          </div>
        </div>
      </div>

      <div className="p-3">
        <button className="mb-2 flex w-full items-center justify-center space-x-2 rounded border border-outline-variant bg-surface-container-high py-2 text-on-surface transition-colors hover:bg-surface-container">
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Collection</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {mainNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
              item.active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-1 border-t border-outline-variant p-2">
        {footerNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
};
