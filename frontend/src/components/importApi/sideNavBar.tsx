const workspace = { name: "Main Workspace", team: "Developer Team" };

const mainNavItems = [
  { icon: "folder", label: "Collections", active: true },
  { icon: "settings_input_component", label: "Environments" },
  { icon: "history", label: "History" },
  { icon: "dns", label: "Mock Servers" },
];

const footerNavItems = [
  { icon: "description", label: "Docs" },
  { icon: "delete", label: "Trash" },
];

export function SideNavBar() {
  return (
    <aside className="z-40 hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-200 ease-in-out md:flex">
      <div className="border-b border-outline-variant p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-container-highest">
            <span className="material-symbols-outlined text-primary">business</span>
          </div>
          <div>
            <h2 className="w-40 truncate font-headline-md text-sm text-primary">{workspace.name}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{workspace.team}</p>
          </div>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-high py-1.5 font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Collection
        </button>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {mainNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 font-label-caps uppercase tracking-wider transition-colors ${
              item.active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto border-t border-outline-variant p-2">
        {footerNavItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 font-label-caps uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
