import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth';
import { ragService } from './RagService';
import ReactMarkdown from 'react-markdown';

interface Citation {
  text: string;
  source: string;
  score: number;
  page?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { user, login, logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Load chat history for authenticated users
  useEffect(() => {
    if (user && sessionToken) {
      loadChatHistory();
    }
  }, [user, sessionToken]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      const session = await ragService.createSession(user?.id);
      setSessionToken(session.session_token);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!sessionToken) return;
    
    try {
      const session = await ragService.getSession(sessionToken);
      const loadedMessages = session.messages.map(msg => ({
        id: Date.now().toString() + Math.random(),
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        citations: msg.citations,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get selected text if any
      const selectedText = getSelectedText();

      // Call the RAG API to get response based on textbook content
      const response = await ragService.getAnswer(
        inputValue.trim(),
        sessionToken || undefined,
        selectedText || undefined
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update session token if we got a new one
      if (response.session_token && !sessionToken) {
        setSessionToken(response.session_token);
      }
    } catch (error) {
      console.error('Error getting response:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Clear selection after sending
      window.getSelection()?.removeAllRanges();
    }
  };

  const getSelectedText = (): string | null => {
    const selection = window.getSelection();
    return selection && selection.toString().trim().length > 0
      ? selection.toString()
      : null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <h3>Physical AI Assistant</h3>
              <p className="chatbot-subtitle">Ask questions about the textbook</p>
            </div>
            <div className="chatbot-controls">
              {user ? (
                <span className="user-info">{user.name || user.email}</span>
              ) : (
                <button className="login-btn" onClick={login}>Login</button>
              )}
              <button
                className="close-btn"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h4>Welcome to the Physical AI & Humanoid Robotics Assistant!</h4>
                <p>Ask me questions about the textbook content, and I'll provide answers based on the 24 chapters across all modules.</p>
                <p className="hint">💡 Tip: Select any text on the page to ask context-specific questions!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.role}`}
                  >
                    <div className="message-content">
                      {message.role === 'assistant' ? (
                        <div className="markdown-content">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                      
                      {/* Display citations for assistant messages */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="citations">
                          <p className="citations-title">📚 Sources:</p>
                          {message.citations.map((citation, idx) => (
                            <div key={idx} className="citation">
                              <span className="citation-score">{(citation.score * 100).toFixed(0)}% match</span>
                              <span className="citation-source">{citation.source}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="message-timestamp">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chatbot-input-area">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the textbook..."
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;