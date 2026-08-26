import { SideNavBar as SharedSideNavBar } from "../layout/SideNavBar";

interface SideNavBarProps {
  onNavigate?: (item: string) => void;
  onBack?: () => void;
}

const NAV_ITEMS = [
  { icon: "folder", label: "Collections", view: "workbench" },
  { icon: "settings_input_component", label: "Environments", view: "environments" },
  { icon: "history", label: "History", view: "history" },
  { icon: "science", label: "Test Editor", view: "testEditor" },
];

export function SideNavBar({ onNavigate, onBack }: SideNavBarProps) {
  return (
    <SharedSideNavBar
      activeView="testEditor"
      onNavigate={onNavigate}
      onBack={onBack}
      navItems={NAV_ITEMS}
      headerIcon="science"
      headerTitle="Test Editor"
      headerSubtitle="Scripts & Assertions"
    />
  );
}
