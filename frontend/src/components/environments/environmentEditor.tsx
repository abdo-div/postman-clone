import React, { useState } from "react";
import type { EnvironmentVariable } from "./types";

interface EnvironmentEditorProps {
  name: string;
  isProd?: boolean;
  variables: EnvironmentVariable[];
}

const tabs = ["Variables", "Details"] as const;
type Tab = (typeof tabs)[number];

let nextId = 1;

export const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({
  name,
  isProd = false,
  variables: initial,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("Variables");
  const [showSecrets, setShowSecrets] = useState(false);
  const [variables, setVariables] = useState<EnvironmentVariable[]>(initial);

  const updateVariable = (id: string, patch: Partial<EnvironmentVariable>) => {
    setVariables((vars) => vars.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const removeVariable = (id: string) => {
    setVariables((vars) => vars.filter((v) => v.id !== id));
  };

  const addVariable = () => {
    setVariables((vars) => [
      ...vars,
      { id: `new-${nextId++}`, key: "", initialValue: "", currentValue: "", secret: false, description: "" },
    ]);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-panel-level-1">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant px-4">
        <div className="flex items-center space-x-3">
          <span className="font-headline-md text-base text-on-surface">{name}</span>
          {isProd && (
            <span className="rounded-full border border-error/20 bg-error-container px-2 py-0.5 font-label-caps text-[9px] text-on-error-container">
              PROD
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export</span>
          </button>
          <button className="ml-1 flex items-center space-x-1 rounded border-l border-outline-variant px-2 py-1 pl-3 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 border-b border-outline-variant bg-surface-dim">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 border-t-2 px-4 py-2 font-body-sm ${
              tab === activeTab
                ? "border-primary-container bg-panel-level-1 font-semibold text-on-surface"
                : "border-transparent text-on-surface-variant hover:bg-surface-container-highest"
            } ${tab === "Details" ? "border-r border-outline-variant" : ""}`}
          >
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {activeTab === "Variables" ? (
        <>
          <div className="flex shrink-0 items-center space-x-2 border-b border-outline-variant p-2">
            <button
              onClick={addVariable}
              className="flex items-center space-x-1 rounded border border-outline-variant bg-surface-container-high px-2 py-1 font-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Variable</span>
            </button>
            <button
              onClick={() => setShowSecrets((s) => !s)}
              className="flex items-center space-x-1 rounded border border-outline-variant bg-surface-container-high px-2 py-1 font-body-sm text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-sm">
                {showSecrets ? "visibility_off" : "visibility"}
              </span>
              <span>{showSecrets ? "Hide Secrets" : "View Secrets"}</span>
            </button>
            <div className="flex-1"></div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Find variable..."
                className="w-48 rounded border border-outline-variant bg-surface-dim py-0.5 pl-7 pr-2 font-code-sm text-xs text-on-surface focus:border-primary-container focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-surface-dim p-4">
            <table className="ss-table font-code-md">
              <thead>
                <tr>
                  <th className="ss-th w-8 px-1 text-center">
                    <input defaultChecked type="checkbox" className="h-3 w-3 rounded" />
                  </th>
                  <th className="ss-th w-48">Variable</th>
                  <th className="ss-th">Initial Value</th>
                  <th className="ss-th">Current Value</th>
                  <th className="ss-th w-16 text-center" title="Secret">
                    Sec
                  </th>
                  <th className="ss-th">Description</th>
                  <th className="ss-th w-8 px-1"></th>
                </tr>
              </thead>
              <tbody>
                {variables.map((variable) => {
                  const masked = variable.secret && !showSecrets;
                  return (
                    <tr key={variable.id} className="ss-row group">
                      <td className="ss-td px-1 text-center">
                        <input defaultChecked type="checkbox" className="h-3 w-3 rounded" />
                      </td>
                      <td className="ss-td">
                        <input
                          className="ss-input-ghost text-primary-fixed-dim"
                          type="text"
                          value={variable.key}
                          onChange={(e) => updateVariable(variable.id, { key: e.target.value })}
                        />
                      </td>
                      <td className={`ss-td ${masked ? "relative" : ""}`}>
                        <input
                          className={`ss-input-ghost ${variable.secret ? "text-on-surface-variant" : ""}`}
                          type={masked ? "password" : "text"}
                          readOnly={masked}
                          value={variable.initialValue}
                          onChange={(e) =>
                            updateVariable(variable.id, { initialValue: e.target.value })
                          }
                        />
                        {masked && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-outline-variant bg-surface-container-high px-1 text-[10px] text-on-surface-variant">
                            MASKED
                          </span>
                        )}
                      </td>
                      <td className="ss-td">
                        <input
                          className={`ss-input-ghost ${variable.secret ? "text-on-surface-variant" : ""}`}
                          type={masked ? "password" : "text"}
                          readOnly={masked}
                          value={variable.currentValue}
                          onChange={(e) =>
                            updateVariable(variable.id, { currentValue: e.target.value })
                          }
                        />
                      </td>
                      <td className="ss-td text-center">
                        <button
                          onClick={() =>
                            updateVariable(variable.id, { secret: !variable.secret })
                          }
                          className={
                            variable.secret
                              ? "text-primary-container hover:text-primary-fixed"
                              : "text-on-surface-variant hover:text-on-surface"
                          }
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {variable.secret ? "lock" : "lock_open"}
                          </span>
                        </button>
                      </td>
                      <td className="ss-td">
                        <input
                          className="ss-input-ghost font-body-sm text-on-surface-variant"
                          type="text"
                          value={variable.description}
                          onChange={(e) =>
                            updateVariable(variable.id, { description: e.target.value })
                          }
                        />
                      </td>
                      <td className="ss-td px-1 text-center">
                        <button
                          onClick={() => removeVariable(variable.id)}
                          className="text-on-surface-variant opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                <tr className="ss-row">
                  <td className="ss-td px-1 text-center">
                    <input disabled type="checkbox" className="h-3 w-3 rounded" />
                  </td>
                  <td className="ss-td">
                    <input className="ss-input-ghost" type="text" placeholder="New Variable" />
                  </td>
                  <td className="ss-td">
                    <input className="ss-input-ghost" type="text" placeholder="Initial Value" />
                  </td>
                  <td className="ss-td">
                    <input className="ss-input-ghost" type="text" placeholder="Current Value" />
                  </td>
                  <td className="ss-td text-center"></td>
                  <td className="ss-td">
                    <input className="ss-input-ghost font-body-sm" type="text" placeholder="Description" />
                  </td>
                  <td className="ss-td px-1 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto bg-surface-dim p-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Environment details will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
