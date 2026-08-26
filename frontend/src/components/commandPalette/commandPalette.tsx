import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { commands } from "./commands";
import type { Command } from "./commands";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: Command) => void;
}

export function CommandPalette({ isOpen, onClose, onExecute }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.section.toLowerCase().includes(lower),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.section) || [];
      arr.push(cmd);
      map.set(cmd.section, arr);
    }
    return map;
  }, [filtered]);

  // Focus input on open (state already fresh from remount via key prop)
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Keep active item in view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        onExecute(filtered[activeIndex]);
        onClose();
      }
    },
    [filtered, activeIndex, onClose, onExecute],
  );

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
          />
          <kbd className="rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 font-code-sm text-[10px] text-on-surface-variant">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <div className="py-8 text-center font-body-sm text-body-sm text-on-surface-variant">
              No matching commands
            </div>
          )}
          {Array.from(grouped.entries()).map(([section, cmds]) => (
            <div key={section}>
              <div className="px-3 py-1.5 font-label-caps text-label-caps text-on-surface-variant/60">
                {section}
              </div>
              {cmds.map((cmd) => {
                const idx = flatIndex++;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    data-index={idx}
                    onClick={() => {
                      onExecute(cmd);
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-body-sm text-body-sm transition-colors ${
                      isActive
                        ? "bg-surface-container-highest text-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {cmd.icon && (
                      <span className="material-symbols-outlined text-lg">{cmd.icon}</span>
                    )}
                    <span className="flex-1">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 font-code-sm text-[10px] text-on-surface-variant">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
