import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';
import type { User } from '../../types';

export const RegisterPage: React.FC = () => {
  const { login, registerWithBackend, backendOnline, isBackendMode, setCurrentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<'USER' | 'API_PROVIDER'>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 12) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 12 ký tự theo chuẩn bảo mật Sprint 1 Backend.');
      return;
    }

    setIsLoading(true);

    try {
      if (isBackendMode && backendOnline) {
        // Register with backend Sprint 1
        const backendRole = selectedRole === 'API_PROVIDER' ? 'Provider' : 'Consumer';
        const res = await registerWithBackend({
          email,
          password,
          role: backendRole,
          name: name || undefined
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Đăng ký tài khoản thất bại');
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        setSuccessMessage('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      // Local registration
      const newUser: User = {
        id: `usr_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        role: selectedRole,
        company: company || 'Độc lập',
        status: 'Active',
        twoFactorEnabled: false,
        quotaUsedPercent: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      let usersList: User[] = [];
      const saved = localStorage.getItem('apihub_users');
      if (saved) {
        try { usersList = JSON.parse(saved); } catch {}
      }
      usersList.push(newUser);
      localStorage.setItem('apihub_users', JSON.stringify(usersList));
      setCurrentUser(newUser);
      setIsLoading(false);
      setSuccessMessage('Đăng ký tài khoản thành công! Đang mở không gian làm việc...');
      setTimeout(() => {
        if (selectedRole === 'API_PROVIDER') navigate('/provider/verification');
        else navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Lỗi xử lý đăng ký');
    }
  };

  return (
    <div className="pt-20 pb-20 px-6 max-w-xl mx-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Select Your API HUB Role')}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('Tailor your workspace based on whether you integrate or distribute APIs (US-01).')}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-body-sm">
              <p className="font-semibold">{t('Đăng ký thất bại')}</p>
              <p className="mt-0.5 text-[13px]">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
            <div className="text-body-sm">
              <p className="font-semibold">{t('Thành công!')}</p>
              <p className="mt-0.5 text-[13px]">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => setSelectedRole('USER')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedRole === 'USER'
                ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20'
                : 'bg-surface-container border-outline-variant/40 hover:border-outline-variant'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <h3 className="font-bold text-on-surface text-body-md mb-1">{t('API Consumer')}</h3>
            <p className="text-body-sm text-on-surface-variant">
              {t('Discover, test in live playground, manage secret keys, and monitor usage limits.')}
            </p>
          </div>

          <div
            onClick={() => setSelectedRole('API_PROVIDER')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedRole === 'API_PROVIDER'
                ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20'
                : 'bg-surface-container border-outline-variant/40 hover:border-outline-variant'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
            </div>
            <h3 className="font-bold text-on-surface text-body-md mb-1">{t('API Provider')}</h3>
            <p className="text-body-sm text-on-surface-variant">
              {t('Publish endpoints, upload OpenAPI specs, define pricing tiers, and monitor telemetry.')}
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Full Name')}</label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Work Email')}</label>
            <input
              type="email"
              required
              placeholder="name@company.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Organization / Team')}</label>
            <input
              type="text"
              placeholder="e.g. Acme Cloud Systems"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-body-sm font-semibold text-on-surface">{t('Password')}</label>
              <span className="text-[11px] text-on-surface-variant font-medium">Tối thiểu 12 ký tự (chuẩn Sprint 1)</span>
            </div>
            <input
              type="password"
              required
              minLength={12}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Đang tạo tài khoản...' : t('Create Account & Launch Workspace')}
          </Button>
        </form>

        <div className="text-center text-body-sm text-on-surface-variant mt-6">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {t('Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
};
