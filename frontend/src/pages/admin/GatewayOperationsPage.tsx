import React from 'react';
import { useLanguage } from '../../i18n';

export const GatewayOperationsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('System Monitoring & API Gateway Operations')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Real-time metrics for Data Plane (:4000) routing, Redis quota counters, and Background Worker scheduled jobs.')}
        </p>
      </div>

      {/* Architecture Separation Callout (Control Plane vs Data Plane) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-on-surface text-body-md">Control Plane (:3000)</span>
            <span className="material-symbols-outlined text-primary">hub</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">{t('Online')}</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('Express 5 REST API handling Auth, RBAC, Subscriptions, and Admin CRUD.')}
          </p>
          <span className="text-[12px] font-code-sm text-emerald-600 mt-3 block font-semibold">
            {t('Health: 100% OK (PostgreSQL connected)')}
          </span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-on-surface text-body-md">Data Plane Gateway (:4000)</span>
            <span className="material-symbols-outlined text-emerald-600">speed</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-code-md">&lt; 2 ms</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('Measured proxy overhead (US-23). Key verification and HMAC header signing.')}
          </p>
          <span className="text-[12px] font-code-sm text-emerald-600 mt-3 block font-semibold">
            {t('Status: Ready for production traffic')}
          </span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-on-surface text-body-md">Redis Counter Cluster (:6379)</span>
            <span className="material-symbols-outlined text-amber-600">memory</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">&lt; 1 ms</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('In-memory sliding window rate limits & active sandbox quota counters.')}
          </p>
          <span className="text-[12px] font-code-sm text-emerald-600 mt-3 block font-semibold">
            {t('Mode: Fail-Closed Protection')}
          </span>
        </div>
      </div>

      {/* Background Workers Schedule */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="text-headline-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">schedule</span>
          {t('Background Worker Cron Jobs')}
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-on-surface block">{t('Quota Reset Worker (Cron: 0 0 1 * *)')}</span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Resets monthly quota counters in Redis & PostgreSQL at midnight on the 1st of every month.')}
              </span>
            </div>
            <span className="text-code-sm font-code-md bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold whitespace-nowrap">
              {t('Next run: Nov 01, 00:00 UTC')}
            </span>
          </div>

          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-on-surface block">{t('Subscription Expiration Sweeper (Every hour)')}</span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Marks past-due subscriptions as Expired and triggers gateway route eviction.')}
              </span>
            </div>
            <span className="text-code-sm font-code-md bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold whitespace-nowrap">
              {t('Status: Active daemon')}
            </span>
          </div>

          <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-on-surface block">{t('Usage Aggregation Pipeline (Every 15m)')}</span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Aggregates async usage logs into daily summary partitions for analytics queries.')}
              </span>
            </div>
            <span className="text-code-sm font-code-md bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold whitespace-nowrap">
              {t('Status: Healthy & Listening')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
