import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const defaultNotifications = [
  {
    id: 1,
    title: 'Booking Confirmed!',
    message: 'Your function hall booking for Grand Celebration Hall (EP-20260915-1024) is confirmed.',
    time: '2 hours ago',
    read: false,
    type: 'success',
    link: '/bookings',
  },
  {
    id: 2,
    title: 'Explore New Venues in Hyderabad',
    message: 'Cyber Pearl Convention Center in Hitec City has opened weekend slots for next month.',
    time: '1 day ago',
    read: false,
    type: 'info',
    link: '/events?tab=halls',
  },
  {
    id: 3,
    title: 'Welcome to Event Pro',
    message: 'Discover premier function halls, compare transparent prices, and book instant slots.',
    time: '2 days ago',
    read: true,
    type: 'primary',
    link: '/dashboard',
  },
];

export const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(defaultNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-2xl p-6 flex flex-col border-l border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between py-3 text-xs text-gray-500 dark:text-gray-400">
              <button
                onClick={markAllAsRead}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Mark all as read
              </button>
              <button
                onClick={clearNotifications}
                className="hover:text-red-600 dark:hover:text-red-400 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-3 py-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <span className="text-4xl block mb-2">🔕</span>
                <p className="font-medium text-gray-600 dark:text-gray-300">
                  No notifications
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up with your bookings and venue updates.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={onClose}
                  className={`block p-4 rounded-xl border transition-all ${
                    item.read
                      ? 'bg-gray-50/50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      : 'bg-blue-50/70 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{item.message}</p>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              to="/bookings"
              onClick={onClose}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Booking History →
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
