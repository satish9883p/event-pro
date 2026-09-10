import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <motion.div
      className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 p-4">
      <Skeleton height="h-40" className="mb-4" />
      <Skeleton width="w-3/4" height="h-6" className="mb-2" />
      <Skeleton width="w-1/2" height="h-4" className="mb-4" />
      <Skeleton width="w-full" height="h-4" className="mb-2" />
      <Skeleton width="w-2/3" height="h-4" />
    </div>
  );
};
