import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export const ProtectedRoute: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, sessionReady, sessionError, retrySession } = useAuth();
  const location = useLocation();

  // Chờ khôi phục phiên xong mới quyết định, tránh chuyển hướng sai khi
  // người dùng đã đăng nhập nhưng trang vừa tải lại (BUG-01 / TC-03-08).
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-low p-6 text-center">
          <span className="material-symbols-outlined text-error text-[36px]">cloud_off</span>
          <h1 className="mt-3 text-headline-sm font-bold text-on-surface">Không thể xác minh phiên đăng nhập</h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {sessionError} Nội dung được bảo vệ chưa được hiển thị và phiên cục bộ vẫn được giữ lại.
          </p>
          <button
            type="button"
            onClick={() => void retrySession()}
            className="mt-5 rounded-xl bg-primary px-4 py-2 text-on-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Thử kết nối lại
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" state={{ from: location.pathname, requiredRoles: allowedRoles }} replace />;
  }

  return <Outlet />;
};
