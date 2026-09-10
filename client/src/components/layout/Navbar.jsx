import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { NotificationsModal } from '../common/NotificationsModal';

export const Navbar = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isVenueOwner = user?.role === 'venue_owner';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Logo size="md" showTagline={true} />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-7">
              {isVenueOwner ? (
                <>
                  <Link to="/dashboard#venues" className="text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    🏛️ Manage Venues
                  </Link>
                  <Link to="/dashboard#requests" className="text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                    📋 Booking Requests
                  </Link>
                </>
              ) : (
                <>
              <Link
                to="/events"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/events')
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Explore Events & Venues
              </Link>

              <Link
                to="/events?tab=halls"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                <span>🏛️</span>
                Function Halls
              </Link>
                </>
              )}

              {isAuthenticated && !isAdmin && (
                <>
                  {!isAdmin && (
                    <>
                      <Link
                        to="/dashboard"
                        className={`text-sm font-semibold transition-colors ${
                          isActive('/dashboard')
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {isVenueOwner ? 'Owner Dashboard' : 'Dashboard'}
                      </Link>

                      <Link
                        to={isVenueOwner ? '/dashboard#requests' : '/bookings'}
                        className="text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        {isVenueOwner ? 'Requests' : 'My Bookings'}
                      </Link>
                    </>
                  )}

                </>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notification Bell (Available for all / active) */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <span className="text-lg">🔔</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {!loading && isAuthenticated ? (
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">
                        {user?.role || 'Member'}
                      </p>
                    </div>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold"
                  >
                    Logout
                  </Button>
                </div>
              ) : !loading ? (
                <div className="flex items-center gap-2 pl-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="font-semibold text-xs px-4">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="font-semibold text-xs px-4 shadow-sm bg-blue-600 hover:bg-blue-700">
                      Register
                    </Button>
                  </Link>
                </div>
              ) : null}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-5 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2"
            >
              {isVenueOwner ? (
                <>
                  <Link to="/dashboard#venues" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    🏛️ Manage Venues
                  </Link>
                  <Link to="/dashboard#requests" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    📋 Booking Requests
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    Explore Events & Venues
                  </Link>
                  <Link to="/events?tab=halls" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    Function Halls
                  </Link>
                </>
              )}

              {!loading && isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {isVenueOwner ? 'Owner Dashboard' : 'Dashboard'}
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {isVenueOwner ? 'Venue Activity' : 'My Bookings'}
                      </Link>
                    </>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Profile
                  </Link>
                  <div className="pt-2 px-4">
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                      Logout
                    </Button>
                  </div>
                </>
              ) : !loading ? (
                <div className="grid grid-cols-2 gap-2 pt-2 px-4">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              ) : null}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
};

export default Navbar;
