import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import type { PricingPlan } from '../../types';

export const PricingManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { apis, updateApi } = useApp();
  const { t } = useLanguage();

  const apiId = searchParams.get('api') || apis[0]?.id;
  const api = apis.find(a => a.id === apiId) || apis[0];

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [tier, setTier] = useState<PricingPlan['tier']>('Basic');
  const [priceMonthly, setPriceMonthly] = useState('49');
  const [monthlyQuota, setMonthlyQuota] = useState('25000');
  const [rateLimitPerSec, setRateLimitPerSec] = useState('25');
  const [featureList, setFeatureList] = useState('24/7 SLA, Priority queue, Dedicated bandwidth');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const newPlan: PricingPlan = {
      id: `plan_${Date.now()}`,
      apiId: api.id,
      name: planName,
      tier,
      priceMonthly: parseInt(priceMonthly) || 0,
      monthlyQuota: parseInt(monthlyQuota) || 1000,
      rateLimitPerSec: parseInt(rateLimitPerSec) || 10,
      features: featureList.split(',').map(s => s.trim()).filter(Boolean)
    };

    updateApi(api.id, {
      plans: [...api.plans, newPlan]
    });

    setAddModalOpen(false);
    setPlanName('');
  };

  const handleDeletePlan = (pId: string) => {
    if (confirm(t('Delete this plan tier?'))) {
      updateApi(api.id, {
        plans: api.plans.filter(p => p.id !== pId)
      });
    }
  };

  if (!api) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3">payments</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để thiết lập bảng giá')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể thiết lập các gói cước và hạn mức.')}
        </p>
        <Link to="/provider/create-api" className="inline-block mt-6">
          <Button variant="primary" icon="add_circle">
            {t('Tạo API Mới')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{api.name}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Pricing Plan Management')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Configure developer tiers, monthly quota ceilings, and burst velocity rules.')}
          </p>
        </div>
        <Button
          variant="primary"
          icon="add"
          onClick={() => setAddModalOpen(true)}
        >
          {t('Add Pricing Tier')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {api.plans.map(p => (
          <div key={p.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-headline-sm font-bold text-on-surface">{p.name}</h3>
                <Badge variant={p.tier === 'Free' ? 'neutral' : 'primary'}>{p.tier}</Badge>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-on-surface">${p.priceMonthly}</span>
                <span className="text-body-sm text-on-surface-variant">/ {t('tháng')}</span>
              </div>

              <div className="space-y-2 py-3 border-t border-outline-variant/20 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t('Monthly Quota:')}</span>
                  <span className="font-code-md font-semibold text-on-surface">{p.monthlyQuota.toLocaleString()} reqs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{t('Rate Limit:')}</span>
                  <span className="font-code-md font-semibold text-primary">{p.rateLimitPerSec} req/sec</span>
                </div>
              </div>

              <div className="pt-2 text-body-sm text-on-surface-variant space-y-1">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check</span>
                    <span>{t(f)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-outline-variant/20 flex justify-end">
              <Button
                variant="danger"
                size="sm"
                icon="delete"
                onClick={() => handleDeletePlan(p.id)}
              >
                {t('Delete Plan')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t('Create New Pricing Tier')}
        description={`${t('Add subscription package for')} ${api.name}`}
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Plan Name')}</label>
            <input
              type="text"
              required
              placeholder={t('e.g. Scale Pro, Enterprise Unlimited')}
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Tier Category')}</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none"
              >
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Price ($ / Month)')}</label>
              <input
                type="number"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none font-code-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Monthly Quota (Calls)')}</label>
              <input
                type="number"
                value={monthlyQuota}
                onChange={(e) => setMonthlyQuota(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none font-code-md"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Velocity Limit (RPS)')}</label>
              <input
                type="number"
                value={rateLimitPerSec}
                onChange={(e) => setRateLimitPerSec(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none font-code-md"
              />
            </div>
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Feature List (Comma separated)')}</label>
            <input
              type="text"
              value={featureList}
              onChange={(e) => setFeatureList(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('Create Plan')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
