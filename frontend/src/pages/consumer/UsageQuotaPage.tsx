import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import type { Subscription } from '../../types';

export const UsageQuotaPage: React.FC = () => {
  // Sprint 3: Monthly commercial billing quotas are scheduled for Sprint 4.
  // Isolated from legacy mock data to ensure zero fabricated monthly quota usage.
  const subscriptions: Subscription[] = [];
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('API Usage, Quota & Rate Limits')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Real-time metrics tracking monthly request allowances versus instantaneous burst rate limits.')}
          </p>
        </div>
        <Button
          variant="secondary"
          icon="explore"
          onClick={() => navigate('/marketplace')}
        >
          {t('Explore Marketplace')}
        </Button>
      </div>

      {/* Honest Status Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
        <div>
          <strong className="text-on-surface font-semibold">Cơ chế quản lý hạn ngạch Sprint 3: </strong>
          <span>
            Hạn ngạch gói cước hàng tháng (Monthly Billing Quota) sẽ liên kết với các gói trả phí trong Sprint 4. Hiện tại trong Sprint 3, các lượt gọi kiểm thử được quản lý qua <strong>Gói dùng thử Sandbox (5 lượt gọi/API/24h)</strong> được lưu trữ an toàn trong cơ sở dữ liệu PostgreSQL.
          </span>
        </div>
      </div>

      {/* Critical Concept Callout: Quota != Rate Limit */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <div className="space-y-1 text-body-sm leading-relaxed">
            <h3 className="font-bold text-on-surface text-body-md">{t('Understanding Quota vs Rate Limit (US-23 Architecture)')}</h3>
            <p className="text-on-surface-variant">
              <strong>Hạn mức hàng tháng (Monthly Quota):</strong> Tổng khối lượng gọi tối đa trong chu kỳ thanh toán hiện tại (ví dụ: 50.000 lượt gọi/tháng), được theo dõi bởi hệ thống đo lường ngầm.
            </p>
            <p className="text-on-surface-variant">
              <strong>Giới hạn tốc độ (Rate Limit):</strong> Tốc độ gọi tức thời tối đa (ví dụ: 25 yêu cầu/giây), được kiểm soát qua cửa sổ trượt (sliding window) Redis. Một client còn 90% hạn mức tháng nhưng gọi dồn dập vượt quá ngưỡng RPS vẫn sẽ nhận phản hồi HTTP 429.
            </p>
          </div>
        </div>
      </div>

      {/* Subscribed APIs Usage Cards */}
      <div className="space-y-6">
        <h2 className="text-headline-sm font-bold text-on-surface">{t('Active Subscription Breakdown')}</h2>
        {subscriptions.length === 0 ? (
          <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-[44px] text-outline mb-3 block">pie_chart</span>
            <h3 className="text-body-lg font-bold text-on-surface mb-1">{t('Chưa có đăng ký API')}</h3>
            <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-5">
              Chưa có gói cước thương mại nào được kích hoạt. Hãy trải nghiệm dùng thử các API công khai với Sandbox Grants trước khi đăng ký gói chính thức.
            </p>
            <Button variant="primary" icon="explore" onClick={() => navigate('/marketplace')}>
              {t('Explore Marketplace')}
            </Button>
          </div>
        ) : (
          subscriptions.map(sub => {
            const usedPercent = Math.min(100, Math.round((sub.quotaUsed / sub.quotaLimit) * 100));
            return (
              <div key={sub.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{sub.apiIcon}</span>
                    </div>
                    <div>
                      <h3 className="text-headline-sm font-bold text-on-surface">{sub.apiName}</h3>
                      <span className="text-body-sm text-on-surface-variant">{sub.planName} Tier</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">{t('Velocity Limit (RPS)')}</span>
                      <span className="text-body-md font-bold font-code-md text-primary">{sub.rateLimitPerSec} {t('req/sec')}</span>
                    </div>
                    <Badge variant={usedPercent > 80 ? 'warning' : 'success'}>
                      {usedPercent > 80 ? 'Heavy Usage' : 'Healthy'}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">{t('Billing Period Consumption')}</span>
                    <span className="font-code-md font-bold text-on-surface">
                      {sub.quotaUsed.toLocaleString()} / {sub.quotaLimit.toLocaleString()} lượt ({usedPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usedPercent > 90 ? 'bg-error' : usedPercent > 75 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/20 text-body-sm">
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">{t('Remaining Quota')}</span>
                    <span className="font-code-md font-semibold text-emerald-600">
                      {(sub.quotaLimit - sub.quotaUsed).toLocaleString()} lượt
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">{t('Billing Interval')}</span>
                    <span className="font-semibold text-on-surface">{t('Monthly Recurring')}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">{t('Next Reset Date')}</span>
                    <span className="font-code-sm text-on-surface-variant">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">{t('Overage Behavior')}</span>
                    <span className="font-semibold text-error">{t('Block with 429')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
