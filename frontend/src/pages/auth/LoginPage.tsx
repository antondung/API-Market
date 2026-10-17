import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import type { UserRole } from '../../types';

const homeForRole = (role: UserRole) => role === 'ADMIN' ? '/admin' : role === 'API_PROVIDER' ? '/provider' : '/dashboard';
const canAccess = (role: UserRole, path: string) => {
  if (path.startsWith('/admin')) return role === 'ADMIN';
  if (path.startsWith('/provider')) return role === 'API_PROVIDER';
  if (path.startsWith('/dashboard')) return role === 'USER' || role === 'API_PROVIDER';
  return path.startsWith('/') && !path.startsWith('//');
};

export const LoginPage: React.FC = () => {
  const { loginWithBackend, backendOnline, checkBackendConnection } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const logoutWarning = (location.state as { logoutWarning?: unknown } | null)?.logoutWarning;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    const result = await loginWithBackend(email.trim().toLowerCase(), password);
    setIsLoading(false);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Đăng nhập không thành công.');
      return;
    }
    const requested = (location.state as { from?: unknown } | null)?.from;
    const destination = typeof requested === 'string' && canAccess(result.user.role, requested) ? requested : homeForRole(result.user.role);
    navigate(destination, { replace: true });
  };

  const retryConnection = async () => {
    setChecking(true);
    const online = await checkBackendConnection();
    setChecking(false);
    if (!online) setErrorMessage('Vẫn chưa thể kết nối đến máy chủ. Vui lòng kiểm tra backend hoặc cấu hình API.');
    else setErrorMessage(null);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-md mx-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary mx-auto flex items-center justify-center mb-3"><span className="material-symbols-outlined">hub</span></div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Sign in to API HUB')}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Vai trò và quyền truy cập được xác định bởi máy chủ.</p>
        </div>

        <div className="mb-6 p-3 rounded-xl border border-outline-variant/30 bg-surface-container flex items-center justify-between gap-3 text-[12px]">
          <span className="flex items-center gap-2 font-medium text-on-surface">
            <span className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {backendOnline ? 'Máy chủ đang kết nối' : 'Chưa kết nối được máy chủ'}
          </span>
          {!backendOnline && <button type="button" onClick={() => void retryConnection()} disabled={checking} className="text-primary font-semibold hover:underline disabled:opacity-50">{checking ? 'Đang thử...' : 'Thử lại'}</button>}
        </div>

        {errorMessage && <div role="alert" className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm">{errorMessage}</div>}
        {typeof logoutWarning === 'string' && <div role="status" className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-body-sm text-on-surface">{logoutWarning}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-body-sm font-semibold text-on-surface block mb-1">{t('Email Address')}</label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="login-password" className="text-body-sm font-semibold text-on-surface block mb-1">{t('Password')}</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>{isLoading ? 'Đang xác thực...' : t('Sign In')}</Button>
        </form>
        <div className="text-center text-body-sm text-on-surface-variant mt-6">{t("Don't have an account?")} <Link to="/register" className="text-primary font-semibold hover:underline">{t('Register now')}</Link></div>
      </div>
    </div>
  );
};
