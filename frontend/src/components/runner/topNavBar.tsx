import React from "react";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
}

const navItems = ["Workspaces", "Environments", "History"];

const actionIcons = ["settings", "help", "notifications"];

export const TopNavBar: React.FC<TopNavBarProps> = ({ onBrandClick, onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-12 w-full items-center justify-between border-b border-outline-variant bg-surface-container-low px-4">
      <div className="flex items-center gap-density-spacious">
        <button
          onClick={onBrandClick}
          className="mr-4 font-headline-md text-headline-md font-bold text-primary"
        >
          API Workbench
        </button>

        <div className="flex items-center rounded border border-slate-800 bg-slate-900 px-density-comfortable py-[2px] transition-colors focus-within:border-cyan-accent">
          <span className="material-symbols-outlined mr-2 text-[16px] text-slate-500">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="h-6 w-48 border-none bg-transparent p-0 font-code-sm text-code-sm text-on-surface outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <nav className="flex h-full items-center">
        <ul className="flex h-full">
          {navItems.map((item) => (
            <li
              key={item}
              onClick={() => onNavigate?.(item)}
              className="flex h-full cursor-pointer items-center px-4 text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
            >
              <span className="font-body-md text-body-md">{item}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-density-comfortable">
        <button className="rounded border border-slate-800 bg-slate-900 px-3 py-1 font-body-sm text-body-sm text-on-surface transition-colors hover:border-cyan-accent">
          Import
        </button>
        <button className="rounded bg-cyan-accent px-3 py-1 font-body-sm text-body-sm font-semibold text-slate-950 transition-opacity hover:opacity-90">
          Run Collection
        </button>
        <div className="ml-2 flex items-center gap-unit text-slate-400">
          {actionIcons.map((icon) => (
            <button key={icon} className="p-1 transition-colors hover:text-cyan-accent">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </button>
          ))}
          <img
            alt="User profile"
            className="ml-2 h-6 w-6 rounded-full border border-slate-700 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjbXEYqJT5gFkG1jVRbZEqJMaWbAVfdCpZxlPezyl7L2byP7cD2qnkYPQBXNRKpYUigH5-a0PpsHDyNzLnzuq9ADsfhxydKF9Cw-Ys9LPRmlsZbJUw_QCLYVUQljAAzW_DrjMOahdTcZFhxPxiehiLceUflOASD4R70kpIPCBHqoyyhl9s5nyY2AeD-8cgamH80sDKTkKij2SMJq_JL40aFKwS-NPA8FwIr1U6mUCLmlEBsXnPvOPO"
          />
        </div>
      </div>
    </header>
  );
};
