import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';

export const RegisterPage: React.FC = () => {
  const { registerWithBackend, backendOnline, checkBackendConnection } = useAuth();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'USER' | 'API_PROVIDER'>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!normalizedName || normalizedName.length > 100) return setErrorMessage('Họ tên phải có từ 1 đến 100 ký tự.');
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setErrorMessage('Email không hợp lệ.');
    if (password.length < 12 || password.length > 128) return setErrorMessage('Mật khẩu phải có từ 12 đến 128 ký tự.');

    setIsLoading(true);
    const result = await registerWithBackend({
      email: normalizedEmail,
      password,
      role: selectedRole === 'API_PROVIDER' ? 'Provider' : 'Consumer',
      name: normalizedName,
    });
    setIsLoading(false);
    if (!result.success) return setErrorMessage(result.error || 'Đăng ký tài khoản thất bại.');
    setSuccessMessage('Đăng ký thành công. Tài khoản đã sẵn sàng để đăng nhập.');
    setPassword('');
  };

  return (
    <div className="pt-20 pb-20 px-4 sm:px-6 max-w-xl mx-auto">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Select Your API HUB Role')}</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Chỉ có thể đăng ký Consumer hoặc Provider. Admin do hệ thống cấp.</p>
        </div>

        {!backendOnline && <div className="mb-6 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-body-sm text-on-surface flex items-center justify-between gap-3"><span>Chưa kết nối được máy chủ.</span><button type="button" onClick={() => void checkBackendConnection()} className="text-primary font-semibold hover:underline">Thử lại</button></div>}
        {errorMessage && <div role="alert" className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm">{errorMessage}</div>}
        {successMessage && <div role="status" className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-body-sm"><p>{successMessage}</p><Link to="/login" className="font-semibold underline mt-2 inline-block">Đi đến trang đăng nhập</Link></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" role="radiogroup" aria-label="Vai trò đăng ký">
          {([
            ['USER', 'API Consumer', 'Khám phá và sử dụng API.', 'terminal'],
            ['API_PROVIDER', 'API Provider', 'Cung cấp API và sử dụng Consumer workspace.', 'corporate_fare'],
          ] as const).map(([role, label, description, icon]) => (
            <button key={role} type="button" role="radio" aria-checked={selectedRole === role} onClick={() => setSelectedRole(role)} className={`p-5 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary ${selectedRole === role ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface-container border-outline-variant/40 hover:border-outline-variant'}`}>
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3"><span className="material-symbols-outlined">{icon}</span></span>
              <span className="font-bold text-on-surface text-body-md block">{label}</span>
              <span className="text-body-sm text-on-surface-variant block mt-1">{description}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} noValidate className="space-y-4">
          <div><label htmlFor="register-name" className="text-body-sm font-semibold text-on-surface block mb-1">{t('Full Name')}</label><input id="register-name" type="text" required autoComplete="name" value={name} onChange={event => setName(event.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label htmlFor="register-email" className="text-body-sm font-semibold text-on-surface block mb-1">{t('Work Email')}</label><input id="register-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label htmlFor="register-password" className="text-body-sm font-semibold text-on-surface block mb-1">{t('Password')} <span className="font-normal text-on-surface-variant">(12–128 ký tự)</span></label><input id="register-password" type="password" required autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary" /></div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading || Boolean(successMessage)}>{isLoading ? 'Đang tạo tài khoản...' : t('Create Account')}</Button>
        </form>
        <div className="text-center text-body-sm text-on-surface-variant mt-6">{t('Already have an account?')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('Sign In')}</Link></div>
      </div>
    </div>
  );
};
