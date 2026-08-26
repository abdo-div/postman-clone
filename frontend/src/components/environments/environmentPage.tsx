import React, { useEffect } from "react";
import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { EnvironmentListPane } from "./environmentListPane";
import { EnvironmentEditor } from "./environmentEditor";
import { useEnvironmentStore } from "../../store/useEnvironmentStore";
import { useToastStore } from "../../store/useToastStore";

interface EnvironmentPageProps {
  onExit?: () => void;
  onNavigate?: (view: string) => void;
  onImport?: () => void;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ onExit, onNavigate, onImport }) => {
  const { environments, activeEnvironmentId, setActiveEnvironmentId, loadEnvironments, addEnvironment, deleteEnvironment, isLoading } = useEnvironmentStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    loadEnvironments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = environments.find((e) => e.id === activeEnvironmentId) || environments[0];

  const handleCreateEnvironment = async (name: string) => {
    try {
      const created = await addEnvironment(name);
      addToast({ type: "success", title: "Environment created", description: created.name });
    } catch {
      addToast({ type: "error", title: "Could not create environment", description: "The name may already be in use." });
    }
  };

  const handleDeleteEnvironment = async (id: string, name: string) => {
    await deleteEnvironment(id);
    addToast({ type: "info", title: "Environment deleted", description: name });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar onBrandClick={onExit} onNavigate={onNavigate} onImportClick={onImport} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar onNavigate={onNavigate} />

        <main className="flex flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              Loading environments...
            </div>
          ) : (
            <>
              <EnvironmentListPane
                environments={environments}
                activeId={active?.id || ""}
                onSelect={setActiveEnvironmentId}
                onCreate={handleCreateEnvironment}
                onDelete={handleDeleteEnvironment}
              />
              {active ? (
                <EnvironmentEditor
                  key={active.id}
                  environmentId={active.id}
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl">dns</span>
                  <p className="font-body-md">No environment selected</p>
                  <p className="font-body-sm text-xs">Create one with the + button on the left.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
