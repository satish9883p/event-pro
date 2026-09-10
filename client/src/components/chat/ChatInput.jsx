import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { motion } from 'framer-motion';

export const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your question about events..."
        rows="1"
        className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
      />
      <Button
        onClick={handleSend}
        isLoading={isLoading}
        disabled={!message.trim() || isLoading}
        size="sm"
      >
        Send
      </Button>
    </motion.div>
  );
};
