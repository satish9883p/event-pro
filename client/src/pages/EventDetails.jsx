import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BookingModal } from '../components/booking/BookingModal';
import { formatDate, formatTime, isRegistrationDeadlinePassed } from '../utils/helpers';

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Not Found</h2>
          <Link to="/events" className="mt-4 inline-block">
            <Button>Back to Explore Events</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const deadlinePassed = isRegistrationDeadlinePassed(event.registrationDeadline);
  const isSoldOut = event.availableSlots <= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/events" className="hover:text-blue-600">Events</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{event.title}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header Banner */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
            <div className="h-64 sm:h-80 bg-gray-900 relative overflow-hidden">
              <img
                src={
                  event.image ||
                  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
                }
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                  {event.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                  {event.status}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {event.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{event.venue}, {event.area || event.location}, {event.district || event.state}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Ticket Price</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {event.price ? `₹${event.price.toLocaleString()}` : 'Free Entry'}
                  </span>
                </div>
                <Button
                  size="lg"
                  disabled={deadlinePassed || isSoldOut}
                  onClick={() => setBookingModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isSoldOut ? 'Sold Out' : deadlinePassed ? 'Registration Closed' : 'Book Ticket / Slot'}
                </Button>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">
                📅 Event Schedule &amp; Slots
              </h3>
              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <p><strong>Scheduled Date:</strong> {formatDate(event.date)}</p>
                <p><strong>Start Time:</strong> {formatTime(event.startTime)}</p>
                <p><strong>End Time:</strong> {formatTime(event.endTime)}</p>
                <p><strong>Capacity:</strong> {event.capacity} total seats</p>
                <p>
                  <strong>Available Slots Left:</strong>{' '}
                  <span className={`font-bold ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
                    {event.availableSlots !== undefined ? event.availableSlots : event.capacity} seats remaining
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">
                📋 Organizer &amp; Contact
              </h3>
              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <p><strong>Organized By:</strong> {event.organizer}</p>
                <p><strong>Contact Email:</strong> {event.contactEmail}</p>
                {event.contactPhone && <p><strong>Contact Phone:</strong> {event.contactPhone}</p>}
                <p><strong>Registration Deadline:</strong> {formatDate(event.registrationDeadline)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              About This Event
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              {event.description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={event}
        type="event"
        onSuccess={() => fetchEvent()}
      />

      <Footer />
    </div>
  );
};

export default EventDetails;
