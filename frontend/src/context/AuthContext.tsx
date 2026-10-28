import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '../types';
import {
  ApiError,
  backendRoleToFrontend,
  checkBackendHealth,
  checkRoleAccess,
  clearTokens,
  formatBackendErrorMessage,
  getMe,
  getSavedTokens,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type BackendUser,
} from '../services/authApi';

interface AuthResult { success: boolean; error?: string; user?: User }

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  sessionError: string | null;
  backendOnline: boolean;
  checkBackendConnection: () => Promise<boolean>;
  retrySession: () => Promise<void>;
  loginWithBackend: (email: string, password: string) => Promise<AuthResult>;
  registerWithBackend: (params: { email: string; password: string; role: 'Consumer' | 'Provider'; name?: string }) => Promise<{ success: boolean; error?: string; user?: BackendUser }>;
  logout: () => Promise<{ warning?: string }>;
  verifyRoleAccess: (role: 'consumer' | 'provider' | 'admin') => Promise<{ success: boolean; data?: { role: string }; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toFrontendUser = (user: BackendUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name || user.email.split('@')[0],
  role: backendRoleToFrontend(user.role),
  status: 'Active',
  createdAt: '',
  lastLoginAt: '',
  twoFactorEnabled: false,
  quotaUsedPercent: 0,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendOnline, setBackendOnline] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const operationRef = useRef(0);

  const checkBackendConnection = useCallback(async () => {
    try {
      const result = await checkBackendHealth();
      const online = result.status === 'ok';
      setBackendOnline(online);
      return online;
    } catch {
      setBackendOnline(false);
      return false;
    }
  }, []);

  const restoreSession = useCallback(async () => {
    const operation = ++operationRef.current;
    setSessionReady(false);
    setSessionError(null);
    if (!getSavedTokens()) {
      setCurrentUser(null);
      setSessionReady(true);
      void checkBackendConnection();
      return;
    }

    try {
      const me = await getMe();
      if (operation !== operationRef.current) return;
      setCurrentUser(toFrontendUser(me));
      setBackendOnline(true);
    } catch (error) {
      if (operation !== operationRef.current) return;
      if (error instanceof ApiError && error.status === 401) {
        clearTokens();
        setCurrentUser(null);
      } else {
        setSessionError(formatBackendErrorMessage(error) || 'Không thể xác minh phiên đăng nhập.');
        setBackendOnline(false);
      }
    } finally {
      if (operation === operationRef.current) setSessionReady(true);
    }
  }, [checkBackendConnection]);

  const handleInvalidatedSession = useCallback(() => {
    ++operationRef.current;
    setCurrentUser(null);
    setSessionError(null);
    setSessionReady(true);
  }, []);

  useEffect(() => {
    localStorage.removeItem('apihub_current_user');
    window.addEventListener('apihub:session-invalidated', handleInvalidatedSession);
    queueMicrotask(() => void restoreSession());
    const interval = window.setInterval(() => void checkBackendConnection(), 30_000);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('apihub:session-invalidated', handleInvalidatedSession);
    };
  }, [checkBackendConnection, handleInvalidatedSession, restoreSession]);

  const loginWithBackend = async (email: string, password: string): Promise<AuthResult> => {
    const operation = ++operationRef.current;
    setCurrentUser(null);
    setSessionError(null);
    try {
      const tokens = await apiLogin({ email, password });
      if (operation !== operationRef.current) return { success: false, error: 'Yêu cầu đăng nhập đã bị thay thế.' };
      const user = toFrontendUser(tokens.user);
      setCurrentUser(user);
      setSessionReady(true);
      setBackendOnline(true);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: formatBackendErrorMessage(error) };
    }
  };

  const registerWithBackend = async (params: { email: string; password: string; role: 'Consumer' | 'Provider'; name?: string }) => {
    try {
      const user = await apiRegister(params);
      setBackendOnline(true);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: formatBackendErrorMessage(error) };
    }
  };
  const refreshCurrentUser = async () => {
    const me = await getMe();
    setCurrentUser(toFrontendUser(me));
  };


  const logout = async (): Promise<{ warning?: string }> => {
    ++operationRef.current;
    setCurrentUser(null);
    setSessionError(null);
    setSessionReady(true);
    localStorage.removeItem('apihub_current_user');
    try {
      const result = await apiLogout();
      if (!result.serverRevoked && result.warning) {
        return { warning: `Đã đăng xuất trên thiết bị này, nhưng máy chủ có thể chưa thu hồi phiên: ${result.warning}` };
      }
      return {};
    } catch (error) {
      return { warning: `Đã đăng xuất trên thiết bị này, nhưng máy chủ có thể chưa thu hồi phiên: ${formatBackendErrorMessage(error)}` };
    }
  };

  const verifyRoleAccess = async (role: 'consumer' | 'provider' | 'admin') => {
    try {
      return { success: true, data: await checkRoleAccess(role) };
    } catch (error) {
      return { success: false, error: formatBackendErrorMessage(error) };
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser,
      isAuthenticated: Boolean(currentUser),
      sessionReady,
      sessionError,
      backendOnline,
      checkBackendConnection,
      retrySession: restoreSession,
      loginWithBackend,
      registerWithBackend,
      logout,
      verifyRoleAccess,
      refreshCurrentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
