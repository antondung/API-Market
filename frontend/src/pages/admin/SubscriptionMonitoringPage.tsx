import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const SubscriptionMonitoringPage: React.FC = () => {
  const { subscriptions, suspendSubscriptionByAdmin } = useApp();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Subscription & Payment Sandbox Ledger')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Cross-tenant audit ledger for all active subscriptions, mock transactions, and immediate gateway enforcement.')}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">{t('Administrative Gateway Revocation (US-23):')} </strong>
          {t('Suspending a subscription takes effect immediately on the API Gateway Data Plane. Any client attempting to use associated API Keys will receive HTTP 403 Forbidden.')}
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Subscription ID')}</th>
              <th className="px-5 py-3.5">{t('Consumer ID')}</th>
              <th className="px-5 py-3.5">{t('API Product')}</th>
              <th className="px-5 py-3.5">{t('Tier & Monthly Price')}</th>
              <th className="px-5 py-3.5">{t('Quota Used')}</th>
              <th className="px-5 py-3.5">{t('Status')}</th>
              <th className="px-5 py-3.5 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">subscriptions</span>
                    <p className="font-semibold text-on-surface">{t('No active subscriptions found')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('Subscriptions purchased by consumers across all API products will appear here.')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-4 font-code-md text-primary font-bold">
                    {sub.id}
                  </td>
                  <td className="px-5 py-4 font-code-sm text-on-surface-variant">
                    {sub.userId}
                  </td>
                  <td className="px-5 py-4 font-bold text-on-surface">
                    {sub.apiName}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="primary">{sub.planName}</Badge>
                    <span className="font-code-md ml-2 font-semibold">${sub.priceMonthly}/mo</span>
                  </td>
                  <td className="px-5 py-4 font-code-md">
                    {sub.quotaUsed.toLocaleString()} / {sub.quotaLimit.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={sub.status === 'Active' ? 'success' : 'danger'}>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {sub.status === 'Active' && (
                      <Button
                        size="sm"
                        variant="danger"
                        icon="block"
                        onClick={() => {
                          if (confirm(`Emergency suspend subscription ${sub.id}? Gateway will block immediately.`)) {
                            suspendSubscriptionByAdmin(sub.id);
                          }
                        }}
                      >
                        {t('Suspend')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
