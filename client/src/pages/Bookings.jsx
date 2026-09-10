import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '../services/bookingService';
import { venueService } from '../services/venueService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';

export const Bookings = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [bookings, setBookings] = useState([]);
  const [venueRequests, setVenueRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Receipt Modal
  const [receiptBooking, setReceiptBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bookingResponse, venueResponse] = await Promise.all([
        bookingService.getMyBookings(),
        venueService.getMyBookingRequests(),
      ]);
      setBookings(bookingResponse.data || []);
      setVenueRequests(venueResponse.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(bookingToCancel._id, cancelReason);
      setCancelModalOpen(false);
      setBookingToCancel(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending'
  );

  const historyBookings = bookings.filter(
    (b) => b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled'
  );

  const displayedBookings = activeTab === 'active' ? activeBookings : historyBookings;
  const displayedVenueRequests = activeTab === 'active'
    ? venueRequests.filter((request) => ['PENDING', 'ACCEPTED'].includes(request.status))
    : venueRequests.filter((request) => ['REJECTED', 'CANCELLED', 'COMPLETED'].includes(request.status));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Event Pro Management
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
              My Bookings &amp; Booking History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View your confirmed slots, itemized receipts, and manage cancellations
            </p>
          </div>

          <Link to="/events">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
              + Book New Venue / Event
            </Button>
          </Link>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📅</span> Active &amp; Upcoming ({activeBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>📜</span> Booking History ({historyBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-gray-400">Loading your reservations...</p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-lg mx-auto">
            <span className="text-5xl block mb-3">🎟️</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {activeTab === 'active' ? 'No Active Bookings' : 'No Past Booking History'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'active'
                ? 'You do not have any upcoming event or function hall reservations.'
                : 'You have no past completed or cancelled bookings.'}
            </p>
            <Link to="/events">
              <Button>Explore Function Halls &amp; Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedBookings.map((b) => {
              const target = b.hall || b.event;
              const isHall = b.bookingType === 'hall';

              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    {/* Left Details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Unique Booking ID */}
                        <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tracking-wider">
                          ID: {b.bookingId}
                        </span>

                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {isHall ? '🏛️ Function Hall' : '🎟️ Event'}
                        </span>

                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            b.bookingStatus === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : b.bookingStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          ● {b.bookingStatus}
                        </span>

                        <span className="text-xs font-semibold text-gray-400">
                          Payment: <span className="uppercase text-green-600 font-bold">{b.paymentStatus}</span>
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {target ? target.name || target.title : 'Venue / Event'}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>
                          {target?.area ? `${target.area}, ${target.district}, ${target.state}` : target?.location || 'India'}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300 pt-1">
                        <div>
                          <span className="text-gray-400">Date: </span>
                          <span className="font-bold">
                            {new Date(b.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400">Time Slot: </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {b.timeSlot}
                          </span>
                        </div>

                        {b.guestCount > 0 && (
                          <div>
                            <span className="text-gray-400">Guests: </span>
                            <span className="font-bold">{b.guestCount}</span>
                          </div>
                        )}
                      </div>

                      {/* Additional services badge */}
                      {b.additionalServices?.length > 0 && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                          <span className="font-semibold">Selected Services:</span>{' '}
                          {b.additionalServices.map((s) => s.name).join(', ')}
                        </div>
                      )}

                      {b.cancellationReason && (
                        <div className="text-xs p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900">
                          Cancellation Reason: {b.cancellationReason} (Refund status: {b.paymentStatus})
                        </div>
                      )}
                    </div>

                    {/* Right Amount & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 dark:border-gray-700 gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block text-left lg:text-right">
                          Total Amount
                        </span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                          ₹{b.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiptBooking(b)}
                          className="text-xs font-semibold"
                        >
                          View Receipt
                        </Button>

                        {b.bookingStatus === 'confirmed' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setBookingToCancel(b);
                              setCancelModalOpen(true);
                            }}
                            className="text-xs font-semibold"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Venue booking requests</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Requests sent to venue owners for review.</p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{displayedVenueRequests.length}</span>
          </div>
          {displayedVenueRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No venue booking requests in this section.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayedVenueRequests.map((request) => (
                <div key={request._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{request.venueId?.name || 'Venue'}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{request.venueId?.city}, {request.venueId?.state}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{request.status}</span>
                  </div>
                  <div className="mt-4 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <p>📅 {new Date(request.bookingDate).toLocaleDateString()}</p>
                    <p>🕐 {request.startTime} - {request.endTime}</p>
                    <p>👥 {request.numberOfPeople} guests · {request.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ================= Cancellation Policy Modal ================= */}
      <AnimatePresence>
        {cancelModalOpen && bookingToCancel && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <span className="text-3xl block mb-2 text-red-500">⚠️</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Cancel Booking {bookingToCancel.bookingId}?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Please review our cancellation policy below before proceeding.
              </p>

              {/* Cancellation Policy Box */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 mb-4 space-y-1">
                <p className="font-bold">Cancellation Policy Guarantee:</p>
                <p>• 100% full refund if cancelled prior to the reserved slot date.</p>
                <p>• Refund of ₹{bookingToCancel.totalPrice.toLocaleString()} will be automatically credited within 3–5 working days.</p>
                <p>• The slot will be instantly released for other guests.</p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Change of dates, event rescheduled, etc."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setBookingToCancel(null);
                  }}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelBooking}
                  isLoading={cancelling}
                  className="flex-1 font-bold"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Printable Receipt Modal ================= */}
      <AnimatePresence>
        {receiptBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    Event Pro Receipt
                  </h3>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {receiptBooking.bookingId}
                  </span>
                </div>
                <button
                  onClick={() => setReceiptBooking(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reserved For:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {receiptBooking.contactName || 'Valued Guest'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue / Event:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {receiptBooking.hall?.name || receiptBooking.event?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled Date:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(receiptBooking.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Slot:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {receiptBooking.timeSlot}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{receiptBooking.basePrice.toLocaleString()}
                    </span>
                  </div>
                  {receiptBooking.additionalServices?.map((s, idx) => (
                    <div key={idx} className="flex justify-between py-1">
                      <span className="text-gray-500">• {s.name}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{s.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t text-sm font-black text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-green-600 text-lg">
                      ₹{receiptBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  🖨️ Print Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setReceiptBooking(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Bookings;
