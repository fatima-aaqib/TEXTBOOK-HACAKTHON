import React, { useEffect } from 'react';
import { AuthProvider } from './auth';
import ChatbotWidget from './ChatbotWidget';
import './chatbot.css';

const ChatbotProvider: React.FC = () => {
  return (
    <AuthProvider>
      <ChatbotWidget />
    </AuthProvider>
  );
};

export default ChatbotProvider;