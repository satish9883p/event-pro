import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export const BookingModal = ({ isOpen, onClose, item, type = 'hall', onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [guestCount, setGuestCount] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // Initialize values when item changes
  useEffect(() => {
    if (item) {
      // Default to first available date or today
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);

      const slots = item.availableTimeSlots || item.timeSlots || [
        'Morning Slot (08:00 AM - 02:00 PM)',
        'Evening Slot (04:00 PM - 10:00 PM)',
      ];
      setTimeSlot(slots[0] || '');
      setSelectedServices([]);
      setGuestCount(type === 'hall' ? 200 : 1);
      setError('');
      setConfirmedBooking(null);

      if (user) {
        setContactName(user.name || '');
        setContactPhone(user.phone || '');
      }
    }
  }, [item, user, type]);

  if (!isOpen || !item) return null;

  // Toggle optional additional services
  const handleServiceToggle = (service) => {
    const exists = selectedServices.find((s) => s.name === service.name);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s.name !== service.name));
    } else {
      setSelectedServices([...selectedServices, { name: service.name, price: service.price }]);
    }
  };

  // Pricing calculations
  const basePrice = Number(item.price) || 0;
  const servicesTotal = selectedServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const eventMultiplier = type === 'event' ? Math.max(1, guestCount) : 1;
  const totalPrice = type === 'event' ? basePrice * eventMultiplier : basePrice + servicesTotal;

  const availableSlotsList = item.availableTimeSlots || item.timeSlots || [
    'Morning Slot (08:00 AM - 02:00 PM)',
    'Evening Slot (04:00 PM - 10:00 PM)',
    'Full Day Slot (08:00 AM - 11:00 PM)',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!date) {
      setError('Please select a booking date.');
      return;
    }
    if (!timeSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        bookingType: type,
        hallId: type === 'hall' ? item._id : undefined,
        eventId: type === 'event' ? item._id : undefined,
        date,
        timeSlot,
        basePrice,
        additionalServices: selectedServices,
        guestCount: Number(guestCount),
        contactName: contactName || user?.name,
        contactPhone: contactPhone || user?.phone,
        contactEmail: user?.email,
        specialRequests,
      };

      const res = await bookingService.createBooking(payload);
      const booking = res.data;
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Payment checkout could not be loaded. Please check your internet connection and try again.');
      }

      const orderResponse = await paymentService.createOrder(booking._id || booking.bookingId);
      const order = orderResponse.data;

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Event Pro',
        description: item.name || item.title,
        order_id: order.razorpayOrderId,
        prefill: {
          name: contactName || user?.name || '',
          email: user?.email || '',
          contact: contactPhone || user?.phone || '',
        },
        theme: { color: '#ff5a5f' },
        handler: async (paymentResponse) => {
          try {
            const verification = await paymentService.verifyPayment({
              ...paymentResponse,
              bookingId: booking._id || booking.bookingId,
              paymentMethod: paymentResponse.method || 'other',
            });
            setConfirmedBooking(verification.data);
            if (onSuccess) onSuccess(verification.data);
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || 'Payment verification failed. Your booking remains pending and can be retried.');
          }
        },
        modal: {
          ondismiss: () => setError('Payment was cancelled. Your booking remains pending until payment is completed.'),
        },
      });

      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking. Please check slot availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden my-8"
        >
          {confirmedBooking ? (
            /* ================= Confirmation Receipt View ================= */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm"
              >
                ✓
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your reservation has been securely registered in Event Pro.
              </p>

              {/* Unique Booking ID Badge */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-auto mb-6 text-center">
                <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 block tracking-wider mb-1">
                  Unique Booking ID
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-widest selection:bg-blue-200">
                  {confirmedBooking.bookingId}
                </span>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 text-left border border-gray-200 dark:border-gray-700 max-w-md mx-auto mb-6 space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2 border-gray-200 dark:border-gray-600">
                  <span className="text-gray-500 dark:text-gray-400">Venue / Event:</span>
                  <span className="font-bold text-gray-900 dark:text-white text-right">
                    {item.name || item.title}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {item.area ? `${item.area}, ${item.district || item.state}` : item.location}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(confirmedBooking.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Time Slot:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {confirmedBooking.timeSlot}
                  </span>
                </div>

                {confirmedBooking.additionalServices?.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Additional Services:</p>
                    {confirmedBooking.additionalServices.map((srv, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span>• {srv.name}</span>
                        <span>₹{srv.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-600 text-base">
                  <span className="font-bold text-gray-900 dark:text-white">Total Amount Paid:</span>
                  <span className="font-black text-xl text-green-600 dark:text-green-400">
                    ₹{confirmedBooking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button
                  onClick={() => {
                    onClose();
                    navigate('/bookings');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold"
                >
                  View in My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* ================= Interactive Booking Form ================= */
            <div>
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {type === 'hall' ? '🏛️ Function Hall Reservation' : '🎟️ Event Seat Booking'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {item.name || item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {item.area ? `${item.area}, ${item.district}, ${item.state}` : item.location}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {error && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {/* 1. Date Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    1. Select Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Select your planned booking date to check available slots.
                  </p>
                </div>

                {/* 2. Slot Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    2. Select Available Time Slot *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableSlotsList.map((slot, i) => {
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                              : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Additional Services (For Function Halls) */}
                {type === 'hall' && item.additionalServices?.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      3. Optional Additional Services &amp; Decor
                    </label>
                    <div className="space-y-2">
                      {item.additionalServices.map((service, i) => {
                        const isChecked = selectedServices.some((s) => s.name === service.name);
                        return (
                          <div
                            key={i}
                            onClick={() => handleServiceToggle(service)}
                            className={`p-3 rounded-xl border text-xs flex justify-between items-center cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-indigo-50/70 dark:bg-indigo-900/20 border-indigo-500 text-gray-900 dark:text-white'
                                : 'bg-gray-50/60 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <p className="font-semibold">{service.name}</p>
                                {service.description && (
                                  <p className="text-[10px] text-gray-400">{service.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              +₹{service.price.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Guest Count & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {type === 'hall' ? 'Expected Guests' : 'Tickets / Seats'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={item.capacity || 5000}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 5. Complete Pricing Breakdown Section */}
                <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                    Pricing Breakdown
                  </h4>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{type === 'hall' ? 'Hall Base Price / Day:' : 'Ticket Price:'}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{basePrice.toLocaleString()} {type === 'event' && `× ${guestCount}`}
                    </span>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Additional Services ({selectedServices.length}):</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        +₹{servicesTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white">
                    <span>Total Amount Payable:</span>
                    <span className="text-lg text-green-600 dark:text-green-400 font-black">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Confirm & Book CTA */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="flex-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20"
                  >
                    Confirm &amp; Book (₹{totalPrice.toLocaleString()})
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
