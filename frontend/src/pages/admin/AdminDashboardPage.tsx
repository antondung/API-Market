import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import { listAdminUsers } from '../../services/adminUsersApi';
import { ApiError, formatBackendErrorMessage } from '../../services/authApi';

export const AdminDashboardPage: React.FC = () => {
  const { verifications, apis, reports } = useApp();
  const { t } = useLanguage();

  const [liveUserCount, setLiveUserCount] = useState<number | null>(null);
  const [liveActiveProviderCount, setLiveActiveProviderCount] = useState<number | null>(null);
  const [liveTotalProviderCount, setLiveTotalProviderCount] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoadingUsers(true);
        setUserFetchError(null);
      }
    });

    Promise.all([
      listAdminUsers({ page: 1, pageSize: 1 }, controller.signal),
      listAdminUsers({ role: 'Provider', active: true, page: 1, pageSize: 1 }, controller.signal),
      listAdminUsers({ role: 'Provider', page: 1, pageSize: 1 }, controller.signal),
    ])
      .then(([allUsersRes, activeProvidersRes, totalProvidersRes]) => {
        setLiveUserCount(allUsersRes.total);
        setLiveActiveProviderCount(activeProvidersRes.total);
        setLiveTotalProviderCount(totalProvidersRes.total);
      })
      .catch(reason => {
        if (reason instanceof ApiError && reason.code === 'ABORTED') return;
        setUserFetchError(formatBackendErrorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingUsers(false);
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  const pendingVerifications = verifications.filter(v => v.status === 'Pending').length;
  const pendingReviews = apis.filter(a => a.status === 'Submitted' || a.status === 'UnderReview').length;
  const pendingReports = reports.filter(r => r.status === 'Pending' || r.status === 'Under Investigation').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold font-code-md">
              <span className="material-symbols-outlined text-[14px] mr-1 align-middle">shield</span>
              {t('System Administrator')}
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
            {t('Admin Console & Global Governance')}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t('Real-time oversight of platform infrastructure, tenant security, and provider verification queues.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="download"
            disabled
            title="Chưa được backend Sprint 1 hỗ trợ"
          >
            {t('Export Telemetry')}
          </Button>
          <Button
            variant="outline"
            icon="shield_lock"
            disabled
            title="Chưa được backend Sprint 1 hỗ trợ"
          >
            {t('Lockdown Mode')}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span>
          <strong>Sprint 1 Live API:</strong> Dữ liệu Người dùng và Nhà cung cấp bên dưới được truy vấn trực tiếp từ backend qua <code>/api/admin/users</code>. Các phân hệ còn lại là dữ liệu minh họa cho Sprint sau.
        </span>
        {userFetchError && (
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại kết nối
          </Button>
        )}
      </div>

      {userFetchError && (
        <div role="alert" className="rounded-xl border border-error/30 bg-error-container/20 p-4 text-error text-body-sm flex items-center justify-between">
          <span>Lỗi tải dữ liệu người dùng: {userFetchError}</span>
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Platform Metrics (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users (LIVE) */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <Badge variant="success">Live API</Badge>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Total Users')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">
              {loadingUsers ? '...' : (liveUserCount ?? 0)}
            </span>
            <span className="text-code-sm text-on-surface-variant font-medium">{t('accounts')}</span>
          </div>
          <Link to="/admin/users" className="text-body-sm text-primary font-semibold hover:underline mt-4 block">
            {t('Manage Users')} →
          </Link>
        </div>

        {/* Card 2: Active Providers (LIVE) */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
            </div>
            <Badge variant="success">Live API</Badge>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Active Providers')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">
              {loadingUsers ? '...' : (liveActiveProviderCount ?? 0)}
            </span>
            <span className="text-code-sm text-on-surface-variant font-medium">
              / {loadingUsers ? '...' : (liveTotalProviderCount ?? 0)} {t('providers')}
            </span>
          </div>
          <Link to="/admin/users" className="text-body-sm text-primary font-semibold hover:underline mt-4 block">
            {t('Filter Providers')} →
          </Link>
        </div>

        {/* Card 3: Verification Queue (DEMO) */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
            <Badge variant="neutral">Sprint sau</Badge>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Pending Verifications')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">{pendingVerifications}</span>
            <span className="text-code-sm text-amber-600 font-semibold">{t('Requires Action')}</span>
          </div>
          <Link to="/admin/verifications" className="text-body-sm text-primary font-semibold hover:underline mt-4 block">
            {t('Review Queue →')}
          </Link>
        </div>

        {/* Card 4: Reports Queue (DEMO) */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[22px]">report</span>
            </div>
            <Badge variant="neutral">Sprint sau</Badge>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Abuse Reports')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">{pendingReports}</span>
            <span className="text-code-sm text-error font-semibold">{t('Open tickets')}</span>
          </div>
          <Link to="/admin/reports" className="text-body-sm text-primary font-semibold hover:underline mt-4 block">
            {t('Moderation Queue →')}
          </Link>
        </div>
      </div>

      {/* Admin Modules Navigation Grid */}
      <div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-4">{t('Core Governance Modules')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="p-6 rounded-2xl bg-surface-container-low border border-primary/40 hover:border-primary hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">group</span>
                </div>
                <Badge variant="success">Tích hợp Live</Badge>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('User Management')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Search accounts, lock/unlock malicious consumers, manage roles, and review session tokens.')}
              </p>
            </div>
            <span className="text-primary font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Manage Users')} ({loadingUsers ? '...' : (liveUserCount ?? 0)}) →
            </span>
          </Link>

          <Link
            to="/admin/api-reviews"
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md transition-all flex flex-col justify-between opacity-80"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">rate_review</span>
                </div>
                <Badge variant="neutral">Dữ liệu mẫu</Badge>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Reviews & Publishing')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Approve, reject, or suspend APIs. Audit upstream URLs and legal ownership declarations.')}
              </p>
            </div>
            <span className="text-on-surface-variant font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Review Submissions')} ({pendingReviews}) →
            </span>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md transition-all flex flex-col justify-between opacity-80"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <Badge variant="neutral">Dữ liệu mẫu</Badge>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('Enterprise Audit Trail')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Immutable activity logs recording every lock, suspension, role assignment, and key revocation.')}
              </p>
            </div>
            <span className="text-on-surface-variant font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Inspect Audit Log →')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
