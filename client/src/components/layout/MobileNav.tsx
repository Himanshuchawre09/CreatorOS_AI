import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Layers,
  LogIn,
  UserPlus,
  LogOut,
  Home,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';
import { ROLE_NAVIGATION, ROLE_LABELS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'creator';
  const roleLabel = ROLE_LABELS[role] || 'Creator';
  const navItems = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.creator;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80%] bg-white dark:bg-surface-950 h-full border-r border-surface-200 dark:border-surface-800 flex flex-col p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-100 dark:border-surface-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-surface-900 dark:text-surface-100">
                Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
              </span>
              <span className="block text-[9px] font-semibold text-accent-500 uppercase tracking-widest leading-none">
                AI Platform
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info header if logged in */}
        {user && (
          <div className="pt-3 pb-2 border-b border-surface-100 dark:border-surface-850 px-1">
            <span className="block text-xs font-bold text-surface-900 dark:text-surface-100 truncate">
              {user.name}
            </span>
            <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {roleLabel}
            </span>
          </div>
        )}

        {/* Links */}
        <div className="flex-1 py-3 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900"
          >
            <Home className="w-4 h-4 text-surface-500" />
            <span>Public Home</span>
          </NavLink>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.path === '/dashboard';

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                    isActive && isDashboard
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-900'
                  )
                }
              >
                <Icon className="w-4 h-4 text-surface-500" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant={item.badge === 'Admin' ? 'danger' : 'neutral'} size="sm" className="text-[10px] py-0 px-1.5 font-normal">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Auth / Controls Footer */}
        <div className="pt-3 border-t border-surface-100 dark:border-surface-850 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-surface-500">Theme</span>
            <ThemeToggle />
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <NavLink
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-900"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
