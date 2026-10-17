import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  FileCheck2,
  Send,
  CreditCard,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Campaigns', path: '#campaigns', icon: Megaphone, badge: 'Phase 1' },
    { label: 'Briefs & Contracts', path: '#briefs', icon: FileCheck2 },
    { label: 'Deliverables', path: '#deliverables', icon: Send },
    { label: 'Payouts & Escrow', path: '#payouts', icon: CreditCard },
    { label: 'AI Intelligence', path: '#ai-tools', icon: Sparkles, highlight: true },
    { label: 'Settings', path: '#settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 transition-all duration-300 ease-in-out z-20',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-surface-100 dark:border-surface-850 justify-between">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-surface-900 dark:text-surface-50 leading-none">
                Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
              </span>
              <span className="text-[10px] font-semibold text-accent-500 uppercase tracking-widest mt-0.5">
                AI Platform
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
            collapsed && 'hidden'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-2 mb-2">
          {!collapsed ? (
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
              Workspace
            </span>
          ) : (
            <div className="h-2" />
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isRealRoute = item.path.startsWith('/');

          const content = (
            <div
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative select-none',
                isRealRoute
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 font-semibold'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-surface-100 cursor-not-allowed opacity-75',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  item.highlight
                    ? 'text-accent-500'
                    : isRealRoute
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-200'
                )}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="neutral" size="sm" className="ml-auto text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                  {item.highlight && (
                    <span className="ml-auto flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );

          return isRealRoute ? (
            <NavLink key={item.label} to={item.path} title={collapsed ? item.label : undefined}>
              {content}
            </NavLink>
          ) : (
            <div key={item.label} title={collapsed ? `${item.label} (Coming soon)` : undefined}>
              {content}
            </div>
          );
        })}
      </div>

      {/* Footer Info / Support */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-850 space-y-2">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-brand-50 to-purple-50 dark:from-surface-900 dark:to-surface-850 border border-brand-100/60 dark:border-surface-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <HelpCircle className="w-4 h-4" />
              <span>CreatorOS Phase 0</span>
            </div>
            <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
              Foundation build running with live Express API proxy.
            </p>
          </div>
        )}

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center py-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
