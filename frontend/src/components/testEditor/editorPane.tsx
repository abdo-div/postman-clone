import React from "react";
import { snippetGroups } from "./mockData";

const codeLines: React.ReactNode[] = [
  <span className="code-comment">// Verify expected status code</span>,
  <>
    <span className="code-keyword">pm</span>.test(
    <span className="code-string">"Status is 200"</span>,{" "}
    <span className="code-keyword">function</span> {"() {"}
  </>,
  <>
    {"    "}
    <span className="code-keyword">pm</span>.response.to.have.status(
    <span className="code-highlight">200</span>);
  </>,
  <>{"});"}</>,
  <>{"\u00A0"}</>,
  <span className="code-comment">// Check for authentication token in response</span>,
  <>
    <span className="code-keyword">pm</span>.test(
    <span className="code-string">"Response body contains 'auth_token'"</span>,{" "}
    <span className="code-keyword">function</span> {"() {"}
  </>,
  <>
    {"    "}
    <span className="code-keyword">const</span> jsonData ={" "}
    <span className="code-keyword">pm</span>.response.json();
  </>,
  <>
    {"    "}
    <span className="code-keyword">pm</span>.expect(jsonData).to.have.property(
    <span className="code-string">'auth_token'</span>);
  </>,
  <>{"});"}</>,
  <>{"\u00A0"}</>,
  <span className="code-comment">// Performance assertion</span>,
  <>
    <span className="code-keyword">pm</span>.test(
    <span className="code-string">"Response time is less than 500ms"</span>,{" "}
    <span className="code-keyword">function</span> {"() {"}
  </>,
  <>
    {"    "}
    <span className="code-keyword">pm</span>.expect(
    <span className="code-keyword">pm</span>.response.responseTime).to.be.below(
    <span className="code-highlight">500</span>);
  </>,
  <>{"});"}</>,
];

export const EditorPane: React.FC = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-outline-variant lg:w-3/5 lg:border-r">
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-3 py-1.5">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          TEST SCRIPT
        </span>
        <div className="flex gap-2">
          <button
            title="Format Code"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">format_align_left</span>
          </button>
          <button
            title="Clear"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col overflow-auto bg-surface font-code-md text-code-md text-on-surface">
          <div className="flex min-h-max flex-1">
            <div className="flex shrink-0 select-none flex-col items-end border-r border-outline-variant bg-surface-container-lowest py-2 pr-2 text-on-surface-variant opacity-50">
              {codeLines.map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <div className="flex-1 whitespace-pre overflow-x-auto p-2">
              {codeLines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-48 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low">
          <div className="flex items-center justify-between border-b border-outline-variant px-3 py-2 font-label-caps text-label-caps text-on-surface-variant">
            SNIPPETS
            <span
              className="material-symbols-outlined cursor-help text-xs"
              title="Click to insert snippet"
            >
              info
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {snippetGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && <div className="my-1 h-px bg-outline-variant"></div>}
                {group.items.map((snippet) => (
                  <button
                    key={snippet.label}
                    title={snippet.title}
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
