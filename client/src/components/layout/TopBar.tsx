import React from 'react';
import { Menu, Search, Bell, ExternalLink, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../config/navigation';
import { api } from '../../services/api';

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

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications({ limit: 8 });
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Ignore polling errors silently
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside listener for notification dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore error
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      try {
        await api.markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignore error
      }
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
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

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-accent-500 rounded-full ring-2 ring-white dark:ring-surface-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-accent-100 dark:bg-accent-950/50 text-accent-700 dark:text-accent-300 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-surface-500 dark:text-surface-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-surface-900 dark:text-surface-100 line-clamp-1">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-surface-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 text-center">
                <Link
                  to="/messages"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Go to Messages →
                </Link>
              </div>
            </div>
          )}
        </div>

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
