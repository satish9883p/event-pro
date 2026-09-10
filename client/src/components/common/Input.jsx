import React from 'react';

export const Input = ({ 
  label, 
  error = '', 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`rounded-xl border bg-[#11151d] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ff5a5f] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
