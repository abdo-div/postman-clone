import React, { useEffect, useMemo, useRef, useState } from "react";
import { commandSections } from "./commands";
import type { CommandItem } from "./commands";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onExecute?: (id: string) => void;
}

function matches(item: CommandItem, query: string) {
  return item.label.toLowerCase().includes(query.toLowerCase());
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, onExecute }) => {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filteredSections = useMemo(
    () =>
      commandSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => matches(item, query)),
        }))
        .filter((section) => section.items.length > 0),
    [query],
  );

  const flatItems = useMemo(
    () => filteredSections.flatMap((section) => section.items),
    [filteredSections],
  );

  const indexedSections = useMemo(
    () =>
      filteredSections.map((section, i) => ({
        ...section,
        start: filteredSections.slice(0, i).reduce((sum, s) => sum + s.items.length, 0),
      })),
    [filteredSections],
  );

  if (!open) return null;

  const execute = (item: CommandItem | undefined) => {
    if (!item) return;
    onExecute?.(item.id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (flatItems.length === 0 ? 0 : (i + 1) % flatItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (flatItems.length === 0 ? 0 : (i - 1 + flatItems.length) % flatItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(flatItems[index]);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/70 px-4 pt-[122px] backdrop-blur-[4px] sm:px-0"
    >
      <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl shadow-black/80">
        {/* Search Input */}
        <div className="group relative flex items-center border-b border-outline-variant bg-surface-container-highest px-4 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-inset focus-within:ring-primary">
          <span className="material-symbols-outlined ml-1 shrink-0 text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full select-none border-none bg-transparent py-5 px-4 font-code-md text-on-surface outline-none placeholder:text-on-surface-variant selection:bg-primary/30"
          />
          <div className="hidden shrink-0 items-center sm:flex">
            <kbd className="rounded border border-outline-variant bg-surface px-1.5 py-0.5 font-code-sm uppercase tracking-wider text-[10px] text-on-surface-variant">
              esc
            </kbd>
          </div>
        </div>

        {/* Command List */}
        <div className="custom-scrollbar flex max-h-[512px] flex-col overflow-y-auto p-2">
          {indexedSections.map((section, sectionIdx) => (
            <React.Fragment key={section.title}>
              <div
                className={`mb-0.5 flex items-center justify-between px-3 py-2 ${
                  sectionIdx > 0 ? "mt-2 border-t border-outline-variant/50" : "mt-1"
                }`}
              >
                <span className="font-label-caps tracking-widest text-label-caps text-on-surface-variant">
                  {section.title}
                </span>
              </div>
              {section.items.map((item, itemIdx) => {
                const current = section.start + itemIdx;
                const isActive = current === index;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setIndex(current)}
                    onClick={() => execute(item)}
                    className={`group relative mb-0.5 flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "border-primary/30 bg-surface-container"
                        : "border-transparent hover:border-outline-variant/50 hover:bg-surface-container"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute bottom-0 left-0 top-0 w-0.5 rounded-l bg-primary"></div>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110 ${
                          isActive
                            ? "text-primary"
                            : item.accentOnHover === "secondary"
                              ? "text-on-surface-variant group-hover:text-secondary-container"
                              : "text-on-surface-variant group-hover:text-primary"
                        }`}
                      >
                        <span
                          style={
                            item.filled && isActive
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                          className="material-symbols-outlined text-[20px]"
                        >
                          {item.icon}
                        </span>
                      </div>
                      <span
                        className={`font-body-md transition-colors ${
                          isActive
                            ? "font-medium text-on-surface"
                            : "text-on-surface-variant group-hover:text-on-surface"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.shortcut && (
                      <div
                        className={`flex items-center gap-1 transition-opacity ${
                          isActive ? "opacity-80" : "opacity-60 group-hover:opacity-100"
                        }`}
                      >
                        {item.shortcut.map((key) => (
                          <kbd
                            key={key}
                            className="rounded border border-outline-variant bg-surface px-1.5 py-0.5 font-code-sm shadow-sm text-code-sm text-on-surface-variant"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
          {flatItems.length === 0 && (
            <p className="px-3 py-6 text-center font-body-md text-body-md text-on-surface-variant">
              No commands match "{query}"
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-4 py-2">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
              <span className="-ml-1 material-symbols-outlined text-[14px]">
                keyboard_arrow_down
              </span>
              <span className="font-body-sm text-[11px]">to navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">keyboard_return</span>
              <span className="font-body-sm text-[11px]">to select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-body-sm uppercase tracking-wider text-[10px] text-on-surface-variant">
              Obsidian Flux
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
