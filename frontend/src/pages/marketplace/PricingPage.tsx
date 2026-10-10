import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const PricingPage: React.FC = () => {
  const { apis } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="pt-20 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="primary" size="md" className="mb-3">{t('Predictable API Economics')}</Badge>
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('Scale Your Applications with Predictable API Economics')}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          {t('From experimental prototypes to ultra-high-concurrency production deployments. Zero hidden egress fees.')}
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-surface-container rounded-xl border border-outline-variant/30 mt-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
              billingCycle === 'monthly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('Monthly Billing')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-lg text-body-sm font-medium transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{t('Annual Billing')}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{t('Save 20%')}</span>
          </button>
        </div>
      </div>

      {/* Featured APIs and their plans */}
      <div className="space-y-12">
        {apis.filter(a => a.status === 'Published').length === 0 ? (
          <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3">price_change</span>
            <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có gói cước API công khai')}</h3>
            <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
              {t('Các nhà cung cấp đang chuẩn bị xuất bản các sản phẩm API đầu tiên lên sàn.')}
            </p>
            <Link to="/marketplace" className="inline-block mt-6">
              <Button variant="primary">
                {t('Khám phá Sàn API')}
              </Button>
            </Link>
          </div>
        ) : (
          apis.filter(a => a.status === 'Published').map(api => (
          <div key={api.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">{api.icon}</span>
                </div>
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">{api.name}</h2>
                  <span className="text-body-sm text-on-surface-variant">{t(api.category)} • {api.providerName}</span>
                </div>
              </div>
              <Link to={`/api/${api.id}`} className="text-body-sm text-primary font-semibold hover:underline">
                {t('View Specs & Endpoints →')}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {api.plans.map(plan => {
                const price = billingCycle === 'yearly' && plan.priceMonthly > 0
                  ? Math.round(plan.priceMonthly * 0.8)
                  : plan.priceMonthly;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-6 border flex flex-col justify-between ${
                      plan.isPopular
                        ? 'bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/20 relative'
                        : 'bg-surface-container border-outline-variant/30'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-label-md font-bold px-3 py-0.5 rounded-full">
                        {t('Recommended')}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-headline-sm font-bold text-on-surface">{plan.name}</h3>
                        <Badge variant={plan.tier === 'Free' ? 'neutral' : 'primary'}>{plan.tier}</Badge>
                      </div>

                      <div className="flex items-baseline gap-1 mb-5">
                        <span className="text-3xl font-extrabold text-on-surface">${price}</span>
                        <span className="text-body-sm text-on-surface-variant">/ tháng</span>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-outline-variant/20 mb-6 text-body-sm">
                        <div className="font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">data_usage</span>
                          <span>{plan.monthlyQuota.toLocaleString()} {t('requests / month')}</span>
                        </div>
                        <div className="text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                          <span>{plan.rateLimitPerSec} {t('req/sec rate limit')}</span>
                        </div>
                        {plan.features.map((f, i) => (
                          <div key={i} className="text-on-surface-variant flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-emerald-600 text-[16px] flex-shrink-0 mt-0.5">check</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant={plan.isPopular ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                      onClick={() => navigate(`/checkout/${api.id}/${plan.id}`)}
                    >
                      {plan.priceMonthly === 0 ? t('Activate Free Sandbox Tier') : `${t('Subscribe to')} ${plan.name}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
};
