import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useLanguage } from '../../i18n';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithBackend, backendOnline, isBackendMode, setIsBackendMode } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isBackendMode && backendOnline) {
        // Authenticate directly against Sprint 1 Backend
        const res = await loginWithBackend(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Đăng nhập backend không thành công');
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        const targetRole = res.user?.role || selectedRole;
        if (targetRole === 'ADMIN') navigate('/admin');
        else if (targetRole === 'API_PROVIDER') navigate('/provider');
        else navigate('/dashboard');
        return;
      }

      // Fallback: Local authentication against registered users
      const res = login(email, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Tài khoản không tồn tại hoặc mật khẩu không chính xác.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      if (selectedRole === 'ADMIN') navigate('/admin');
      else if (selectedRole === 'API_PROVIDER') navigate('/provider');
      else navigate('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Đã có lỗi xảy ra khi xác thực');
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-md mx-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-body-sm">
              <p className="font-semibold">{t('Đăng nhập không thành công')}</p>
              <p className="mt-0.5 text-[13px]">{errorMessage}</p>
            </div>
          </div>
        )}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary mx-auto flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">hub</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Sign in to API HUB')}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('Access your developer subscriptions, credentials, or provider suite.')}
          </p>
        </div>

        {/* Backend Sprint 1 Status Pill */}
        <div className="mb-6 p-3 rounded-xl border border-outline-variant/30 bg-surface-container flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-medium text-on-surface">
              {backendOnline ? t('Backend Sprint 1: Online (Port 3000)') : t('Backend: Disconnected (Mock Mode)')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBackendMode(!isBackendMode)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              isBackendMode ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
            }`}
          >
            {isBackendMode ? t('Live API') : t('Demo Mode')}
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Email Address')}</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Password')}</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Target Workspace Role')}</label>
            <CustomSelect<UserRole>
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              options={[
                { value: 'USER', label: t('Consumer Workspace (/dashboard)'), icon: 'person' },
                { value: 'API_PROVIDER', label: t('Provider Workspace (/provider)'), icon: 'corporate_fare' },
                { value: 'ADMIN', label: t('Admin Console (/admin)'), icon: 'shield_person' },
              ]}
              className="w-full"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Đang xác thực...' : t('Sign In & Redirect')}
          </Button>
        </form>

        <div className="text-center text-body-sm text-on-surface-variant mt-6">
          {t("Don't have an account?")}{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            {t('Register now')}
          </Link>
        </div>
      </div>
    </div>
  );
};
