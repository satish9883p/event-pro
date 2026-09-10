import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12"
        >
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
              Event Pro is India's premier discovery and booking platform for banquet halls, convention centers, wedding mandapams, and extraordinary live events.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified Venues
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                🔒 Instant Booking Confirmation
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/events?tab=halls" className="hover:text-white transition-colors">
                  Function Halls & Venues
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Locations */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Top Locations
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/events?state=Andhra%20Pradesh" className="hover:text-white transition-colors">
                  Andhra Pradesh (Vijayawada)
                </Link>
              </li>
              <li>
                <Link to="/events?state=Telangana" className="hover:text-white transition-colors">
                  Telangana (Hyderabad)
                </Link>
              </li>
              <li>
                <Link to="/events?state=Tamil%20Nadu" className="hover:text-white transition-colors">
                  Tamil Nadu (Chennai)
                </Link>
              </li>
              <li>
                <Link to="/events?state=Karnataka" className="hover:text-white transition-colors">
                  Karnataka (Bengaluru)
                </Link>
              </li>
              <li>
                <Link to="/events?state=Maharashtra" className="hover:text-white transition-colors">
                  Maharashtra (Mumbai)
                </Link>
              </li>
            </ul>
          </div>

          {/* Booking Policies */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              Assurance
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-1.5">
                <span>✓</span> Transparent Pricing
              </li>
              <li className="flex items-center gap-1.5">
                <span>✓</span> Slot Protection
              </li>
              <li className="flex items-center gap-1.5">
                <span>✓</span> Cancellation Policy
              </li>
              <li className="flex items-center gap-1.5">
                <span>✓</span> 24x7 Customer Support
              </li>
              <li className="flex items-center gap-1.5">
                <span>✓</span> Verified Host Reviews
              </li>
            </ul>
          </div>
        </motion.div>

        <hr className="border-gray-800 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-xs gap-4">
          <p>&copy; {currentYear} Event Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Cancellation &amp; Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
