import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Layers,
  Sparkles,
  CreditCard,
  FileCheck2,
  Megaphone,
  LogIn,
  UserPlus,
  Home,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
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

  const links = [
    { label: 'Public Showcase', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Campaigns', path: '#campaigns', icon: Megaphone, badge: 'Phase 1' },
    { label: 'Briefs & Contracts', path: '#briefs', icon: FileCheck2 },
    { label: 'Escrow & Payouts', path: '#payouts', icon: CreditCard },
    { label: 'AI Intelligence', path: '#ai-tools', icon: Sparkles, highlight: true },
  ];

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
        <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-surface-900 dark:text-surface-100">
                Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
              </span>
              <span className="block text-[9px] font-semibold text-accent-500 uppercase tracking-widest">
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

        {/* Links */}
        <div className="flex-1 py-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isReal = link.path.startsWith('/');

            const inner = (
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isReal
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 font-semibold'
                    : 'text-surface-600 dark:text-surface-400 opacity-60'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <Badge variant="neutral" size="sm">
                    {link.badge}
                  </Badge>
                )}
              </div>
            );

            return isReal ? (
              <NavLink key={link.label} to={link.path} onClick={onClose}>
                {inner}
              </NavLink>
            ) : (
              <div key={link.label}>{inner}</div>
            );
          })}
        </div>

        {/* Auth / Controls Footer */}
        <div className="pt-4 border-t border-surface-100 dark:border-surface-850 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-surface-500">Color Appearance</span>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
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
              <span>Join</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
