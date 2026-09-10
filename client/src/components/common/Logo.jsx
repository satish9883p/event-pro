import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon */}
      <motion.div
        whileHover={{ scale: 1.06, rotate: 3 }}
        whileTap={{ scale: 0.96 }}
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#ff5a5f] via-[#f97316] to-[#fbbf24] text-white shadow-[0_0_25px_rgba(255,90,95,0.35)] flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
        >
          {/* Stylized Venue / Ticket Arch with Star */}
          <path d="M3 10V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V10" />
          <path d="M21 10L12 3L3 10" />
          <path d="M9 21V13H15V21" />
          <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
      </motion.div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSizes[size]} font-extrabold tracking-tight text-white`}
          >
            Event
          </span>
          <span
            className={`${textSizes[size]} bg-gradient-to-r from-[#ff8a8a] to-[#fbbf24] bg-clip-text font-black tracking-wider text-transparent`}
          >
            PRO
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">
            Venues & Function Halls
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
