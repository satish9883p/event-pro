import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '../common/Input';

export const FilterPanel = ({ filters, onFilterChange }) => {
  const categories = ['Technical', 'Sports', 'Cultural', 'Educational', 'Social', 'Business', 'Health', 'Arts'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
    >
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Filters</h3>

      {/* Category */}
      <div className="mb-6">
        <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-6">
        <Input
          label="Location"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="Enter location"
        />
      </div>

      {/* Date */}
      <div className="mb-6">
        <Input
          label="Start Date"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
      </div>

      <div className="mb-6">
        <Input
          label="End Date"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange('clear', true)}
        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300"
      >
        Clear Filters
      </button>
    </motion.div>
  );
};
