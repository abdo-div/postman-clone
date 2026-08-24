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
  const { environments, activeEnvironmentId, setActiveEnvironmentId, loadEnvironments, addEnvironment, isLoading } = useEnvironmentStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    loadEnvironments();
  }, []);

  const active = environments.find((e) => e.id === activeEnvironmentId) || environments[0];

  const handleAddEnvironment = async () => {
    const name = prompt("Enter Environment name (e.g. Staging, Production):");
    if (name && name.trim()) {
      const created = await addEnvironment(name.trim());
      addToast({ type: "success", title: "Environment created", description: created.name });
    }
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
                onAdd={handleAddEnvironment}
              />
              {active && (
                <EnvironmentEditor
                  key={active.id}
                  environmentId={active.id}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
