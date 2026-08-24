import { useState } from "react";
import { LandingPage } from "./components/landingPage";
import { CollectionRunnerPage } from "./components/runner/collectionRunnerPage";
import { EnvironmentPage } from "./components/environments/environmentPage";
import { ImportPage } from "./components/importApi/importPage";
import { HistoryPage } from "./components/history/historyPage";

export type View = "landing" | "runner" | "environments" | "import" | "history";

export default function App() {
  const [view, setView] = useState<View>("landing");

  if (view === "runner") {
    return (
      <CollectionRunnerPage
        onExit={() => setView("landing")}
        onNavigate={(item) => {
          if (item === "Environments") setView("environments");
          if (item === "History") setView("history");
        }}
        onImport={() => setView("import")}
      />
    );
  }

  if (view === "environments") {
    return (
      <EnvironmentPage
        onExit={() => setView("landing")}
        onImport={() => setView("import")}
      />
    );
  }

  if (view === "history") {
    return (
      <HistoryPage
        onExit={() => setView("landing")}
        onNavigate={(item) => {
          if (item === "Environments") setView("environments");
        }}
        onImport={() => setView("import")}
      />
    );
  }

  if (view === "import") {
    return <ImportPage onExit={() => setView("landing")} />;
  }

  return <LandingPage onGetStarted={() => setView("runner")} />;
}
