import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';

interface RoleSwitcherProps { className?: string }

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  if (!currentUser) return null;
  const labels = {
    USER: language === 'vi' ? 'Người dùng API' : 'API Consumer',
    API_PROVIDER: language === 'vi' ? 'Nhà cung cấp API' : 'API Provider',
    ADMIN: language === 'vi' ? 'Quản trị viên' : 'System Admin',
  };
  const icons = { USER: 'person', API_PROVIDER: 'corporate_fare', ADMIN: 'shield_person' };
  return (
    <span className={`inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-outline-variant/40 bg-surface-container/60 text-[13px] font-semibold text-on-surface ${className}`} title="Vai trò do máy chủ xác nhận">
      <span className="material-symbols-outlined text-[17px] text-primary">{icons[currentUser.role]}</span>
      {labels[currentUser.role]}
    </span>
  );
};
