import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { formatDate, formatTime, getAvailableSeats, isRegistrationDeadlinePassed } from '../../utils/helpers';

export const EventCard = ({ event, onRegister, isRegistered = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const availableSeats = getAvailableSeats(event.capacity, 10); // TODO: Get actual registration count
  const deadlinePassed = isRegistrationDeadlinePassed(event.registrationDeadline);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Event Image */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-4xl">📅</div>
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {event.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p>📍 {event.venue}, {event.location}</p>
          <p>📅 {formatDate(event.date)}</p>
          <p>🕐 {formatTime(event.startTime)}</p>
          <p>👥 {availableSeats} seats available</p>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            event.status === 'Published' ? 'bg-green-100 text-green-800' :
            event.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
            event.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {event.status}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Link to={`/events/${event._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {!isRegistered && !deadlinePassed && availableSeats > 0 && (
            <Button
              size="sm"
              onClick={() => onRegister(event._id)}
              className="flex-1"
            >
              Register
            </Button>
          )}
          {isRegistered && (
            <Button variant="secondary" size="sm" className="flex-1" disabled>
              Registered
            </Button>
          )}
          {deadlinePassed && (
            <Button variant="secondary" size="sm" className="flex-1" disabled>
              Deadline Passed
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
