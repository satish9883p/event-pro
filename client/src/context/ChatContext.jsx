import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content, timestamp: new Date() }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    conversations,
    addMessage,
    clearMessages,
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
