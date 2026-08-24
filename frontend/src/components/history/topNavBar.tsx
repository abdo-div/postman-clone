import React from "react";

interface TopNavBarProps {
  onBrandClick?: () => void;
  onNavigate?: (item: string) => void;
  onImportClick?: () => void;
}

const navItems = ["Workspaces", "Environments", "History"];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onBrandClick,
  onNavigate,
  onImportClick,
}) => {
  return (
    <nav className="z-50 flex h-12 w-full items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 font-body-md text-body-md">
      <div className="flex items-center gap-6">
        <button
          onClick={onBrandClick}
          className="font-headline-md text-headline-md font-bold text-primary"
        >
          API Workbench
        </button>

        <div className="relative hidden items-center lg:flex">
          <span className="material-symbols-outlined absolute left-2 text-sm text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-64 rounded border border-outline-variant bg-surface-container-highest py-1 pl-8 pr-3 text-sm text-on-surface outline-none transition-colors focus:border-primary-container"
          />
        </div>

        <div className="hidden h-full items-center gap-4 md:flex">
          {navItems.map((item) =>
            item === "History" ? (
              <button
                key={item}
                onClick={() => onNavigate?.(item)}
                className="flex h-full items-center border-b-2 border-primary px-2 pb-1 text-primary transition-colors hover:bg-surface-container-highest active:scale-95"
              >
                {item}
              </button>
            ) : (
              <button
                key={item}
                onClick={() => onNavigate?.(item)}
                className="flex h-full items-center px-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest active:scale-95"
              >
                {item}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
        <button className="flex items-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
        <button className="relative flex items-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary"></span>
        </button>
        <button
          onClick={() => onImportClick?.()}
          className="rounded border border-outline-variant bg-surface-container-highest px-3 py-1 text-sm transition-colors hover:border-primary-container active:scale-95"
        >
          Import
        </button>
        <button className="flex items-center gap-2 rounded bg-primary-container px-3 py-1 text-sm font-semibold text-on-primary-container transition-colors hover:bg-primary-container/90 active:scale-95">
          <span className="material-symbols-outlined text-[16px]">play_arrow</span> Run Collection
        </button>
        <img
          alt="User profile"
          className="h-8 w-8 rounded-full border border-outline-variant object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH7C-xhmuXMlaBZb1qw0StbtzKDJKfzw3LOgdVNopXOB2yJkWhH-ovwm4Fdy7t3gG2hMVIL80s_gzhEy8Mpq0dpCnZsIudxqUWIZBNB649ENJz2f13jkfzOI5Dfx4pPdK8wR3Fd7Jbuijhp14oQLIvg21yhHLB1ve6Ixf7g0F-I7G5S3PTcQ4SGetmYbVTxAVxzVqN-FF4lfhmJ0HIuP5wu4NYVPQ4mItCfIpwaxBk5ru_qe1zjvpp"
        />
      </div>
    </nav>
  );
};
