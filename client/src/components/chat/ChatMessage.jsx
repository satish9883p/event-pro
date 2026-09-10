import React from 'react';
import { motion } from 'framer-motion';

export const ChatMessage = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <p className="text-sm">{content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export const TypingIndicator = () => {
  return (
    <div className="flex gap-1 mb-4">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.1, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
    </div>
  );
};
