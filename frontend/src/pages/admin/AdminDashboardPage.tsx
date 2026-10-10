import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const AdminDashboardPage: React.FC = () => {
  const { users, verifications, apis, reports } = useApp();
  const { t } = useLanguage();

  const [lockdownMode, setLockdownMode] = useState(false);

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
            onClick={() => alert('Exporting platform telemetry JSON log...')}
          >
            {t('Export Telemetry')}
          </Button>
          <Button
            variant={lockdownMode ? 'danger' : 'outline'}
            icon="shield_lock"
            onClick={() => setLockdownMode(!lockdownMode)}
          >
            {lockdownMode ? t('LOCKDOWN ACTIVE') : t('Lockdown Mode')}
          </Button>
        </div>
      </div>

      {lockdownMode && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
            <span className="font-bold text-body-md">
              {t('EMERGENCY LOCKDOWN ENGAGED: All new unauthenticated registrations and third-party webhooks suspended.')}
            </span>
          </div>
          <Button size="sm" variant="danger" onClick={() => setLockdownMode(false)}>
            {t('Disengage')}
          </Button>
        </div>
      )}

      {/* Platform Metrics (Bento Grid matching Stitch code.html) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Total Users')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">{users.length}</span>
            <span className="text-code-sm text-on-surface-variant font-medium">{t('accounts')}</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, Math.max(10, users.length * 10))}%` }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">corporate_fare</span>
          </div>
          <span className="text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">{t('Active Providers')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-code-md">
              {users.filter(u => u.role === 'API_PROVIDER').length}
            </span>
            <span className="text-code-sm text-on-surface-variant font-medium">{t('active')}</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, Math.max(5, users.filter(u => u.role === 'API_PROVIDER').length * 20))}%` }} />
          </div>
        </div>

        {/* Card 3: Verification Queue */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
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

        {/* Card 4: Reports Queue */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[24px]">report</span>
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
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('User Management')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Search accounts, lock/unlock malicious consumers, manage roles, and review session tokens.')}
              </p>
            </div>
            <span className="text-primary font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Manage Users')} ({users.length}) →
            </span>
          </Link>

          <Link
            to="/admin/api-reviews"
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">rate_review</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Reviews & Publishing')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Approve, reject, or suspend APIs. Audit upstream URLs and legal ownership declarations.')}
              </p>
            </div>
            <span className="text-primary font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Review Submissions')} ({pendingReviews}) →
            </span>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('Enterprise Audit Trail')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Immutable activity logs recording every lock, suspension, role assignment, and key revocation.')}
              </p>
            </div>
            <span className="text-primary font-semibold text-body-sm flex items-center gap-1 mt-6">
              {t('Inspect Audit Log →')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
