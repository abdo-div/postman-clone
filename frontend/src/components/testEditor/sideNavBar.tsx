import React from "react";

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
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-200 ease-in-out md:flex">
      <div className="flex items-center gap-3 border-b border-outline-variant p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-container-high">
          <img
            alt="Organization Logo"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcsRxMPIyhR9zBUX3g0Zz4RwWM1IbrB1rYBqkBUN1Z0qktlf6OLni0ApBDx9YkhcVnR_-xnekfCiPczSzmJzBA6IW0hlgHM19SuG10VjvRkfv7aRWdzcocEMrdHnhXjEyhSzOZUI3PdxZK2LGOfpEKA9BMJvhGoFKqZ37XyQoX_OTtOaH2U6650iIMPrp0Z3VfgoR2hg0A1eR_1czr3fXWCeSyz0sBkLnH24lHirLy10JaFOzZq9E9"
          />
        </div>
        <div className="overflow-hidden">
          <h2 className="truncate font-headline-md text-headline-md leading-tight text-primary">
            Main Workspace
          </h2>
          <p className="truncate font-body-sm text-body-sm text-on-surface-variant">
            Developer Team
          </p>
        </div>
      </div>

      <div className="p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container py-2 font-body-sm text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest">
          <span className="material-symbols-outlined text-sm">add</span>
          New Collection
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2 font-label-caps text-label-caps">
        {mainNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
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

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant p-2 font-label-caps text-label-caps">
        {footerNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-lg group-hover:text-on-surface">
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
};
