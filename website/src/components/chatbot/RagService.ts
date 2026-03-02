
interface DocumentChunk {
  id: string;
  content: string;
  source: string;
  similarity: number;
}

interface Citation {
  text: string;
  source: string;
  score: number;
  page?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  token_count?: number;
  created_at: string;
}

interface ChatSession {
  session_token: string;
  messages: ChatMessage[];
  created_at: string;
}

class RagService {
  private baseUrl: string;

  constructor() {
    // Use environment variable for API URL - browser compatible
    // Default to localhost:8000 for development
    const apiUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:8000/api/v1';
    
    // For browser environment, always use localhost
    this.baseUrl = 'http://localhost:8000/api/v1';
  }

  /**
   * Create a new chat session
   */
  async createSession(userId?: number): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get a chat session with its message history
   */
  async getSession(sessionToken: string): Promise<ChatSession> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/session/${sessionToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Send a message and get a RAG-powered response from the textbook
   */
  async sendMessage(
    message: string,
    sessionToken?: string,
    selectedText?: string
  ): Promise<{ session_token: string; message: ChatMessage }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_token: sessionToken,
          selected_text: selectedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Get or create session token from response headers or existing context
      const newSessionToken = sessionToken || '';
      
      return {
        session_token: newSessionToken,
        message: data,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId: number): Promise<{ sessions: ChatSession[]; total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Get answer from RAG system (convenience method)
   */
  async getAnswer(
    query: string,
    sessionToken?: string,
    selectedText?: string
  ): Promise<{ content: string; citations?: Citation[]; session_token: string }> {
    const result = await this.sendMessage(query, sessionToken, selectedText);
    return {
      content: result.message.content,
      citations: result.message.citations,
      session_token: result.session_token,
    };
  }
}

export const ragService = new RagService();