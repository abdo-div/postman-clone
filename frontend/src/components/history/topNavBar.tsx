import { TopNavBar as SharedTopNavBar } from "../layout/TopNavBar";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
}

const NAV_ITEMS = [
  { label: "Workbench", view: "workbench" },
  { label: "Environments", view: "environments" },
  { label: "History", view: "history" },
  { label: "Collection Runner", view: "runner" },
];

export function TopNavBar({ onBrandClick, onNavigate, onImportClick }: TopNavBarProps) {
  return (
    <SharedTopNavBar
      activeView="history"
      onBrandClick={onBrandClick}
      onNavigate={onNavigate}
      onImportClick={onImportClick}
      navItems={NAV_ITEMS}
    />
  );
}
