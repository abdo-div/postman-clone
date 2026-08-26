export interface Command {
  id: string;
  label: string;
  section: string;
  shortcut?: string;
  action: string;
  icon?: string;
}

export const commands: Command[] = [
  // Navigation
  { id: "nav-workbench", label: "Go to Workbench", section: "Navigation", action: "workbench", icon: "terminal" },
  { id: "nav-environments", label: "Go to Environments", section: "Navigation", action: "environments", icon: "settings_input_component" },
  { id: "nav-history", label: "Go to History", section: "Navigation", action: "history", icon: "history" },
  { id: "nav-runner", label: "Go to Runner", section: "Navigation", action: "runner", icon: "play_arrow" },
  { id: "nav-import", label: "Go to Import", section: "Navigation", action: "import", icon: "upload" },
  { id: "nav-test-editor", label: "Go to Test Editor", section: "Navigation", action: "testEditor", icon: "science" },

  // Workbench actions
  { id: "send-request", label: "Send Request", section: "Workbench", action: "send", shortcut: "Ctrl+Enter", icon: "send" },
  { id: "save-request", label: "Save Request", section: "Workbench", action: "save", shortcut: "Ctrl+S", icon: "save" },
  { id: "new-collection", label: "New Collection", section: "Workbench", action: "newCollection", icon: "create_new_folder" },
  { id: "new-request", label: "New Request", section: "Workbench", action: "newRequest", icon: "add" },
  { id: "clear-response", label: "Clear Response", section: "Workbench", action: "clearResponse", icon: "delete_sweep" },

  // Environment actions
  { id: "new-env", label: "New Environment", section: "Environments", action: "newEnvironment", icon: "add" },

  // General
  { id: "toggle-theme", label: "Toggle Theme", section: "General", action: "toggleTheme", icon: "dark_mode" },
];
