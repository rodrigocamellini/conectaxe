import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { AuthService } from '../services/authService';

// Cookie Helpers
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name: string) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

interface AuthContextType extends AuthState {
  setAuth: (auth: AuthState) => void;
  login: (user: User, isMasterMode?: boolean, clientId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'terreiro_session_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false, isMasterMode: false });

  // Load session on mount
  useEffect(() => {
    const initAuth = async () => {
      const sessionId = getCookie(SESSION_KEY);
      if (sessionId) {
        const result = await AuthService.validateSession(sessionId);
        if (result) {
          setAuth({ 
            user: result.user, 
            isAuthenticated: true, 
            isMasterMode: result.isMasterMode 
          });
        } else {
          // Invalid session
          eraseCookie(SESSION_KEY);
        }
      }
    };
    initAuth();
  }, []);

  const login = async (user: User, isMasterMode = false, clientId?: string) => {
    // Determine user type for session
    let userType: 'master' | 'client_admin' | 'system_user' = 'system_user';
    if (isMasterMode) userType = 'master';
    else if (user.role === 'admin' && !clientId) userType = 'client_admin'; 
    
    if (isMasterMode) {
        userType = 'master';
    } else {
        userType = clientId ? 'system_user' : 'client_admin';
    }

    try {
        const sessionId = await AuthService.createSession(user.id, userType, clientId);
        setCookie(SESSION_KEY, sessionId, 7);
        setAuth({ user, isAuthenticated: true, isMasterMode });
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
  };

  const logout = async () => {
    const sessionId = getCookie(SESSION_KEY);
    if (sessionId) {
        await AuthService.invalidateSession(sessionId);
        eraseCookie(SESSION_KEY);
    }
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
