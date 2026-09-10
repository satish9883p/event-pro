import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import { ChatMessage, TypingIndicator } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';

export const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await aiService.getChatHistory();
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSendMessage = async (message) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const response = await aiService.sendMessage(message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.aiResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await aiService.clearChatHistory();
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🤖 Event Pro Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask me anything about function halls, venues, and events!
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                ☰
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearChat}
              >
                Clear Chat
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Hello! I'm your Event Pro Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  I can help you find function halls, check slot availability, explore events, and assist with bookings.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSendMessage('What events are available this week?')}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-left"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      🔍 Find events
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What events are available this week?
                    </p>
                  </button>
                  <button
                    onClick={() => handleSendMessage('How do I register for an event?')}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-left"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ✍️ Registration
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How do I register for an event?
                    </p>
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
                {loading && <TypingIndicator />}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <ChatInput onSend={handleSendMessage} isLoading={loading} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
