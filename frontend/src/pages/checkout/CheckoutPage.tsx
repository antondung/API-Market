import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import { PublicApiUnavailable } from '../../components/marketplace/PublicApiUnavailable';
import {
  getMarketplaceApiDetail,
  formatPrice,
} from '../../services/marketplaceApi';
import type {
  MarketplaceApiDetail,
  MarketplacePricingPlan,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

export const CheckoutPage: React.FC = () => {
  const { apiId, planId } = useParams<{ apiId: string; planId: string }>();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [plan, setPlan] = useState<MarketplacePricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'sandbox_card' | 'sandbox_vnpay'>('sandbox_card');
  const [termsAccepted, setTermsAccepted] = useState(true);

  useEffect(() => {
    if (!apiId) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getMarketplaceApiDetail(apiId, controller.signal);
        setApi(data);

        const matchedPlan = data.plans?.find(p => p.id === planId);
        if (matchedPlan) {
          setPlan(matchedPlan);
        } else {
          setPlan(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', 'Lỗi kết nối'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [apiId, planId]);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-surface-container-high rounded w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-64 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  if (error || !api || !plan) {
    return <PublicApiUnavailable />;
  }

  if (!currentUser) {
    return (
      <div className="pt-28 pb-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          {t('Yêu cầu đăng nhập')}
        </h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {t('Vui lòng đăng nhập để xem thông tin đăng ký và kích hoạt gói.')}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center font-label-md px-4 py-2 text-body-md rounded-xl font-medium bg-primary text-on-primary hover:bg-primary/90 shadow-sm"
        >
          {t('Đăng nhập')}
        </Link>
      </div>
    );
  }

  return (
    <PageReveal className="pt-20 pb-20 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/api/${api.id}`} className="text-body-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> {t('Quay lại')} {api.name}
        </Link>
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Complete Your Subscription')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Giao diện chuẩn bị cho Sprint 4. Backend Subscription và thanh toán đang phát triển; chưa thể kích hoạt gói tự động tại đây.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 cols: Checkout Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Plan Summary Card */}
          <AnimatedCard
            hoverLift={true}
            className="bg-surface-container-low border border-primary/25 rounded-2xl p-6 shadow-sm ring-1 ring-primary/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-lg font-bold text-on-surface">{t('Subscription Target')}</h3>
              <Badge variant="primary">Sprint 3 Review</Badge>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">api</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-body-md font-bold text-on-surface">{api.name}</h4>
                  <Badge variant="primary">{plan.name}</Badge>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Quota: {plan.quota.toLocaleString()} yêu cầu/tháng • Rate Limit: {plan.rateLimit} req/giây
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-body-sm pt-3 border-t border-outline-variant/20">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('Monthly Base Subscription')}</span>
                <span className="font-semibold text-on-surface font-code-sm">
                  {formatPrice(plan.priceMonthly, plan.currency)}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('API Gateway Egress')}</span>
                <span className="font-semibold text-emerald-600">Miễn phí (Đã bao gồm)</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('Taxes & Compliance Fee')}</span>
                <span className="font-semibold text-on-surface">0 ₫</span>
              </div>
              <div className="flex justify-between text-body-md font-bold text-on-surface pt-3 border-t border-outline-variant/30">
                <span>{t('Total Due Today')}</span>
                <span className="text-primary text-xl font-extrabold">
                  {formatPrice(plan.priceMonthly, plan.currency)} {plan.priceMonthly > 0 && '/ tháng'}
                </span>
              </div>
            </div>
          </AnimatedCard>

          {/* Payment Sandbox Simulation */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-body-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              {t('Phương thức kích hoạt (Sandbox)')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              {t('Chưa có kết quả thanh toán từ máy chủ. Các lựa chọn dưới đây là giao diện tham khảo cho Sprint 4.')}
            </p>

            <div className="space-y-3 mb-6">
              <label
                onClick={() => setPaymentMethod('sandbox_card')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'sandbox_card'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">credit_card</span>
                  <div>
                    <span className="font-semibold text-on-surface text-body-sm block">{t('Thẻ thanh toán quốc tế')}</span>
                    <span className="text-[12px] text-on-surface-variant">{t('Sandbox Mock Card (Visa/Mastercard)')}</span>
                  </div>
                </div>
                <input type="radio" checked={paymentMethod === 'sandbox_card'} readOnly className="accent-primary" />
              </label>

              <label
                onClick={() => setPaymentMethod('sandbox_vnpay')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'sandbox_vnpay'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">qr_code_2</span>
                  <div>
                    <span className="font-semibold text-on-surface text-body-sm block">{t('Cổng thanh toán VNPay')}</span>
                    <span className="text-[12px] text-on-surface-variant">{t('Mã QR Sandbox / Chuyển khoản nội địa')}</span>
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
                {t('Tôi đồng ý với Quy chế hoạt động sàn API HUB, chính sách hạn mức và điều khoản dịch vụ.')}
              </span>
            </label>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-body-xs text-amber-700 dark:text-amber-300 mb-4">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>{t('Sprint 3 Sandbox Preview — Live backend billing activates in Sprint 4')}</span>
              </div>
              {t('Chức năng thanh toán và kích hoạt gói sẽ ra mắt trong Sprint 4 (Subscription & Billing). Hệ thống không lưu gói giả để đảm bảo tính toàn vẹn dữ liệu.')}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={true}
              title={t('Chức năng đang chờ Backend Subscription trong Sprint 4')}
            >
              {plan.priceMonthly === 0
                ? t('Activate Free Sandbox Tier')
                : `${t('Đăng ký gói')} (${formatPrice(plan.priceMonthly, plan.currency)} - Chờ Sprint 4)`}
            </Button>
          </div>
        </div>

        {/* Right Col: Trust & Security guarantees */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              {t('Bảo đảm tính minh bạch')}
            </h4>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">check</span>
                <span>{t('Nhà cung cấp đã công bố chính thức bảng giá.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">check</span>
                <span>{t('Hạn mức và giới hạn tần suất được ghi nhận trên hợp đồng.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">check</span>
                <span>{t('Tài khoản được bảo vệ qua hạ tầng Gateway trung tâm.')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">security</span>
              {t('Tiêu chuẩn Bảo mật')}
            </h4>
            <div className="space-y-2.5 text-body-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">lock</span>
                <span>Mã hóa TLS 1.3 / 256-bit đường truyền</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">shield</span>
                <span>Anti-SSRF Centralized Reverse Proxy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">key</span>
                <span>Zero Plaintext Cryptographic Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageReveal>
  );
};
