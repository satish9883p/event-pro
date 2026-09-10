import React from 'react';
import { EventCard } from './EventCard';
import { EventCardSkeleton } from '../common/Skeleton';

export const EventGrid = ({ events, loading, onRegister, registeredEventIds = [] }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No events found</p>
        <p className="text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          onRegister={onRegister}
          isRegistered={registeredEventIds.includes(event._id)}
        />
      ))}
    </div>
  );
};
