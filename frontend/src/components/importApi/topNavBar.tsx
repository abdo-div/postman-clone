import { BrandLogo } from "../layout/BrandLogo";

interface TopNavBarProps {
  onBrandClick?: () => void;
}

const navItems = [
  { label: "Workspaces", active: true },
  { label: "Environments" },
  { label: "History" },
];

const actionIcons = ["settings", "help", "notifications"];

export function TopNavBar({ onBrandClick }: TopNavBarProps) {
  return (
    <header className="z-50 flex h-12 w-full items-center justify-between border-b border-outline-variant bg-surface-container-low px-4">
      <div className="flex items-center gap-6">
        <button
          onClick={onBrandClick}
          className="font-headline-md text-headline-md font-bold text-primary"
        >
          <BrandLogo height={50} />
        </button>
        <nav className="flex h-full gap-4 pt-1">
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="border-b-2 border-primary pb-1 font-body-md text-body-md text-primary transition-transform duration-150 active:scale-95"
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                className="flex items-center rounded-t px-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-highest"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded bg-primary px-3 py-1 font-body-md text-body-md font-medium text-on-primary">
          Run Collection
        </button>
        <button className="rounded border border-outline-variant px-3 py-1 font-body-md text-body-md text-on-surface transition-colors hover:bg-surface-container-highest">
          Import
        </button>
        <div className="flex items-center gap-2 text-on-surface-variant">
          {actionIcons.map((icon) => (
            <span
              key={icon}
              className="material-symbols-outlined cursor-pointer text-[20px] transition-colors hover:text-on-surface"
            >
              {icon}
            </span>
          ))}
        </div>
        <img
          alt="User profile"
          className="h-8 w-8 rounded-full bg-surface-container-highest"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLxA0INbOyGFccImo9KHJybHRfc23gvd9Kz_zJwl1rQqSZAugB_5TkyYMBcIexSBx8eYEAJLMGue7O7pt8oA77ke9uRDy45IKN1_s5axDHd4SKBbGrsRUzgCcXjlFVDtGfcRNH8tDe40MAY6q23gOsYhflfFhd-OObv-VNoh7zorZpRIxHM3YetXZiNrRJIqTyE7kQBPQQjK84WLeNmYUOoHr2nKzN_y8qpMfbhq0LKKIidBz96467"
        />
      </div>
    </header>
  );
}
