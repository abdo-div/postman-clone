import React, { useState } from "react";
import { environments, productionVariables } from "./mockData";
import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { EnvironmentListPane } from "./environmentListPane";
import { EnvironmentEditor } from "./environmentEditor";

interface EnvironmentPageProps {
  onExit?: () => void;
  onImport?: () => void;
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ onExit, onImport }) => {
  const [activeId, setActiveId] = useState("prod");
  const active = environments.find((env) => env.id === activeId) ?? environments[0];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar onBrandClick={onExit} onImportClick={onImport} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />

        <main className="flex flex-1 overflow-hidden">
          <EnvironmentListPane
            environments={environments}
            activeId={active.id}
            onSelect={setActiveId}
          />
          <EnvironmentEditor
            key={active.id}
            name={active.name}
            isProd={active.name === "Production"}
            variables={productionVariables}
          />
        </main>
      </div>
    </div>
  );
};
