import React from "react";

interface TopNavBarProps {
  onBrandClick?: () => void;
}

const navItems = [
  { label: "Workspaces" },
  { label: "Environments", active: true },
  { label: "History" },
];

const actionIcons = ["settings", "help", "notifications"];

export const TopNavBar: React.FC<TopNavBarProps> = ({ onBrandClick }) => {
  return (
    <nav className="z-50 flex h-12 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 font-body-md text-body-md">
      <div className="flex h-full items-center space-x-6">
        <button
          onClick={onBrandClick}
          className="font-headline-md text-headline-md font-bold text-primary"
        >
          API Workbench
        </button>
        <div className="hidden h-full items-center space-x-1 md:flex">
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="mt-1 flex h-full items-center border-b-2 border-primary px-3 pb-1 text-primary"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                className="flex h-full items-center rounded px-3 py-1 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-highest active:scale-95"
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-48 rounded border border-outline-variant bg-surface-container-lowest py-1 pl-8 pr-3 font-code-sm text-sm text-on-surface transition-colors focus:border-primary-container focus:outline-none"
          />
        </div>
        <button className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface active:scale-95">
          Import
        </button>
        <button className="rounded bg-primary-container px-3 py-1 text-sm font-semibold text-surface-dim transition-colors hover:bg-primary-fixed active:scale-95">
          Run Collection
        </button>
        <div className="ml-2 flex items-center space-x-2 border-l border-outline-variant pl-4">
          {actionIcons.map((icon) => (
            <button
              key={icon}
              className="p-1 text-on-surface-variant transition-colors hover:text-on-surface active:scale-95"
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
          <img
            alt="User profile"
            className="h-7 w-7 cursor-pointer rounded-full ring-primary-container transition-all hover:ring-2"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_XDgy3SgxFP7XLgOQbemY1IqwkN7rXzmSFPtAYa8qv6xXss3Iu3Z7oVKY6VGcca3IZRsc5Yt_ii4OmKkKEwnpsUM7GNk-V47Cnkl7MdfNQZ0gabDp5WixQ5ks1DgmVZ68_woi2MMenpT9Wvkl2_-ToIpV2ulo7nltH0zmYoydXJmi7jTBV61zqW3ufTdzQcNBJsbIwfzMbZrQpMbE6iOF5XVhzCEYRbWPhJhneM59QNCwSE-8jc_1"
          />
        </div>
      </div>
    </nav>
  );
};
