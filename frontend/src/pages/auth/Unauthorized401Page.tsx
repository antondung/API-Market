import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';

export const Unauthorized401Page: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = (location.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('developer@apihub.dev');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = login('consumer', 'USER');
      setLoading(false);
      if (!res.success) {
        setError(res.error ?? 'Không thể đăng nhập nhanh ở môi trường này.');
        return;
      }
      navigate(returnUrl);
    }, 500);
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -top-32 pointer-events-none -z-10" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary-container/30 blur-2xl -bottom-20 right-10 pointer-events-none -z-10" />

      <div className="flex flex-col w-full items-center justify-center max-w-md">
        {/* Top navigation crumb / status pill */}
        <div className="mb-6 flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full shadow-sm text-xs">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="font-mono text-on-surface-variant uppercase tracking-wider font-semibold">{t('Authentication Required')}</span>
          <span className="text-outline">/</span>
          <span className="font-mono text-primary font-medium">{returnUrl}</span>
        </div>

        {/* Main Login Card */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 flex flex-col gap-6 relative transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="flex flex-col gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mx-auto mb-2 shadow-md">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <h1 className="font-headline font-semibold text-2xl text-on-surface">{t('Sign in to continue')}</h1>
            <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto">
              {t('You need to authenticate your developer credentials to access this protected workspace.')}
            </p>
          </div>

          {/* Destination Summary Pill */}
          <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center gap-3 border border-outline-variant/20">
            <div className="p-2 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">subdirectory_arrow_right</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider">{t('Destination')}</span>
              <span className="font-mono text-xs text-on-surface truncate">
                {t('Redirects to')} <span className="text-primary font-semibold">{returnUrl}</span>
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="email">{t('Developer Email')}</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-outline text-[18px]">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface" htmlFor="password">{t('Password or API Token')}</label>
                <a href="#forgot" className="text-xs text-primary hover:underline">{t('Forgot?')}</a>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-outline text-[18px]">key</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-mono text-sm pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-body-sm text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading} icon={<span className="material-symbols-outlined text-base">login</span>}>
              {t('Sign In to Continue')}
            </Button>
          </form>

          {/* Tuy chon dang nhap nhanh: chi hien o moi truong development */}
          {import.meta.env.DEV && (
          <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider text-center">{t('Fast Dev Login Bypass')}</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { if (login('consumer', 'USER').success) navigate('/dashboard'); }}
                className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded text-xs font-medium text-on-surface transition-colors"
              >
                {t('Consumer')}
              </button>
              <button
                type="button"
                onClick={() => { if (login('provider', 'API_PROVIDER').success) navigate('/provider'); }}
                className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded text-xs font-medium text-on-surface transition-colors"
              >
                {t('Provider')}
              </button>
              <button
                type="button"
                onClick={() => { if (login('admin', 'ADMIN').success) navigate('/admin'); }}
                className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded text-xs font-medium text-on-surface transition-colors"
              >
                {t('Admin')}
              </button>
            </div>
          </div>
          )}

          {/* Footer info */}
          <div className="pt-2 flex items-center justify-between text-xs text-outline">
            <span>SSO / SAML Enabled</span>
            <Link to="/register" className="text-primary hover:underline font-medium">{t('Create Account')}</Link>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8 flex items-center gap-4 text-outline-variant font-mono text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-primary">verified_user</span>
            <span>SOC2 Type II Certified</span>
          </div>
          <span>•</span>
          <span className="text-on-surface-variant">TLS 1.3 End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};
