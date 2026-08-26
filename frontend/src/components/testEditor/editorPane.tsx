import React, { useRef } from "react";
import { snippetGroups } from "./mockData";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split("\n");

  const insertSnippet = (snippet: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value ? value + "\n" + snippet : snippet);
      return;
    }
    const start = ta.selectionStart;
    const before = value.slice(0, start);
    const after = value.slice(ta.selectionEnd);
    const needsNewline = before.length > 0 && !before.endsWith("\n");
    const insertion = (needsNewline ? "\n" : "") + snippet + "\n";
    const next = before + insertion + after;
    onChange(next);
    requestAnimationFrame(() => {
      const pos = start + insertion.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleClear = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col border-outline-variant lg:w-3/5 lg:border-r">
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-3 py-1.5">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          TEST SCRIPT
        </span>
        <div className="flex gap-2">
          <button
            title="Format Code"
            onClick={() => {
              try {
                const formatted = value
                  .split("\n")
                  .map((l) => l.trimEnd())
                  .join("\n")
                  .replace(/\n{3,}/g, "\n\n");
                onChange(formatted);
              } catch {
                /* no-op */
              }
            }}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">format_align_left</span>
          </button>
          <button
            title="Clear"
            onClick={handleClear}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Editor area */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Line numbers */}
          <div className="flex shrink-0 select-none flex-col items-end border-r border-outline-variant bg-surface-container-lowest py-2 pr-2 text-on-surface-variant opacity-50">
            {lines.map((_, index) => (
              <span key={index} className="font-code-sm text-code-sm leading-[1.6]">
                {index + 1}
              </span>
            ))}
          </div>

          {/* Editable textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder={`// Write test assertions using pm.test and pm.expect\npm.test("Status is 200", function () {\n    pm.response.to.have.status(200);\n});\n\npm.test("Response is valid JSON", function () {\n    const data = pm.response.json();\n    pm.expect(data).to.be.a("object");\n});`}
            className="flex-1 resize-none bg-surface p-2 font-code-md text-code-md text-on-surface outline-none leading-[1.6]"
          />
        </div>

        {/* Snippets sidebar */}
        <div className="flex w-48 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low">
          <div className="flex items-center justify-between border-b border-outline-variant px-3 py-2 font-label-caps text-label-caps text-on-surface-variant">
            SNIPPETS
            <span
              className="material-symbols-outlined cursor-help text-xs"
              title="Click to insert snippet at cursor"
            >
              info
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {snippetGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="my-1 h-px bg-outline-variant" />
                )}
                {group.items.map((snippet) => (
                  <button
                    key={snippet.label}
                    title={snippet.title}
                    onClick={() => insertSnippet(snippet.snippet)}
                    className={`truncate rounded px-2 py-1.5 text-left font-body-sm text-body-sm transition-colors hover:bg-surface-container-highest ${
                      snippet.accent ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {snippet.label}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
