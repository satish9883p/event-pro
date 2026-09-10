import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Logo } from '../components/common/Logo';
import { venueService } from '../services/venueService';
import { useAuth } from '../hooks/useAuth';

const getVenueMapUrl = (venue) => {
  if (venue.googleMapUrl) return venue.googleMapUrl;
  const query = [venue.address, venue.city, venue.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || venue.name)}`;
};

export const Landing = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(true);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const response = await venueService.getVenues();
        setVenues(response.data || []);
      } catch (error) {
        console.error('Unable to load venue listings:', error);
      } finally {
        setVenuesLoading(false);
      }
    };

    loadVenues();
  }, []);

  const features = [
    {
      icon: '🏛️',
      title: 'Premium Function Halls',
      description: 'Discover luxury convention centers, air-conditioned banquet halls, and traditional wedding mandapams.',
    },
    {
      icon: '📍',
      title: 'Hierarchical Location Filter',
      description: 'Easily drill down from State → District → Area across Andhra Pradesh, Telangana, Tamil Nadu, and more.',
    },
    {
      icon: '📅',
      title: 'Real-Time Slot Booking',
      description: 'Check available morning, evening, or full-day slots for your exact date with anti-double-booking protection.',
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'No hidden charges. Clear breakdowns of hall base price, floral decor, lighting, and catering packages.',
    },
    {
      icon: '🎟️',
      title: 'Unique Booking ID & Receipt',
      description: 'Receive instant confirmation with a unique booking ID, itemized digital receipt, and hassle-free cancellation.',
    },
    {
      icon: '�️',
      title: 'Centralized Control',
      description: 'A structured workflow for attendees, venue hosts, and administrators to track reservations and approvals.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Select Location & Date',
      description: 'Pick your preferred State, District, and Area, then choose your exact event date on the calendar.',
    },
    {
      number: '2',
      title: 'Compare Venues & Prices',
      description: 'Browse photos, guest capacities, AC specs, parking facilities, and transparent prices.',
    },
    {
      number: '3',
      title: 'Select Slot & Services',
      description: 'Choose morning, evening, or full-day slots, and customize with floral decor or catering add-ons.',
    },
    {
      number: '4',
      title: 'Instant Confirmation',
      description: 'Receive a unique Booking ID receipt immediately and manage your reservations anytime.',
    },
  ];

  const faqs = [
    {
      question: 'What is this platform?',
      answer: 'This is a venue management and venue booking platform where admins review venues, owners manage availability, and users discover approved venues by location.',
    },
    {
      question: 'How does location-based discovery work?',
      answer: 'Users can search by city or area, review approved venues, and open venue details to check capacity, facilities, and availability before requesting a booking.',
    },
    {
      question: 'Can users request a booking without immediate confirmation?',
      answer: 'Yes. Users submit a booking request, and the venue owner or admin reviews and accepts or rejects it before the booking is confirmed.',
    },
    {
      question: 'How are venues approved?',
      answer: 'New venues begin as pending, and admin approval is required before they become visible to normal users in public search results.',
    },
    {
      question: 'What happens after a booking is requested?',
      answer: 'The owner receives the request and can review details, accept it, or reject it based on venue availability and policy.',
    },
    {
      question: 'How is availability managed?',
      answer: 'Venue owners manage dates and time slots, and the platform prevents conflicting or double-booked requests for the same venue and time.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col justify-between">
      <Navbar />

      {/* ================= Hero Section ================= */}
      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#07090d] text-white">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=88"
          alt="Elegant venue interior prepared for a celebration"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,13,0.98)_0%,rgba(7,9,13,0.78)_40%,rgba(7,9,13,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#07090d_0%,transparent_38%,rgba(255,90,95,0.16)_100%)]" />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-[#ff5a5f]/30 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff8a8a]/35 bg-[#ff5a5f]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#ffc4c4] backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-[#ff5a5f] shadow-[0_0_15px_#ff5a5f]" /> Live venue discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl"
          >
            Spaces that make{' '}
            <span className="bg-gradient-to-r from-[#ffb1b1] via-[#ff5a5f] to-[#fbbf24] bg-clip-text text-transparent">
              moments
            </span>
            <br /> unforgettable.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 max-w-xl text-base font-normal leading-relaxed text-slate-200 sm:text-lg"
          >
            Browse approved venues, review availability, and send booking requests through a clear venue-management workflow built for users, venue owners, and administrators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <Link to="/events">
              <Button size="lg" className="px-8 py-3.5 font-bold">
                🏛️ Explore Venues
              </Button>
            </Link>
            {!authLoading && !isAuthenticated && (
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 py-3.5 font-bold">
                  🔐 Login to Continue
                </Button>
              </Link>
            )}
          </motion.div>

          <div className="mt-16 grid max-w-3xl grid-cols-3 gap-5 border-t border-white/15 pt-7 text-left">
            <div>
              <span className="block text-2xl font-black">Live</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Discovery</span>
            </div>
            <div>
              <span className="block text-2xl font-black">Owner</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Control</span>
            </div>
            <div>
              <span className="block text-2xl font-black">Admin</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Approval</span>
            </div>
          </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.45, duration: 0.8, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="ml-auto max-w-md rounded-[28px] border border-white/20 bg-black/35 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[22px]">
                  <img
                    src="https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=85"
                    alt="Warmly lit premium venue space"
                    className="h-[420px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full border border-[#ff8a8a]/40 bg-[#ff5a5f]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd1d1]">Featured space</span>
                      <span className="text-sm text-[#fbbf24]">★★★★★</span>
                    </div>
                    <h2 className="text-2xl font-bold">Find your perfect setting</h2>
                    <p className="mt-2 text-sm text-slate-300">A considered venue search, from first look to confirmed request.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= Featured Function Halls ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Approved Venues
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
              Available Venue Listings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                Live listings from approved venue owners. New venues appear here after approval.
            </p>
          </div>
          <Link to="/events?tab=halls">
            <Button variant="outline" className="font-bold text-xs">
              View all listings →
            </Button>
          </Link>
        </div>

        {venuesLoading ? (
          <div className="premium-card flex min-h-48 items-center justify-center text-sm text-slate-400">
            Loading live venue listings...
          </div>
        ) : venues.length === 0 ? (
          <div className="premium-card flex min-h-48 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 text-3xl">🏛️</span>
            <h3 className="text-lg font-bold text-white">No venues have been published yet</h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Approved venue listings will appear here when venue owners add them.
            </p>
            <Link to="/events?tab=halls" className="mt-5">
              <Button variant="outline" size="sm">Open venue search</Button>
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {venues.map((venue) => (
            <motion.div
              key={venue._id}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-56 relative overflow-hidden bg-gray-900">
                  {venue.images?.[0] ? (
                    <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#11151d] text-4xl">🏛️</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-900 dark:text-white shadow-xs">
                    {venue.approvalStatus}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {venue.city}, {venue.state}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    👥 Capacity: {venue.capacity.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Starts from</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">₹{venue.price.toLocaleString()}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getVenueMapUrl(venue)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
                    >
                      Map
                    </a>
                    <Link to="/events">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-bold">
                        View venue
                      </Button>
                    </Link>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* ================= How It Works Section ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Seamless Booking Experience
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
              How Event Pro Works
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Four simple steps from location discovery to your confirmed booking receipt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-blue-500/20">
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Powerful Platform Features ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Why Choose Us
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
            Built for Perfect Celebrations &amp; Conclaves
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            State-of-the-art booking engine with anti-conflict slot management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
