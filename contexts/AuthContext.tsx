import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import { User } from '../types';
import { DataContext } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const dataContext = useContext(DataContext);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem('inkwellUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error)
 {
      console.error('Failed to load user from localStorage', error);
      window.localStorage.removeItem('inkwellUser');
    }
  }, []);

  const updateUserInStorage = (userData: User | null) => {
    try {
      if (userData) {
        window.localStorage.setItem('inkwellUser', JSON.stringify(userData));
      } else {
        window.localStorage.removeItem('inkwellUser');
      }
    } catch (error) {
       console.error('Failed to save user to localStorage', error);
    }
  }

  const login = useCallback(async (email: string): Promise<void> => {
    if (!dataContext) {
        throw new Error("DataContext not available");
    }
    const { findOrCreateUser } = dataContext;

    // Simulate network latency for login process
    return new Promise(resolve => {
        setTimeout(() => {
            const userToLogin = findOrCreateUser(email);
            
            setUser(userToLogin);
            updateUserInStorage(userToLogin);
            resolve();
        }, 500);
    });
  }, [dataContext]);

  const logout = useCallback(() => {
    setUser(null);
    updateUserInStorage(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};