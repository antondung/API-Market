import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export const Unauthorized401Page: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const from = (location.state as { from?: unknown } | null)?.from;
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard';
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-center shadow-xl">
        <span className="material-symbols-outlined text-primary text-[48px]">lock</span>
        <h1 className="mt-4 text-2xl font-semibold text-on-surface">{t('Authentication Required')}</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">Bạn cần đăng nhập bằng tài khoản thật để truy cập nội dung này.</p>
        <Link to="/login" state={{ from: destination }} className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary focus:outline-none focus:ring-2 focus:ring-primary">{t('Sign In')}</Link>
      </div>
    </div>
  );
};
