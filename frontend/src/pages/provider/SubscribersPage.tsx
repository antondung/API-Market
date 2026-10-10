import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';

export const SubscribersPage: React.FC = () => {
  const { subscriptions } = useApp();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Subscriber & Tenant Management')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Monitor consumers subscribed to your published endpoints, tier distribution, and active quota usage.')}
        </p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Subscriber ID & User')}</th>
              <th className="px-5 py-3.5">{t('Target API Product')}</th>
              <th className="px-5 py-3.5">{t('Tier Plan')}</th>
              <th className="px-5 py-3.5">{t('Quota Usage')}</th>
              <th className="px-5 py-3.5">{t('Monthly Value')}</th>
              <th className="px-5 py-3.5">{t('Status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2">group_off</span>
                    <p className="font-semibold text-on-surface">{t('Chưa có khách hàng đăng ký')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('Các nhà phát triển đăng ký sử dụng các gói cước API của bạn sẽ hiển thị danh sách và mức tiêu thụ hạn ngạch tại đây.')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-on-surface block">{sub.userId}</span>
                    <span className="text-[12px] text-on-surface-variant">Sub: {sub.id}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-on-surface">
                    {sub.apiName}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="primary">{sub.planName}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-code-md text-on-surface font-semibold block">
                      {sub.quotaUsed.toLocaleString()} / {sub.quotaLimit.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {Math.round((sub.quotaUsed / sub.quotaLimit) * 100)}% {t('consumed')}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-code-md font-bold text-emerald-600">
                    ${sub.priceMonthly}.00
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={sub.status === 'Active' ? 'success' : 'danger'}>
                      {t(sub.status)}
                    </Badge>
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
