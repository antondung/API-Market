import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';

/**
 * Types prepared for Sprint 3 US-05 Backend API integration (PR #79: codex/sprint3-profile).
 * Endpoints: PATCH /api/auth/me, POST /api/auth/change-password.
 * Note: PR #79 is currently UNMERGED into develop, so these actions remain gated/read-only.
 */
export interface UpdateProfileInput {
  name: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // ProtectedRoute ensures currentUser is defined.
  const user = currentUser!;

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

        {/* PR #79 Gating & Honest Architecture Status Banner */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
          <div>
            <strong className="text-on-surface font-semibold">Trạng thái tích hợp US-05 (PR #79): </strong>
            <span>
              API Cập nhật hồ sơ (<code>PATCH /api/auth/me</code>) và Đổi mật khẩu (<code>POST /api/auth/change-password</code>) đang trong quá trình review/merge (nhánh <code>origin/codex/sprint3-profile</code>). Để tránh lỗi 404 và không lưu giả lập sai lệch dữ liệu, các form thao tác tạm thời được khóa ở chế độ xem trước an toàn.
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Full Name')}</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none cursor-not-allowed opacity-90"
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

          {/* Change Password Section (Prepared for PR #79) */}
          <div className="pt-6 border-t border-outline-variant/20">
            <h3 className="text-body-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">lock_reset</span>
              Đổi mật khẩu tài khoản
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 opacity-70">
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  disabled
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2FA Section */}
          <div className="pt-6 border-t border-outline-variant/20">
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

          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">Chờ tích hợp PR #79 vào develop</span>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled
              title="Đang chờ merge PR #79 vào develop"
            >
              {t('Save Changes')} (PR #79 Pending)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
