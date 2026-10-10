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
  clearTokens,
  formatBackendErrorMessage,
  type BackendUser
} from '../services/authApi';

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  backendOnline: boolean;
  isBackendMode: boolean;
  setIsBackendMode: (val: boolean) => void;
  checkBackendConnection: () => Promise<boolean>;
  switchRole: (role: UserRole) => void;
  setCurrentUser: (user: User | null) => void;
  login: (emailOrRole: string, role?: UserRole) => { success: boolean; error?: string };
  loginWithBackend: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  registerWithBackend: (params: { email: string; password: string; role: 'Consumer' | 'Provider'; name?: string }) => Promise<{ success: boolean; error?: string; user?: BackendUser }>;
  logout: () => void;
  verifyRoleAccess: (role: 'consumer' | 'provider' | 'admin') => Promise<{ success: boolean; data?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Chuyển dữ liệu user từ backend sang kiểu User của frontend. */
const toFrontendUser = (me: BackendUser): User => ({
  id: me.id,
  email: me.email,
  name: me.name || me.email.split('@')[0],
  role: backendRoleToFrontend(me.role),
  company: 'API Market Community',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  status: 'Active',
  twoFactorEnabled: false,
  quotaUsedPercent: 0,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isBackendMode, setIsBackendMode] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionReady, setSessionReady] = useState<boolean>(false);

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

  // Khôi phục phiên khi tải trang.
  // - Có token backend: xác nhận với /me rồi mới đánh dấu đã xác thực.
  // - Chế độ dev không có token: khôi phục từ phiên mẫu đã lưu.
  //
  // Lưu ý: React StrictMode chạy effect hai lần ở môi trường dev. Việc đọc
  // localStorage và set state ở đây là idempotent nên an toàn khi chạy lại;
  // không dùng cờ "mounted" cho các set state này để tránh mất phiên đã khôi phục.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const online = await checkBackendConnection();
      if (cancelled) return;

      if (getSavedTokens()) {
        if (online) {
          try {
            const me = await getMe();
            if (cancelled) return;
            setCurrentUser(toFrontendUser(me));
            setIsAuthenticated(true);
          } catch {
            // Token hết hạn hoặc không hợp lệ: xóa và coi như chưa đăng nhập.
            clearTokens();
            if (cancelled) return;
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Không xác nhận được phiên khi backend chưa sẵn sàng.
          clearTokens();
          if (cancelled) return;
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else if (import.meta.env.DEV) {
        // Phiên đăng nhập nhanh ở dev: khôi phục từ bản ghi đã lưu.
        const saved = localStorage.getItem('apihub_current_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as User | null;
            if (parsed?.id) {
              setCurrentUser(parsed);
              setIsAuthenticated(true);
            }
          } catch {
            localStorage.removeItem('apihub_current_user');
          }
        }
      }

      if (!cancelled) setSessionReady(true);
    })();

    const interval = setInterval(() => {
      checkBackendConnection();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Chỉ ghi lại phiên khi đã khôi phục xong và có người dùng.
  // Trước đây effect này chạy ngay khi mount với currentUser = null, ghi null
  // đè lên phiên đã lưu và làm mất đăng nhập sau mỗi lần tải lại trang (BUG-01).
  useEffect(() => {
    if (!sessionReady) return;
    if (currentUser) {
      localStorage.setItem('apihub_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('apihub_current_user');
    }
  }, [currentUser, sessionReady]);

  const switchRole = (role: UserRole) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      return INITIAL_USERS.find(u => u.role === role) ?? { ...prev, role };
    });
  };

  const loginWithBackend = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const tokens = await apiLogin({ email, password });
      const userObj = toFrontendUser(tokens.user);
      setCurrentUser(userObj);
      setIsAuthenticated(true);
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

  /**
   * Đăng nhập bằng dữ liệu mẫu, chỉ dùng cho môi trường development.
   * Ở production hàm này luôn thất bại để không tạo phiên giả.
   */
  const login = (emailOrRole: string, preferredRole?: UserRole): { success: boolean; error?: string } => {
    if (!import.meta.env.DEV) {
      return { success: false, error: 'Chức năng đăng nhập nhanh chỉ khả dụng ở môi trường phát triển.' };
    }

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
      setIsAuthenticated(true);
      return { success: true };
    }

    if (preferredRole && currentUsersList.some(u => u.role === preferredRole)) {
      const u = currentUsersList.find(u => u.role === preferredRole)!;
      setCurrentUser(u);
      setIsAuthenticated(true);
      return { success: true };
    }

    return {
      success: false,
      error: 'Không tìm thấy tài khoản tương ứng với email đã nhập. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.'
    };
  };

  const logout = () => {
    apiLogout();
    clearTokens();
    localStorage.removeItem('apihub_current_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        isAuthenticated,
        sessionReady,
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
