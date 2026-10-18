import React from 'react';
import { Menu, Search, Bell, ExternalLink, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../config/navigation';

export interface TopBarProps {
  onOpenMobileNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileNav }) => {
  const { user, logout } = useAuth();
  const userName = user?.name || 'Guest';
  const role = user?.role || 'creator';
  const roleLabel = ROLE_LABELS[role] || 'Creator';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns, creators, contracts... (Ctrl+K)"
            className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl pl-9 pr-12 py-1.5 text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            readOnly
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-surface-400 bg-surface-200/80 dark:bg-surface-800 px-1.5 py-0.5 rounded border border-surface-300 dark:border-surface-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Landing link, Dev link (DEV only), Theme, Notifications, User & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {import.meta.env.DEV && (
          <Link
            to="/dev/components"
            className="hidden lg:inline-flex items-center text-[11px] font-medium text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 px-2 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            Dev Tools
          </Link>
        )}

        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 px-2.5 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <span>Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-surface-950" />
        </button>

        {/* User Profile Preview with dynamic role */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-surface-200 dark:border-surface-800">
          <Avatar
            name={userName}
            size="sm"
            status="online"
            className="cursor-pointer"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100 leading-tight">
              {userName}
            </span>
            <span className="text-[11px] text-surface-500 dark:text-surface-400 font-medium">
              {roleLabel}
            </span>
          </div>

          {/* Working Log Out button */}
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
