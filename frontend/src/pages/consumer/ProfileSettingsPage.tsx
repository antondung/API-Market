import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import { updateProfile, changePassword } from '../../services/authApi';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const { t } = useLanguage();

  // ProtectedRoute ensures currentUser is defined.
  const user = currentUser!;

  const [name, setName] = useState(user.name);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const trimmedName = name.trim();
  const nameChanged = trimmedName.length > 0 && trimmedName !== user.name;

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nameChanged) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      await updateProfile({ name: trimmedName });
      await refreshCurrentUser();
      setProfileSaved(true);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      await changePassword({ currentPassword, newPassword });
      // The backend keeps this session alive and revokes the others.
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSaved(true);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu.');
    } finally {
      setPasswordSaving(false);
    }
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
        {/* Profile Header */}
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

        {/* Profile Details Form */}
        <form className="space-y-6" onSubmit={handleSaveProfile}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="profile-name" className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Full Name')}</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => { setName(e.target.value); setProfileSaved(false); }}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-md outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Email Address')}</label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none cursor-not-allowed opacity-90"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">Vai trò tài khoản (Role)</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none cursor-not-allowed opacity-90"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">Mã định danh (User ID)</label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container font-code-sm text-on-surface text-body-md outline-none cursor-not-allowed opacity-90"
              />
            </div>
          </div>

          {profileError && <p role="alert" className="text-body-sm text-error">{profileError}</p>}
          {profileSaved && <p role="status" className="text-body-sm text-primary">Đã cập nhật hồ sơ.</p>}

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={profileSaving || !nameChanged}
            >
              {profileSaving ? 'Đang lưu...' : t('Save Changes')}
            </Button>
          </div>
        </form>

        {/* Change Password Section */}
        <form className="pt-6 mt-6 border-t border-outline-variant/20 space-y-5" onSubmit={handleChangePassword}>
          <h3 className="text-body-lg font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lock_reset</span>
            Đổi mật khẩu tài khoản
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="current-password" className="text-body-sm font-medium text-on-surface block mb-1.5">Mật khẩu hiện tại</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSaved(false); }}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-md outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="text-body-sm font-medium text-on-surface block mb-1.5">Mật khẩu mới</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordSaved(false); }}
                placeholder="Tối thiểu 12 ký tự"
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-md outline-none focus:border-primary"
              />
            </div>
          </div>

          {passwordError && <p role="alert" className="text-body-sm text-error">{passwordError}</p>}
          {passwordSaved && (
            <p role="status" className="text-body-sm text-primary">
              Đã đổi mật khẩu. Các phiên đăng nhập ở thiết bị khác đã bị thu hồi.
            </p>
          )}

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={passwordSaving || currentPassword.length === 0 || newPassword.length < 12}
            >
              {passwordSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>

        {/* 2FA Section (unchanged: backend has no 2FA endpoint yet) */}
        <div className="pt-6 mt-6 border-t border-outline-variant/20">
          <h3 className="text-body-lg font-bold text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
            {t('Security & Two-Factor Authentication')}
          </h3>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/30 cursor-not-allowed opacity-80">
            <input
              type="checkbox"
              checked={false}
              disabled
              className="rounded accent-primary w-4 h-4 mt-0.5 cursor-not-allowed"
            />
            <div>
              <span className="font-semibold text-on-surface text-body-sm block">{t('Enable Authenticator App 2FA (TOTP)')}</span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Protect against unauthorized API key issuance and account compromises.')} (Dự kiến kích hoạt trong phiên bản tiếp theo)
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};