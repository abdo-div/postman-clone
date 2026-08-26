import { SideNavBar as SharedSideNavBar } from "../layout/SideNavBar";
import { useAuthStore } from "../../store/useAuthStore";

interface SideNavBarProps {
  onNavigate?: (view: string) => void;
}

const NAV_ITEMS = [
  { icon: "folder", label: "Collections", view: "workbench" },
  { icon: "settings_input_component", label: "Environments", view: "environments" },
  { icon: "history", label: "History", view: "history" },
  { icon: "play_arrow", label: "Runner", view: "runner" },
];

export function SideNavBar({ onNavigate }: SideNavBarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <SharedSideNavBar
      activeView="environments"
      onNavigate={onNavigate}
      navItems={NAV_ITEMS}
      headerTitle="API Workspace"
      headerSubtitle={user?.email || "Personal Workspace"}
    />
  );
}
