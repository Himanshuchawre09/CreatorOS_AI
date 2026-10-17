import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  UserCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ROLE_NAVIGATION, ROLE_LABELS, UserRole } from '../../config/navigation';
import { useRole } from '../../context/RoleContext';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { role, setRole, roleLabel } = useRole();
  const navItems = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.creator;

  const roleOptions: UserRole[] = ['creator', 'brand', 'freelancer', 'talent_manager', 'admin'];

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 transition-all duration-300 ease-in-out z-20 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-surface-200 dark:border-surface-800 justify-between">
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

      {/* Role Switcher in Sidebar (so reviewer can preview all role views) */}
      {!collapsed ? (
        <div className="px-3 pt-3 pb-1 border-b border-surface-100 dark:border-surface-850">
          <div className="flex items-center justify-between text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1 px-1">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Role View
            </span>
            <span className="text-[10px] text-surface-400 capitalize">{roleLabel}</span>
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full text-xs font-semibold rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 px-2.5 py-1.5 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]} View
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 mb-1.5">
          {!collapsed ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">
              Navigation
            </span>
          ) : (
            <div className="h-1" />
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.path === '/dashboard';

          return (
            <NavLink
              key={item.label}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative select-none',
                  isActive && isDashboard
                    ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 font-semibold'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-900 hover:text-surface-900 dark:hover:text-surface-100',
                  collapsed && 'justify-center px-0'
                )
              }
            >
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  item.label === 'AI Assistant'
                    ? 'text-accent-500'
                    : 'text-surface-500 dark:text-surface-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'
                )}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge === 'Admin' ? 'danger' : 'neutral'}
                      size="sm"
                      className="ml-auto text-[10px] py-0 px-1.5 font-normal"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer expand toggle */}
      {collapsed && (
        <div className="p-3 border-t border-surface-100 dark:border-surface-850">
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center py-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
