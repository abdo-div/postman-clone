import { TopNavBar as SharedTopNavBar } from "../layout/TopNavBar";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
  onBack?: () => void;
}

export function TopNavBar({ onBrandClick, onNavigate, onImportClick, onBack }: TopNavBarProps) {
  return (
    <SharedTopNavBar
      activeView="testEditor"
      onBrandClick={onBrandClick}
      onNavigate={onNavigate}
      onImportClick={onImportClick}
      onBack={onBack}
    />
  );
}
