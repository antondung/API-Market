import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const MySubscriptionsPage: React.FC = () => {
  const { subscriptions } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('My API Subscriptions')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Manage your subscribed endpoints, current quota periods, and automated renewal cycles.')}
          </p>
        </div>
        <Button
          variant="primary"
          icon="explore"
          onClick={() => navigate('/marketplace')}
        >
          {t('Explore Marketplace')}
        </Button>
      </div>

      {/* Honest Sprint 3 Status Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
        <div>
          <strong className="text-on-surface font-semibold">Lộ trình triển khai (Sprint 3 & Sprint 4): </strong>
          <span>
            Tính năng Đăng ký gói cước thương mại trả phí (Paid Subscriptions) và chu kỳ thanh toán tự động dự kiến ra mắt trong Sprint 4. Trong Sprint 3, bạn có thể kiểm thử toàn bộ API đã công khai thông qua <strong>Gói dùng thử Sandbox (5 lượt gọi miễn phí / 24h)</strong> trực tiếp tại trang chi tiết API hoặc Playground.
          </span>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">subscriptions</span>
          <h3 className="text-headline-sm font-bold text-on-surface">{t('No Subscriptions Found')}</h3>
          <p className="text-body-sm text-on-surface-variant mt-1 mb-4 max-w-md mx-auto">
            Chưa có gói thuê bao trả phí nào được kích hoạt. Hãy trải nghiệm dùng thử các API công khai với Sandbox Grants trước khi đăng ký gói chính thức.
          </p>
          <Button variant="primary" icon="explore" onClick={() => navigate('/marketplace')}>
            {t('Explore Marketplace')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => {
            const usedPercent = Math.min(100, Math.round((sub.quotaUsed / sub.quotaLimit) * 100));
            return (
              <div
                key={sub.id}
                className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left API Details */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px]">{sub.apiIcon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/api/${sub.apiId}`} className="text-headline-sm font-bold text-on-surface hover:text-primary transition-colors">
                        {sub.apiName}
                      </Link>
                      <StatusBadge status={sub.status} />
                      <Badge variant="primary">{sub.planName}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
                      <span>{t('Rate Limit:')} <strong className="text-on-surface">{sub.rateLimitPerSec} {t('req/sec')}</strong></span>
                      <span>•</span>
                      <span>{t('Billing:')} <strong className="text-on-surface">${sub.priceMonthly}/tháng</strong></span>
                      <span>•</span>
                      <span>{t('Renews:')} <span className="font-code-sm">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span></span>
                    </div>

                    {/* Quota bar */}
                    <div className="w-full max-w-md mt-4">
                      <div className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface-variant">{t('Quota Consumption')}</span>
                        <span className="font-code-md font-semibold text-on-surface">
                          {sub.quotaUsed.toLocaleString()} / {sub.quotaLimit.toLocaleString()} ({usedPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            usedPercent > 90 ? 'bg-error' : usedPercent > 70 ? 'bg-amber-500' : 'bg-primary'
                          }`}
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="terminal"
                    onClick={() => navigate(`/api/${sub.apiId}/playground`)}
                  >
                    {t('Test in Playground')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="key"
                    onClick={() => navigate('/dashboard/api-keys')}
                  >
                    {t('API Keys')}
                  </Button>
                  {sub.status === 'Active' && (
                    <button
                      type="button"
                      disabled
                      title="Chức năng hủy thuê bao sẽ khả dụng khi backend kích hoạt thanh toán Sprint 4"
                      className="text-body-sm text-on-surface-variant/60 cursor-not-allowed font-medium px-2 py-1 mt-1"
                    >
                      {t('Cancel Subscription')} (Sprint 4)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
