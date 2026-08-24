import { useState } from "react";
import { LandingPage } from "./components/landingPage";
import { CollectionRunnerPage } from "./components/runner/collectionRunnerPage";
import { EnvironmentPage } from "./components/environments/environmentPage";
import { ImportPage } from "./components/importApi/importPage";
import { HistoryPage } from "./components/history/historyPage";
import { TestEditorPage } from "./components/testEditor/testEditorPage";
import { SignInPage } from "./components/auth/signInPage";
import { SignUpPage } from "./components/auth/signUpPage";
import { ForgotPasswordPage } from "./components/auth/forgotPasswordPage";
import { MainWorkbench } from "./components/mainWorkbench";
import { ToastContainer } from "./components/common/ToastContainer";
import { useAuthStore } from "./store/useAuthStore";

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

export default function App() {
  const [view, setView] = useState<View>(() =>
    useAuthStore.getState().isAuthenticated ? "workbench" : "landing",
  );

  let content: React.ReactNode;

  if (view === "workbench") {
    content = (
      <MainWorkbench
        onNavigate={(target) => setView(target)}
        onImport={() => setView("import")}
        onLogout={() => setView("landing")}
      />
    );
  } else if (view === "runner") {
    content = (
      <CollectionRunnerPage
        onExit={() => setView("workbench")}
        onNavigate={(item) => {
          if (item === "Environments") setView("environments");
          if (item === "History") setView("history");
        }}
        onImport={() => setView("import")}
      />
    );
  } else if (view === "environments") {
    content = (
      <EnvironmentPage
        onExit={() => setView("workbench")}
        onImport={() => setView("import")}
      />
    );
  } else if (view === "history") {
    content = (
      <HistoryPage
        onExit={() => setView("workbench")}
        onNavigate={(item) => {
          if (item === "Environments") setView("environments");
        }}
        onImport={() => setView("import")}
        onOpenRequest={() => setView("testEditor")}
      />
    );
  } else if (view === "testEditor") {
    content = <TestEditorPage />;
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
    </>
  );
}
