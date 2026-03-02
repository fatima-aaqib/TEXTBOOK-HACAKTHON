import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing user in localStorage on mount
    const storedUser = localStorage.getItem('chatbot-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('chatbot-user');
      }
    }
  }, []);

  const login = () => {
    // In a real implementation, this would redirect to an OAuth provider
    // For demo purposes, we'll create a mock user
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      name: `User ${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date()
    };

    setUser(mockUser);
    localStorage.setItem('chatbot-user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chatbot-user');
    // Also clear chat history for this user
    if (user) {
      localStorage.removeItem(`chat-history-${user.id}`);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};