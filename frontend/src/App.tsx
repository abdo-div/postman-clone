import { useState } from "react";
import { LandingPage } from "./components/landingPage";
import { CollectionRunnerPage } from "./components/runner/collectionRunnerPage";
import { EnvironmentPage } from "./components/environments/environmentPage";

export type View = "landing" | "runner" | "environments";

export default function App() {
  const [view, setView] = useState<View>("landing");

  if (view === "runner") {
    return (
      <CollectionRunnerPage
        onExit={() => setView("landing")}
        onNavigate={(item) => {
          if (item === "Environments") setView("environments");
        }}
      />
    );
  }

  if (view === "environments") {
    return <EnvironmentPage onExit={() => setView("landing")} />;
  }

  return <LandingPage onGetStarted={() => setView("runner")} />;
}
