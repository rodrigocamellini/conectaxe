import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

interface AuthContextType extends AuthState {
  setAuth: (auth: AuthState) => void;
  login: (user: User, isMasterMode?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => 
    storage.get<AuthState>(STORAGE_KEYS.AUTH) || { user: null, isAuthenticated: false, isMasterMode: false }
  );

  useEffect(() => {
    storage.set(STORAGE_KEYS.AUTH, auth);
  }, [auth]);

  const login = (user: User, isMasterMode = false) => {
    setAuth({ user, isAuthenticated: true, isMasterMode });
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false, isMasterMode: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
