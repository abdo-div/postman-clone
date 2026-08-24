export interface CommandItem {
  id: string;
  label: string;
  icon: string;
  filled?: boolean;
  accentOnHover?: "primary" | "secondary";
  shortcut?: string[];
}

export interface CommandSection {
  title: string;
  items: CommandItem[];
}

export const commandSections: CommandSection[] = [
  {
    title: "Suggestions",
    items: [
      {
        id: "new-request",
        label: "New Request",
        icon: "add_box",
        filled: true,
        shortcut: ["Ctrl", "N"],
      },
      { id: "new-collection", label: "New Collection", icon: "folder_open" },
      { id: "import-openapi", label: "Import OpenAPI Definition", icon: "upload_file" },
    ],
  },
  {
    title: "Environment",
    items: [
      {
        id: "switch-environment",
        label: "Switch Environment...",
        icon: "dns",
        accentOnHover: "secondary",
      },
    ],
  },
  {
    title: "Actions",
    items: [
      { id: "run-collection", label: "Run Collection", icon: "play_arrow" },
      { id: "open-settings", label: "Open Settings", icon: "settings", shortcut: ["Ctrl", ","] },
    ],
  },
];
