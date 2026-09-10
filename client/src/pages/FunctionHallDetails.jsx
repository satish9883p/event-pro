import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { functionHallService } from '../services/functionHallService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { BookingModal } from '../components/booking/BookingModal';
import { useAuth } from '../hooks/useAuth';

export const FunctionHallDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchHallDetails();
  }, [id]);

  const fetchHallDetails = async () => {
    setLoading(true);
    try {
      const res = await functionHallService.getFunctionHallById(id);
      setHall(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Function hall not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await functionHallService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      fetchHallDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto text-center py-20 px-4">
          <span className="text-5xl block mb-4">🏛️</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Function Hall Not Found
          </h2>
          <p className="text-gray-500 mb-6">{error || "The venue you're looking for doesn't exist."}</p>
          <Link to="/events?tab=halls">
            <Button>Explore Other Function Halls</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = hall.images && hall.images.length > 0 ? hall.images : [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/events?tab=halls" className="hover:text-blue-600">Function Halls</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{hall.name}</span>
        </div>

        {/* Title & Quick Actions Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {hall.type}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                hall.availability === 'Available'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                ● {hall.availability}
              </span>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                <span className="text-amber-400">★</span>
                <span>{hall.rating}</span>
                <span className="text-xs font-normal text-gray-400">({hall.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {hall.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <span>📍</span>
              <span>{hall.fullAddress}</span>
            </p>
          </div>

          {/* Pricing & Booking CTA Header */}
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-xs text-gray-400 block">Base Hall Price / Day</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                ₹{hall.price.toLocaleString()}
              </span>
            </div>
            <Button
              size="lg"
              onClick={() => setBookingModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 shadow-md shadow-blue-500/20"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
          <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-md bg-gray-900 h-80 sm:h-[450px] relative">
            <img
              src={images[activeImageIndex]}
              alt={hall.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:h-[450px]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-28 lg:w-full h-24 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-blue-600 shadow-md scale-95'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Details & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details, Specifications, Services, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                About the Function Hall
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {hall.description}
              </p>
            </div>

            {/* Quick Venue Specifications Grid */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Venue Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">👥</span>
                  <span className="text-xs text-gray-400 block">Seating Capacity</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.capacity.toLocaleString()} Guests
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">❄️</span>
                  <span className="text-xs text-gray-400 block">Air Conditioning</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.acType}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">🚗</span>
                  <span className="text-xs text-gray-400 block">Parking</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.parking}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">🎭</span>
                  <span className="text-xs text-gray-400 block">Stage</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.stage}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">🍽️</span>
                  <span className="text-xs text-gray-400 block">Catering Policy</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.catering}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-2xl block mb-1">📍</span>
                  <span className="text-xs text-gray-400 block">Region</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {hall.area}, {hall.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Available Facilities */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Available Facilities &amp; Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hall.facilities.map((fac, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Decoration & Catering Options */}
            {hall.additionalServices?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Decoration &amp; Add-on Services
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  These services can be customized and selected during booking.
                </p>
                <div className="space-y-3">
                  {hall.additionalServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/30 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{srv.name}</h4>
                        {srv.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{srv.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        ₹{srv.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps / Location Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Location &amp; Landmark
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {hall.fullAddress}
              </p>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center text-center p-6">
                <div className="max-w-md">
                  <span className="text-4xl block mb-2">🗺️</span>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {hall.name} Map Location
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {hall.area}, {hall.district}, {hall.state}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${hall.name} ${hall.fullAddress}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Customer Reviews & Add Review Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-gray-400">
                    Average rating: {hall.rating} / 5.0 ({hall.reviews?.length || 0} reviews)
                  </p>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Leave a Review
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500">Your Rating:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Great)</option>
                    <option value={3}>⭐⭐⭐ (3 - Good)</option>
                    <option value={2}>⭐⭐ (2 - Fair)</option>
                    <option value={1}>⭐ (1 - Poor)</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience regarding stage, dining, parking or air conditioning..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-3"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={submittingReview}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Review
                </Button>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {(!hall.reviews || hall.reviews.length === 0) ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No customer reviews yet. Be the first to review this venue!
                  </p>
                ) : (
                  hall.reviews.map((rev, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {rev.name}
                        </span>
                        <span className="text-amber-400 text-xs">
                          {'★'.repeat(rev.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {rev.comment}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Guest'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">
                    Starting Base Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      ₹{hall.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">/ Day or Slot</span>
                  </div>
                </div>

                {/* Available Slots Preview */}
                <div className="mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                    Available Time Slots
                  </span>
                  <div className="space-y-1.5">
                    {hall.availableTimeSlots?.map((slot, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between"
                      >
                        <span>{slot}</span>
                        <span className="text-green-600 dark:text-green-400 text-[10px] font-bold">
                          AVAILABLE
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assurance Badges */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-300 space-y-1 mb-6">
                  <p className="font-bold">⚡ Instant Booking Guarantee</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    No hidden charges. Lock in your selected date with transparent pricing.
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-blue-500/25"
                >
                  Book Function Hall Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={hall}
        type="hall"
        onSuccess={() => fetchHallDetails()}
      />

      <Footer />
    </div>
  );
};

export default FunctionHallDetails;
