import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';

import {
  checkBackendHealth,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  checkRoleAccess,
  backendRoleToFrontend,
  frontendRoleToBackend,
  getSavedTokens,
  formatBackendErrorMessage,
  type BackendUser
} from '../services/authApi';

export interface AuthContextType {
  currentUser: User;
  user: User;
  isAuthenticated: boolean;
  backendOnline: boolean;
  isBackendMode: boolean;
  setIsBackendMode: (val: boolean) => void;
  checkBackendConnection: () => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  login: (emailOrRole: string, role?: UserRole) => { success: boolean; error?: string };
  loginWithBackend: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  registerWithBackend: (params: { email: string; password: string; role: 'Consumer' | 'Provider'; name?: string }) => Promise<{ success: boolean; error?: string; user?: BackendUser }>;
  logout: () => void;
  verifyRoleAccess: (role: 'consumer' | 'provider' | 'admin') => Promise<{ success: boolean; data?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isBackendMode, setIsBackendMode] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('apihub_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Alex Vance (Consumer)
  });

  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const res = await checkBackendHealth();
      const online = res.status === 'ok';
      setBackendOnline(online);
      return online;
    } catch {
      setBackendOnline(false);
      return false;
    }
  };

  // Check backend health & attempt restoring session on initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const online = await checkBackendConnection();
      if (!mounted) return;

      if (online && getSavedTokens()) {
        try {
          const me = await getMe();
          if (!mounted) return;
          const mappedRole = backendRoleToFrontend(me.role);
          const mappedUser: User = {
            id: me.id,
            email: me.email,
            name: me.name || me.email.split('@')[0],
            role: mappedRole,
            company: 'API Market Community',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            status: 'Active',
            twoFactorEnabled: false,
            quotaUsedPercent: 0,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          setCurrentUser(mappedUser);
        } catch {
          // session expired, fallback silently
        }
      }
    })();

    const interval = setInterval(() => {
      checkBackendConnection();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('apihub_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const matched = INITIAL_USERS.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser(prev => ({
        ...prev,
        role: role
      }));
    }
  };

  const loginWithBackend = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const tokens = await apiLogin({ email, password });
      const mappedRole = backendRoleToFrontend(tokens.user.role);
      const userObj: User = {
        id: tokens.user.id,
        email: tokens.user.email,
        name: tokens.user.name,
        role: mappedRole,
        company: 'API Market Hub',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        status: 'Active',
        twoFactorEnabled: false,
        quotaUsedPercent: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      setCurrentUser(userObj);
      setBackendOnline(true);
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: formatBackendErrorMessage(err) };
    }
  };

  const registerWithBackend = async (params: {
    email: string;
    password: string;
    role: 'Consumer' | 'Provider';
    name?: string;
  }): Promise<{ success: boolean; error?: string; user?: BackendUser }> => {
    try {
      const user = await apiRegister(params);
      setBackendOnline(true);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: formatBackendErrorMessage(err) };
    }
  };

  const verifyRoleAccess = async (role: 'consumer' | 'provider' | 'admin'): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const data = await checkRoleAccess(role);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: formatBackendErrorMessage(err) };
    }
  };

  const login = (emailOrRole: string, preferredRole?: UserRole): { success: boolean; error?: string } => {
    let currentUsersList = INITIAL_USERS;
    const savedUsers = localStorage.getItem('apihub_users');
    if (savedUsers) {
      try {
        currentUsersList = JSON.parse(savedUsers);
      } catch {
        // fallback
      }
    }

    const matched = currentUsersList.find(u => u.email.toLowerCase() === emailOrRole.toLowerCase().trim());
    if (matched) {
      if (matched.status === 'Locked') {
        return { success: false, error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên (Account Locked). Vui lòng liên hệ Admin để mở khóa.' };
      }
      setCurrentUser(matched);
      return { success: true };
    }

    if (preferredRole && currentUsersList.some(u => u.role === preferredRole)) {
      const u = currentUsersList.find(u => u.role === preferredRole)!;
      setCurrentUser(u);
      return { success: true };
    }

    return {
      success: false,
      error: 'Không tìm thấy tài khoản tương ứng với email đã nhập. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.'
    };
  };

  const logout = () => {
    apiLogout();
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated: true,
        backendOnline,
        isBackendMode,
        setIsBackendMode,
        checkBackendConnection,
        switchRole,
        setCurrentUser,
        login,
        loginWithBackend,
        registerWithBackend,
        logout,
        verifyRoleAccess
      }}
    >
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
