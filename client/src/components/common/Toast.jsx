import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = ({ 
  message, 
  type = 'info', 
  onClose, 
  autoClose = true 
}) => {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto text-xl">
        ✕
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
