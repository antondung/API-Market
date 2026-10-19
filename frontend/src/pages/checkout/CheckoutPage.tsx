import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const CheckoutPage: React.FC = () => {
  const { apiId, planId } = useParams<{ apiId: string; planId: string }>();
  const { apis, subscribeToPlan } = useApp();
  const { currentUser } = useAuth();
  // Trang nay nam trong route duoc bao ve nen currentUser luon co gia tri.
  const user = currentUser!;
  const { t } = useLanguage();
  const navigate = useNavigate();

  const api = apis.find(a => a.id === apiId) || apis[0];
  const plan = api.plans.find(p => p.id === planId) || api.plans[0];

  const [paymentMethod, setPaymentMethod] = useState<'sandbox_card' | 'sandbox_vnpay'>('sandbox_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const handleCompleteSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      subscribeToPlan(api.id, plan.id, user.id);
      setIsProcessing(false);
      navigate('/dashboard/subscriptions');
    }, 1200);
  };

  return (
    <div className="pt-20 pb-20 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/api/${api.id}`} className="text-body-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> {t('Quay lại')} {api.name}
        </Link>
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Complete Your Subscription')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Payment Sandbox Environment (US-23): Zero real financial risk. Instant authorization and key generation.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 cols: Checkout Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Plan Summary Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-body-lg font-bold text-on-surface mb-4">{t('Subscription Target')}</h3>
            <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">{api.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-body-md font-bold text-on-surface">{api.name}</h4>
                  <Badge variant="primary">{plan.name}</Badge>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Quota: {plan.monthlyQuota.toLocaleString()} yêu cầu/tháng • Rate Limit: {plan.rateLimitPerSec} req/giây
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-body-sm pt-3 border-t border-outline-variant/20">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('Monthly Base Subscription')}</span>
                <span className="font-semibold text-on-surface">${plan.priceMonthly}.00</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('API Gateway Egress (Redis Guard)')}</span>
                <span className="font-semibold text-emerald-600">$0.00 (Đã bao gồm)</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('Taxes & Compliance Fee')}</span>
                <span className="font-semibold text-on-surface">$0.00</span>
              </div>
              <div className="flex justify-between text-body-md font-bold text-on-surface pt-3 border-t border-outline-variant/30">
                <span>{t('Total Due Today')}</span>
                <span className="text-primary text-xl font-extrabold">${plan.priceMonthly}.00 / tháng</span>
              </div>
            </div>
          </div>

          {/* Payment Sandbox Simulation */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-body-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              {t('Payment Sandbox Simulation')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              {t('In accordance with project scope (PDF section 8), payments run through the mocked Payment Sandbox engine.')}
            </p>

            <div className="space-y-3 mb-6">
              <label
                onClick={() => setPaymentMethod('sandbox_card')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'sandbox_card'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/40 bg-surface-container'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">credit_card</span>
                  <div>
                    <span className="font-semibold text-on-surface text-body-sm block">{t('Mock Credit Card Vault')}</span>
                    <span className="text-[12px] text-on-surface-variant">{t('4242 •••• •••• 4242 (Instant Approval)')}</span>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'sandbox_card'} readOnly className="accent-primary" />
              </label>

              <label
                onClick={() => setPaymentMethod('sandbox_vnpay')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'sandbox_vnpay'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/40 bg-surface-container'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-600 text-[24px]">payments</span>
                  <div>
                    <span className="font-semibold text-on-surface text-body-sm block">{t('VNPay Sandbox Gateway')}</span>
                    <span className="text-[12px] text-on-surface-variant">{t('Simulated QR / Domestic banking test grant')}</span>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'sandbox_vnpay'} readOnly className="accent-primary" />
              </label>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 text-body-sm text-on-surface cursor-pointer select-none mb-6">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
              />
              <span className="text-on-surface-variant">
                {t('I accept the API HUB Consumer Service Agreement, Rate Limit Fair Use Guidelines, and automatic monthly quota reset policy.')}
              </span>
            </label>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={isProcessing}
              disabled={!termsAccepted}
              onClick={handleCompleteSubscription}
            >
              {plan.priceMonthly === 0 ? t('Activate Free Sandbox Tier') : `${t('Authorize & Subscribe')} ($${plan.priceMonthly}/tháng)`}
            </Button>
          </div>
        </div>

        {/* Right Col: Trust & Security guarantees */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">shield</span>
              {t('Subscriber Guarantee')}
            </h4>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0">check</span>
                <span>{t('Instant API Key issuance with automated Redis quota counter assignment.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0">check</span>
                <span>{t('Real-time Cost Guard threshold alerts (50%, 80%, 100%) to prevent bill shock.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0">check</span>
                <span>{t('Cancel or pause your subscription anytime with 1-click in Consumer Dashboard.')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
