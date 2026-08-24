import React, { useState } from "react";
import { TopNavBar } from "./topNavBar";
import { SideNavBar } from "./sideNavBar";
import { ImportModal } from "./importModal";

interface ImportPageProps {
  onExit?: () => void;
  onImportSuccess?: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onExit, onImportSuccess }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background font-body-md text-on-surface">
      <TopNavBar onBrandClick={onExit} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />

        <main className="flex-1 overflow-auto bg-surface-dim p-6">
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest opacity-50">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">
              code_blocks
            </span>
          </div>
        </main>
      </div>

      <ImportModal
        open={open}
        onClose={() => { setOpen(false); onExit?.(); }}
        onConfirm={() => {
          setOpen(false);
          onImportSuccess?.();
          onExit?.();
        }}
      />
    </div>
  );
};
