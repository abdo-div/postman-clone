import React from "react";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
}

const navItems = [
  { label: "Workspaces" },
  { label: "Environments", active: true },
  { label: "History" },
];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onBrandClick,
  onNavigate,
  onImportClick,
}) => {
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
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="flex h-12 items-center border-b-2 border-primary px-2 pb-1 font-body-md text-body-md text-primary transition-colors hover:bg-surface-container-highest active:scale-95"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                onClick={() => onNavigate?.(item.label)}
                className="flex h-12 items-center px-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      </div>

      <div className="flex items-center gap-density-comfortable">
        <div className="relative mr-2 hidden md:flex">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-48 rounded border border-outline-variant bg-surface py-1 pl-8 pr-3 font-code-sm text-code-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
          />
        </div>
        <button
          onClick={() => onImportClick?.()}
          className="rounded border border-outline-variant bg-surface px-3 py-1.5 font-body-sm text-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
        >
          Import
        </button>
        <button className="rounded bg-primary-container px-3 py-1.5 font-body-sm text-body-sm font-medium text-on-primary-container transition-opacity hover:opacity-90">
          Run Collection
        </button>

        <div className="ml-density-compact flex items-center gap-1 border-l border-outline-variant pl-density-comfortable">
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
            className="relative rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error"></span>
          </button>
          <button className="ml-1 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary-container font-bold text-xs text-on-secondary-container">
            <img
              alt="User profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuChRRpSmG8sdgcG9UyuQz2si8OaGiOr2P0FEIxBMSE7ICqJOxS0gQ9JqWj2gJCa8NU1iabOr2_802eXIqLjPSPh0qrmmoJeM24YZyWuUt5qcSdE_WjPf1kxcVsNG0a69h_RePqvve_VLY68hTVmiPeLUgAFLiXdfh2qVTJy1Fe2889kcEd-9Zu07mIPby9jqmBTRjMJdDVdPKseZrn10ieiXPYZmTjC9YVdFLbRqCcvi6URx0Qeybwo"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
