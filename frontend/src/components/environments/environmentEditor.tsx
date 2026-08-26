import { useState } from "react";
import { useEnvironmentStore } from "../../store/useEnvironmentStore";
import { useToastStore } from "../../store/useToastStore";

interface EnvironmentEditorProps {
  environmentId: string;
}

const tabs = ["Variables", "Details"] as const;
type Tab = (typeof tabs)[number];

export function EnvironmentEditor({ environmentId }: EnvironmentEditorProps) {
  const { environments, addVariable, updateVariable, deleteVariable, updateEnvironmentName, saveEnvironmentChanges } = useEnvironmentStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<Tab>("Variables");
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const env = environments.find((e) => e.id === environmentId);
  if (!env) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveEnvironmentChanges(env.id);
      addToast({ type: "success", title: "Environment saved", description: env.name });
    } catch {
      addToast({ type: "error", title: "Save failed", description: "Could not reach the server." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-panel-level-1">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant px-4">
        <div className="flex items-center space-x-3">
          <span className="font-headline-md text-base text-on-surface">{env.name}</span>
          {env.isProd && (
            <span className="rounded-full border border-error/20 bg-error-container px-2 py-0.5 font-label-caps text-[9px] text-on-error-container">
              PROD
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSecrets((v) => !v)}
            className="flex items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">{showSecrets ? "visibility_off" : "visibility"}</span>
            <span>{showSecrets ? "Hide" : "Show"} Secrets</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-1 flex items-center space-x-1 rounded border-l border-outline-variant px-2 py-1 pl-3 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
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

      {activeTab === "Variables" && (
        <>
          <div className="flex shrink-0 items-center space-x-2 border-b border-outline-variant p-2">
            <div className="grid flex-1 grid-cols-4 gap-1 px-1 font-label-caps text-label-caps text-on-surface-variant">
              <span>Key</span>
              <span>Initial Value</span>
              <span>Current Value</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">lock</span> Secret
              </span>
            </div>
            <div className="w-8"></div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {env.variables.map((v) => (
              <div
                key={v.id}
                className="grid items-center border-b border-outline-variant/50 px-3 py-1.5 hover:bg-surface-container-highest grid-cols-4 gap-2 group"
              >
                <input
                  value={v.key}
                  onChange={(e) => updateVariable(env.id, v.id, { key: e.target.value })}
                  className="bg-transparent border-b border-transparent focus:border-primary-container text-on-surface font-code-sm text-sm outline-none w-full"
                  placeholder="variable_name"
                />
                <input
                  value={v.initialValue}
                  type={v.secret && !showSecrets ? "password" : "text"}
                  onChange={(e) => updateVariable(env.id, v.id, { initialValue: e.target.value })}
                  className="bg-transparent border-b border-transparent focus:border-primary-container text-on-surface-variant font-code-sm text-sm outline-none w-full"
                  placeholder="initial value"
                />
                <input
                  value={v.currentValue}
                  type={v.secret && !showSecrets ? "password" : "text"}
                  onChange={(e) => updateVariable(env.id, v.id, { currentValue: e.target.value })}
                  className="bg-transparent border-b border-transparent focus:border-primary-container text-on-surface font-code-sm text-sm outline-none w-full"
                  placeholder="current value"
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(v.secret)}
                      onChange={(e) => updateVariable(env.id, v.id, { secret: e.target.checked })}
                      className="accent-red-400 w-3 h-3"
                    />
                    <span className="text-xs text-on-surface-variant">Secret</span>
                  </label>
                  <button
                    onClick={() => deleteVariable(env.id, v.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error"
                    title="Delete variable"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addVariable(env.id)}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-on-surface-variant hover:text-primary-container hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Variable
            </button>
          </div>
        </>
      )}

      {activeTab === "Details" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Environment Name</label>
              <input
                value={env.name}
                onChange={(e) => updateEnvironmentName(env.id, e.target.value)}
                className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-2 text-on-surface outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Total Variables</label>
              <p className="text-on-surface">{env.variables.length}</p>
            </div>
            {env.isProd && (
              <div className="rounded-lg border border-error/30 bg-error-container/20 p-4 text-sm text-error">
                <span className="material-symbols-outlined text-sm mr-1">warning</span>
                This is a Production environment. Be careful when editing variables.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
