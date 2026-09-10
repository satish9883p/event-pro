import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { bookingService } from '../services/bookingService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { VenueOwnerDashboard } from './VenueOwnerDashboard';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending'
  );

  const historyBookings = bookings.filter(
    (b) => b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled'
  );

  const totalSpent = bookings
    .filter((b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (dashboardSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(dashboardSearch)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3">
              Event Pro Member Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Guest'}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2 leading-relaxed">
              Explore premier function halls, compare prices, manage your booked slots, and check booking history.
            </p>

            {/* Embedded Quick Search */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 max-w-md">
              <input
                type="text"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                placeholder="Search function halls, venues, or events..."
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-md"
              >
                Search
              </button>
            </form>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 text-[180px] pointer-events-none select-none font-black leading-none">
            PRO
          </div>
        </div>

        {/* ================= The 8 Core Dashboard Access Cards ================= */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Platform Navigation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* 1. Explore Events */}
            <Link
              to="/events"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                🔍
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Explore Events
              </span>
            </Link>

            {/* 2. Search Events */}
            <Link
              to="/events"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                🔎
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Search Events
              </span>
            </Link>

            {/* 3. Event Booking */}
            <Link
              to="/events?tab=events"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                🎟️
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Event Booking
              </span>
            </Link>

            {/* 4. Function Hall Booking */}
            <Link
              to="/events?tab=halls"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                🏛️
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Hall Booking
              </span>
            </Link>

            {/* 5. My Bookings */}
            <Link
              to="/bookings"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                📋
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                My Bookings ({activeBookings.length})
              </span>
            </Link>

            {/* 6. Booking History */}
            <Link
              to="/bookings"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                📜
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Booking History
              </span>
            </Link>

            {/* 7. Profile */}
            <Link
              to="/profile"
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                👤
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Profile
              </span>
            </Link>

            {/* 8. Notifications */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition-all text-center group relative"
            >
              <span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">
                🔔
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* ================= Stats Grid ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Active Reservations
            </span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
              {activeBookings.length}
            </span>
            <p className="text-xs text-gray-500 mt-1">Confirmed upcoming venue &amp; event slots</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Booking History
            </span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {historyBookings.length}
            </span>
            <p className="text-xs text-gray-500 mt-1">Past completed or cancelled bookings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Total Booking Value
            </span>
            <span className="text-3xl font-black text-green-600 dark:text-green-400 mt-1 block">
              ₹{totalSpent.toLocaleString()}
            </span>
            <p className="text-xs text-gray-500 mt-1">Lifetime payments processed through Event Pro</p>
          </div>
        </div>

        {/* ================= Upcoming / Active Bookings Preview ================= */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Upcoming &amp; Active Bookings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your currently scheduled function halls and events
              </p>
            </div>
            <Link to="/bookings" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View All Bookings →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-gray-400">Loading bookings...</div>
          ) : activeBookings.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-2">🏛️</span>
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                No active bookings right now.
              </p>
              <p className="text-xs text-gray-400 mb-4 mt-1">
                Explore function halls across Vijayawada, Hyderabad, Chennai, Bengaluru, and Mumbai.
              </p>
              <Link to="/events">
                <Button size="sm">Explore Available Venues</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((b) => {
                const target = b.hall || b.event;
                return (
                  <div
                    key={b._id}
                    className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-700/30 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {b.bookingId}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          ● {b.bookingStatus}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white mt-2 line-clamp-1">
                        {target ? target.name || target.title : 'Venue Booking'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        📍 {target?.area ? `${target.area}, ${target.district}` : target?.location}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Date &amp; Slot</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {new Date(b.date).toLocaleDateString()} • {b.timeSlot}
                        </span>
                      </div>
                      <Link to="/bookings">
                        <Button variant="outline" size="sm" className="text-xs font-semibold py-1 px-3">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <Footer />
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'venue_owner') {
    return <VenueOwnerDashboard />;
  }

  return <CustomerDashboard />;
};

export default Dashboard;
