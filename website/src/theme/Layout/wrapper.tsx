import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function Layout(props) {
  return (
    <>
      <OriginalLayout {...props} />
      <BrowserOnly>
        {() => {
          // Dynamically import the chatbot to avoid SSR issues
          const [ChatbotLoaded, setChatbotLoaded] = React.useState(null);
          
          React.useEffect(() => {
            const loadChatbot = async () => {
              const ChatbotProvider = (await import('../components/chatbot/ChatbotProvider')).default;
              setChatbotLoaded(ChatbotProvider);
            };
            
            loadChatbot();
          }, []);
          
          if (ChatbotLoaded) {
            const ChatbotComponent = ChatbotLoaded;
            return <ChatbotComponent />;
          }
          
          return null;
        }}
      </BrowserOnly>
    </>
  );
}