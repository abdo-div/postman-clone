import { useState } from "react";
import type { Environment } from "../../services/environmentService";

interface EnvironmentListPaneProps {
  environments: Environment[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate?: (name: string) => void;
  onDelete?: (id: string, name: string) => void;
}

export function EnvironmentListPane({
  environments,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: EnvironmentListPaneProps) {
  const [filter, setFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const visible = environments.filter((env) =>
    env.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || !onCreate) {
      if (!name) setIsAdding(false);
      return;
    }
    onCreate(name);
    setNewName("");
    setIsAdding(false);
  };

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-outline-variant bg-panel-level-1">
      <div className="flex h-12 items-center justify-between border-b border-outline-variant px-4">
        <span className="font-headline-md text-sm text-on-surface">Environments</span>
        <button
          onClick={() => {
            setIsAdding((v) => !v);
            setNewName("");
          }}
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

      {isAdding && (
        <div className="border-b border-outline-variant p-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setIsAdding(false);
            }}
            onBlur={handleCreate}
            placeholder="Environment name..."
            className="w-full rounded border border-primary-container bg-surface-dim px-2 py-1 font-code-sm text-sm text-on-surface outline-none"
          />
          <p className="mt-1 px-1 text-[10px] text-on-surface-variant">
            Enter to create · Esc to cancel
          </p>
        </div>
      )}

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {visible.map((env) => {
          const isActive = env.id === activeId;
          return (
            <div
              key={env.id}
              onClick={() => onSelect(env.id)}
              className={`group flex w-full cursor-pointer items-center justify-between rounded px-2 py-1.5 text-left font-body-sm transition-colors ${
                isActive
                  ? "border-l-2 border-primary-container bg-surface-container-highest font-semibold text-on-surface"
                  : "border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`material-symbols-outlined text-sm ${
                    isActive ? "text-primary-container" : "opacity-0 transition-opacity group-hover:opacity-100"
                  }`}
                >
                  check
                </span>
                <span className="truncate">{env.name}</span>
                {env.isProd && (
                  <span className="rounded border border-red-400/20 px-1 text-[9px] text-red-400">
                    PROD
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete environment "${env.name}"?`)) onDelete?.(env.id, env.name);
                }}
                title="Delete environment"
                className="ml-1 shrink-0 text-on-surface-variant opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="px-2 py-6 text-center font-body-sm text-xs text-on-surface-variant">
            No environments found.
          </p>
        )}
      </div>

      <div className="border-t border-outline-variant p-2">
        <p className="px-2 pb-1 font-label-caps text-label-caps text-on-surface-variant">
          {environments.length} total
        </p>
      </div>
    </div>
  );
}
