import { useCallback, useEffect, useState } from "react";
import {
  LandingPage,
  CollectionRunnerPage,
  EnvironmentPage,
  ImportPage,
  HistoryPage,
  TestEditorPage,
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  MainWorkbench,
  ToastContainer,
  CommandPalette,
} from "./components";
import { useAuthStore, useWorkbenchStore } from "./store";

export type View =
  | "landing"
  | "signIn"
  | "signUp"
  | "forgotPassword"
  | "workbench"
  | "runner"
  | "environments"
  | "import"
  | "history"
  | "testEditor";

const WORKSPACE_VIEWS: View[] = ["workbench", "runner", "environments", "import", "history", "testEditor"];

export default function App() {
  const [view, setView] = useState<View>(() =>
    useAuthStore.getState().isAuthenticated ? "workbench" : "landing",
  );
  const [paletteOpen, setPaletteOpen] = useState(false);

  const pageViews: View[] = ["landing", "workbench", "runner", "environments", "import", "history", "testEditor"];
  const handlePageNavigate = (target: string) => {
    if (pageViews.includes(target as View)) setView(target as View);
  };

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (WORKSPACE_VIEWS.includes(view)) {
          setPaletteOpen((o) => !o);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view]);

  const handleCommand = useCallback(
    (cmd: { action: string }) => {
      const wb = useWorkbenchStore.getState();
      switch (cmd.action) {
        // Navigation
        case "workbench":
        case "environments":
        case "history":
        case "runner":
        case "import":
        case "testEditor":
          setView(cmd.action as View);
          break;
        // Workbench actions
        case "send":
          setView("workbench");
          // Trigger send via a small delay to let the view render
          setTimeout(() => document.dispatchEvent(new CustomEvent("wb-send")), 50);
          break;
        case "save":
          document.dispatchEvent(new CustomEvent("wb-save"));
          break;
        case "clearResponse":
          wb.clearResponse();
          break;
        case "newCollection":
          setView("workbench");
          setTimeout(() => document.dispatchEvent(new CustomEvent("wb-new-collection")), 50);
          break;
        case "newRequest":
          setView("workbench");
          setTimeout(() => document.dispatchEvent(new CustomEvent("wb-new-request")), 50);
          break;
      }
    },
    [],
  );

  let content: React.ReactNode;

  if (view === "workbench") {
    content = (
      <MainWorkbench
        onNavigate={handlePageNavigate}
        onImport={() => setView("import")}
        onLogout={() => setView("landing")}
      />
    );
  } else if (view === "runner") {
    content = (
      <CollectionRunnerPage
        onExit={() => setView("workbench")}
        onNavigate={handlePageNavigate}
        onImport={() => setView("import")}
      />
    );
  } else if (view === "environments") {
    content = (
      <EnvironmentPage
        onExit={() => setView("workbench")}
        onNavigate={handlePageNavigate}
        onImport={() => setView("import")}
      />
    );
  } else if (view === "history") {
    content = (
      <HistoryPage
        onExit={() => setView("workbench")}
        onNavigate={handlePageNavigate}
        onImport={() => setView("import")}
        onOpenRequest={() => setView("testEditor")}
      />
    );
  } else if (view === "testEditor") {
    content = (
      <TestEditorPage
        onBack={() => setView("workbench")}
        onNavigate={handlePageNavigate}
        onImport={() => setView("import")}
      />
    );
  } else if (view === "import") {
    content = <ImportPage onExit={() => setView("workbench")} />;
  } else if (view === "signIn") {
    content = (
      <SignInPage
        onSuccess={() => setView("workbench")}
        onSwitchToSignUp={() => setView("signUp")}
        onForgotPassword={() => setView("forgotPassword")}
      />
    );
  } else if (view === "forgotPassword") {
    content = <ForgotPasswordPage onBack={() => setView("signIn")} />;
  } else if (view === "signUp") {
    content = (
      <SignUpPage
        onSuccess={() => setView("workbench")}
        onSwitchToSignIn={() => setView("signIn")}
      />
    );
  } else {
    content = <LandingPage onGetStarted={() => setView("signIn")} />;
  }

  return (
    <>
      {content}
      <ToastContainer />
      {WORKSPACE_VIEWS.includes(view) && (
        <CommandPalette
          key={paletteOpen ? "open" : "closed"}
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onExecute={handleCommand}
        />
      )}
    </>
  );
}
