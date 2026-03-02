import React from 'react';
import Layout from '@theme-original/Layout';
import ChatbotProvider from '../components/chatbot/ChatbotProvider';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <ChatbotProvider />
    </>
  );
}
