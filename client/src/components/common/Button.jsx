import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 relative overflow-hidden';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#ff5a5f] to-[#f97316] text-white hover:brightness-110 disabled:opacity-50 shadow-[0_0_25px_rgba(255,90,95,0.35)]',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-500 disabled:opacity-50',
    outline: 'border border-[#ff5a5f]/60 text-[#ffb3b3] bg-transparent hover:bg-[#ff5a5f]/10 disabled:opacity-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
      ) : null}
      {children}
    </motion.button>
  );
};
