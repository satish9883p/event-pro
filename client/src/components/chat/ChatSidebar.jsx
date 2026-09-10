import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';

export const ChatSidebar = ({ conversations, activeId, onSelect, onNew, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="fixed md:static md:w-64 h-screen bg-gray-100 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col z-40"
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <Button
              onClick={onNew}
              className="w-full mb-4"
              variant="primary"
              size="sm"
            >
              New Chat
            </Button>

            <div className="space-y-2">
              {conversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  whileHover={{ x: 5 }}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeId === conv.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Close on Mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-4 text-gray-700 dark:text-gray-300"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
