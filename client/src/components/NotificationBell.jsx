import { useEffect, useState, useRef } from 'react';
import { Bell, AlertCircle, Check } from 'lucide-react';
import { getNotifications, markNotificationsAsRead } from '../services/api.js';
import { cn } from '../lib/utils.js';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    loadNotifications();

    // Poll every 10 seconds for real-time feel
    const interval = setInterval(loadNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && unreadCount > 0) {
      try {
        await markNotificationsAsRead();
        // Optimistic local update
        setNotifications((current) =>
          current.map((n) => ({ ...n, isRead: true }))
        );
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800",
          isOpen && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
        )}
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-rose-500 rounded-full transform translate-x-1/3 -translate-y-1/3 shadow-sm min-w-[18px]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden dark:bg-slate-950 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xxs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold dark:bg-indigo-950/40 dark:text-indigo-400">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No tienes notificaciones por el momento.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors flex gap-3 items-start",
                    !notification.isRead && "bg-indigo-50/10 dark:bg-indigo-900/5"
                  )}
                >
                  <div className="mt-0.5">
                    <span className="relative flex h-2 w-2">
                      {!notification.isRead && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      )}
                      <span className={cn("relative inline-flex rounded-full h-2 w-2", notification.isRead ? "bg-slate-300 dark:bg-slate-700" : "bg-indigo-600")}></span>
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                      {notification.title}
                    </p>
                    <p className="text-xxs text-slate-500 dark:text-slate-400 leading-normal">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
