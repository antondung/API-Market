import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { MethodBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const ConsumerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { apis, subscriptions, apiKeys, requestLogs, budget } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const activeSubs = subscriptions.filter(s => s.status === 'Active');
  const activeKeys = apiKeys.filter(k => !k.isRevoked);

  const totalQuotaLimit = activeSubs.reduce((acc, s) => acc + s.quotaLimit, 0);
  const totalQuotaUsed = activeSubs.reduce((acc, s) => acc + s.quotaUsed, 0);
  const quotaRemainingPercent = totalQuotaLimit > 0
    ? Math.max(0, Math.round(((totalQuotaLimit - totalQuotaUsed) / totalQuotaLimit) * 100))
    : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold font-code-md uppercase">
              {t('Consumer Workspace')}
            </span>
            <span className="text-body-sm text-on-surface-variant font-code-md">
              ID: {currentUser.id}
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Welcome back,')} {currentUser.name}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Monitor active subscriptions, credential consumption, and real-time Gateway telemetry.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="explore"
            onClick={() => navigate('/marketplace')}
          >
            {t('Explore Catalog')}
          </Button>
          <Button
            variant="primary"
            icon="key"
            onClick={() => navigate('/dashboard/api-keys')}
          >
            {t('Generate Key')}
          </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Active Subscriptions */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Subscribed APIs')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">subscriptions</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {activeSubs.length}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Active production and sandbox endpoints.')}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/subscriptions" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('View APIs')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              {t('Active')}
            </span>
          </div>
        </div>

        {/* Metric 2: API Keys */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Active Credentials')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">vpn_key</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {activeKeys.length} {t('Keys')}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Secured with SHA-256 hash in Control Plane DB.')}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/api-keys" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Manage Keys')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {t('Zero plaintext')}
            </span>
          </div>
        </div>

        {/* Metric 3: Quota */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Monthly Quota')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">pie_chart</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-on-surface font-code-md">
                {quotaRemainingPercent}% {t('Left')}
              </span>
              <span className="text-code-sm text-on-surface-variant font-code-sm">
                {(totalQuotaUsed / 1000).toFixed(1)}k / {(totalQuotaLimit / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${100 - quotaRemainingPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/usage" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Usage Details')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-on-surface-variant">
              {t('Resets in')} {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}d
            </span>
          </div>
        </div>

        {/* Metric 4: Cost Guard */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Cost Guard Budget')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">savings</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-on-surface font-code-md">
                ${budget.spentUsd.toFixed(2)}
              </span>
              <span className="text-code-sm text-on-surface-variant font-code-sm">
                {t('Cap:')} ${budget.monthlyBudgetUsd}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (budget.spentUsd / budget.monthlyBudgetUsd) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/cost-guard" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Notification Center')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-emerald-600 font-semibold">{t('100% Cutoff On')}</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Tools */}
      <div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-4">{t('Quick Actions & Workspaces')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/marketplace"
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('Explore APIs')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Browse verified microservices, financial settlement, and AI models.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Browse Catalog')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            to={apis.length > 0 ? `/api/${apis[0].id}/playground` : '/marketplace'}
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">terminal</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Playground')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Send test payloads, inspect latency, and test SSRF guard policies.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Launch Playground')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            to="/dashboard/api-keys"
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">key</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Keys Vault')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Generate secret tokens, rotate credentials, and inspect last-used timestamps.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Manage Credentials')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Telemetry Stream */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Recent Activity & Gateway Telemetry')}</h2>
            <p className="text-body-sm text-on-surface-variant">
              {t('Live asynchronous usage stream with sensitive data redaction applied (US-24).')}
            </p>
          </div>
          <Link
            to="/dashboard/history"
            className="px-3.5 py-1.5 rounded-xl border border-outline-variant text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t('View Full Logs')} ({requestLogs.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
              <tr>
                <th className="px-4 py-3">{t('Timestamp')}</th>
                <th className="px-4 py-3">{t('Method')}</th>
                <th className="px-4 py-3">{t('Endpoint & API')}</th>
                <th className="px-4 py-3">{t('Status')}</th>
                <th className="px-4 py-3">{t('Latency')}</th>
                <th className="px-4 py-3">{t('Key Prefix')}</th>
                <th className="px-4 py-3">{t('Redaction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {requestLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">history</span>
                    <p className="font-semibold text-body-md text-on-surface">{t('Chưa có lịch sử gọi API')}</p>
                    <p className="text-body-sm text-on-surface-variant/80 mt-1 max-w-md mx-auto">
                      {t('Khi bạn thực hiện lệnh gọi qua Gateway hoặc dùng thử trên Sandbox, các bản ghi telemetry sẽ tự động xuất hiện tại đây.')}
                    </p>
                  </td>
                </tr>
              ) : (
                requestLogs.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 font-code-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <MethodBadge method={log.method} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-code-md font-semibold text-on-surface block">{log.endpoint}</span>
                    <span className="text-[12px] text-on-surface-variant">{log.apiName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-code-sm font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-600' :
                      log.statusCode === 429 ? 'bg-amber-500/10 text-amber-700' : 'bg-error-container text-on-error-container'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-code-md text-emerald-600 font-semibold">
                    {log.latencyMs} ms
                  </td>
                  <td className="px-4 py-3 font-code-sm text-on-surface-variant">
                    {log.apiKeyPrefix}...
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-code-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                      [REDACTED]
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
