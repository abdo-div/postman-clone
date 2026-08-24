import React, { useState } from "react";
import type { Environment } from "../../services/environmentService";

interface EnvironmentListPaneProps {
  environments: Environment[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd?: () => void;
}

export const EnvironmentListPane: React.FC<EnvironmentListPaneProps> = ({
  environments,
  activeId,
  onSelect,
  onAdd,
}) => {
  const [filter, setFilter] = useState("");
  const visible = environments.filter((env) =>
    env.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-outline-variant bg-panel-level-1">
      <div className="flex h-12 items-center justify-between border-b border-outline-variant px-4">
        <span className="font-headline-md text-sm text-on-surface">Environments</span>
        <button
          onClick={onAdd}
          className="text-on-surface-variant transition-colors hover:text-primary-container"
          title="New Environment"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      <div className="relative border-b border-outline-variant p-2">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
          filter_list
        </span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="w-full rounded border border-outline-variant bg-surface-dim py-1 pl-8 pr-2 font-code-sm text-sm text-on-surface focus:border-primary-container focus:outline-none"
        />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {visible.map((env) => {
          const isActive = env.id === activeId;
          return (
            <button
              key={env.id}
              onClick={() => onSelect(env.id)}
              className={`group flex w-full items-center rounded px-2 py-1.5 text-left font-body-sm transition-colors ${
                isActive
                  ? "justify-between border-l-2 border-primary-container bg-surface-container-highest font-semibold text-on-surface"
                  : "space-x-2 text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`material-symbols-outlined text-sm ${
                    isActive ? "text-primary-container" : "opacity-0 transition-opacity group-hover:opacity-100"
                  }`}
                >
                  check
                </span>
                <span>{env.name}</span>
                {env.isProd && (
                  <span className="text-[9px] border border-red-400/20 text-red-400 px-1 rounded">PROD</span>
                )}
              </div>
              {isActive && (
                <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-on-surface">
                  more_horiz
                </span>
              )}
            </button>
          );
        })}

        <div className="px-2 pb-2 pt-4 font-label-caps text-label-caps text-on-surface-variant">
          Globals
        </div>
        <button className="flex w-full items-center space-x-2 rounded px-2 py-1.5 text-left font-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest">
          <span className="material-symbols-outlined text-sm opacity-0">check</span>
          <span>Global Variables</span>
        </button>
      </div>
    </div>
  );
};
