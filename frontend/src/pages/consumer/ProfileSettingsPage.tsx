import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { t } = useLanguage();

  // Trang nay nam trong route duoc bao ve nen currentUser luon co gia tri.
  const user = currentUser!;

  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company || '');
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...user,
      name,
      company,
      twoFactorEnabled: twoFactor
    });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Account & Profile Settings')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Manage your developer profile, security credentials, and organization context.')}
        </p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-headline-sm font-bold text-on-surface">{user.name}</h2>
              <Badge variant="primary">{user.role}</Badge>
            </div>
            <p className="text-body-sm text-on-surface-variant font-code-sm">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Full Name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Organization / Company')}</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20">
            <h3 className="text-body-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">security</span>
              {t('Security & Two-Factor Authentication')}
            </h3>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-on-surface text-body-sm block">{t('Enable Authenticator App 2FA (TOTP)')}</span>
                <span className="text-body-sm text-on-surface-variant">
                  {t('Protect against unauthorized API key issuance and account compromises.')}
                </span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm text-emerald-600 font-medium">
              {successMsg && t('Profile settings updated successfully!')}
            </span>
            <Button type="submit" variant="primary" size="md">
              {t('Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
