import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
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
import {
  subscribePlan,
  checkoutSubscription,
  confirmPayment,
  getSubscription,
  listSubscriptions,
  generateIdempotencyKey,
  generateEventId,
} from '../../services/billingApi';
import {
  isZeroAmount,
  formatBigIntCount,
  type SubscriptionView,
} from '../../services/sprint4Types';

function mapCheckoutError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'SUBSCRIPTION_PERIOD_LOCKED' || err.message?.includes('SUBSCRIPTION_PERIOD_LOCKED')) {
      return 'Gói đăng ký đã hủy trong kỳ hiện tại đã sử dụng quota, không thể đăng ký lại cho đến khi chu kỳ kết thúc.';
    }
    if (err.status === 400) {
      return 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
    }
    if (err.status === 401) {
      return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    }
    if (err.status === 403) {
      return 'Tài khoản không có quyền thực hiện thao tác này.';
    }
    if (err.status === 404) {
      return 'Gói dịch vụ không tồn tại hoặc đã ngừng cung cấp.';
    }
    if (err.status === 409) {
      if (err.code === 'SUBSCRIPTION_ALREADY_EXISTS') {
        return 'Bạn đã có gói đăng ký đang hoạt động hoặc đang chờ xử lý cho API này.';
      }
      if (err.code === 'IDEMPOTENCY_CONFLICT') {
        return 'Yêu cầu thanh toán trùng lặp. Vui lòng thử lại với mã mới.';
      }
      if (err.code === 'CHECKOUT_PENDING') {
        return 'Đang có giao dịch thanh toán chờ xử lý.';
      }
      if (err.code === 'CHECKOUT_EXPIRED') {
        return 'Phiên thanh toán đã hết hạn. Vui lòng thực hiện lại.';
      }
      return err.message || 'Xung đột dữ liệu đăng ký (409 Conflict).';
    }
    if (err.status === 429) {
      return 'Hệ thống đang quá tải. Vui lòng chờ một lát rồi thử lại.';
    }
    if (err.status === 503) {
      return 'Dịch vụ thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.';
    }
    return err.message || 'Có lỗi xảy ra khi xử lý đăng ký.';
  }
  if (err instanceof Error) {
    if (err.message.includes('SUBSCRIPTION_PERIOD_LOCKED')) {
      return 'Gói đăng ký đã hủy trong kỳ hiện tại đã sử dụng quota, không thể đăng ký lại cho đến khi chu kỳ kết thúc.';
    }
    return err.message;
  }
  return 'Lỗi kết nối máy chủ. Vui lòng thử lại.';
}

export const CheckoutPage: React.FC = () => {
  const { apiId, planId } = useParams<{ apiId: string; planId: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [plan, setPlan] = useState<MarketplacePricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sandboxOutcome, setSandboxOutcome] = useState<'success' | 'failure'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentFailure, setPaymentFailure] = useState(false);
  const [successSubscription, setSuccessSubscription] = useState<SubscriptionView | null>(null);
  const [existingPendingSub, setExistingPendingSub] = useState<SubscriptionView | null>(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  const resumeSubscriptionId = (location.state as { resumeSubscriptionId?: string } | null)?.resumeSubscriptionId;
  const submitControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      submitControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!apiId || !planId) return;
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

  useEffect(() => {
    if (!apiId || !planId || !currentUser) return;
    const isUserConsumer =
      currentUser.role === 'USER' ||
      (typeof currentUser.role === 'string' &&
        currentUser.role.toLowerCase() === 'consumer');
    if (!isUserConsumer) return;

    const controller = new AbortController();

    const validateOrDetectPending = async () => {
      try {
        if (resumeSubscriptionId) {
          const sub = await getSubscription(resumeSubscriptionId, controller.signal);
          if (controller.signal.aborted) return;
          const isOwner =
            !sub.consumerId ||
            !currentUser.id ||
            String(sub.consumerId) === String(currentUser.id);
          const isPending = sub.status === 'Pending';
          const isApiMatch = String(sub.apiId) === String(apiId);
          const isPlanMatch = String(sub.planId) === String(planId);
          if (isOwner && isPending && isApiMatch && isPlanMatch) {
            setExistingPendingSub(sub);
            return;
          }
        }

        const list = await listSubscriptions(1, 100, controller.signal);
        if (controller.signal.aborted) return;

        const matchingActive = list.items?.find(
          (s) => String(s.apiId) === String(apiId) && s.status === 'Active'
        );
        if (matchingActive) {
          setHasActiveSub(true);
        }

        const matchingPending = list.items?.find(
          (s) =>
            String(s.apiId) === String(apiId) &&
            String(s.planId) === String(planId) &&
            s.status === 'Pending'
        );
        if (matchingPending) {
          const isOwner =
            !matchingPending.consumerId ||
            !currentUser.id ||
            String(matchingPending.consumerId) === String(currentUser.id);
          if (isOwner) {
            setExistingPendingSub(matchingPending);
          }
        }
      } catch {
        // Non-blocking background check
      }
    };

    validateOrDetectPending();

    return () => {
      controller.abort();
    };
  }, [apiId, planId, currentUser, resumeSubscriptionId]);

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

  if (!apiId || !planId || error || !api || !plan) {
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
          to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
          className="inline-flex items-center justify-center font-label-md px-4 py-2 text-body-md rounded-xl font-medium bg-primary text-on-primary hover:bg-primary/90 shadow-sm"
        >
          {t('Đăng nhập')}
        </Link>
      </div>
    );
  }

  const isConsumer =
    currentUser.role === 'USER' ||
    (typeof currentUser.role === 'string' &&
      currentUser.role.toLowerCase() === 'consumer');

  const isFreePlan =
    isZeroAmount(String(plan.priceMonthly)) || plan.priceMonthly === 0;

  const handleSubmit = async () => {
    if (isSubmitting || !termsAccepted || !isConsumer || !plan) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setPaymentFailure(false);

    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      if (isFreePlan) {
        try {
          const sub = await subscribePlan(plan.id, controller.signal);
          if (controller.signal.aborted) return;
          setSuccessSubscription(sub);
          return;
        } catch (err: unknown) {
          if (
            err instanceof ApiError &&
            err.status === 409 &&
            (err.code === 'SUBSCRIPTION_ALREADY_EXISTS' || err.message?.includes('SUBSCRIPTION_ALREADY_EXISTS'))
          ) {
            const list = await listSubscriptions(1, 100, controller.signal);
            const activeSub = list.items?.find(
              (s) => String(s.apiId) === String(api.id) && s.status === 'Active'
            );
            if (activeSub) {
              setHasActiveSub(true);
              setSubmitError('Bạn đã có gói đăng ký đang hoạt động cho API này.');
              return;
            }
          }
          throw err;
        }
      }

      // Paid plan flow
      let targetSubId: string | null = null;

      // 1. Check if we already validated an existing pending subscription
      if (existingPendingSub) {
        targetSubId = existingPendingSub.id;
      } else if (resumeSubscriptionId) {
        // Safe server validation of resumeSubscriptionId
        try {
          const sub = await getSubscription(resumeSubscriptionId, controller.signal);
          const isOwner =
            !sub.consumerId ||
            !currentUser.id ||
            String(sub.consumerId) === String(currentUser.id);
          const isPending = sub.status === 'Pending';
          const isApiMatch = String(sub.apiId) === String(api.id);
          const isPlanMatch = String(sub.planId) === String(plan.id);

          if (isOwner && isPending && isApiMatch && isPlanMatch) {
            targetSubId = sub.id;
            setExistingPendingSub(sub);
          }
        } catch {
          // Never trust unvalidated id without server verification
        }
      }

      // 2. If no valid pending subscription found, call subscribePlan
      if (!targetSubId) {
        try {
          const sub = await subscribePlan(plan.id, controller.signal);
          if (controller.signal.aborted) return;
          targetSubId = sub.id;
        } catch (err: unknown) {
          if (
            err instanceof ApiError &&
            err.status === 409 &&
            (err.code === 'SUBSCRIPTION_ALREADY_EXISTS' || err.message?.includes('SUBSCRIPTION_ALREADY_EXISTS'))
          ) {
            // Catch 409 SUBSCRIPTION_ALREADY_EXISTS: inspect existing subscriptions
            const subList = await listSubscriptions(1, 100, controller.signal);
            if (controller.signal.aborted) return;

            const matchingPending = subList.items?.find(
              (s) =>
                String(s.apiId) === String(api.id) &&
                String(s.planId) === String(plan.id) &&
                s.status === 'Pending'
            );

            if (matchingPending) {
              // Seamlessly resume checkout
              targetSubId = matchingPending.id;
              setExistingPendingSub(matchingPending);
            } else {
              const matchingActive = subList.items?.find(
                (s) => String(s.apiId) === String(api.id) && s.status === 'Active'
              );
              if (matchingActive) {
                setHasActiveSub(true);
                setSubmitError('Bạn đã có gói đăng ký đang hoạt động cho API này.');
                return;
              }
              throw err;
            }
          } else {
            throw err;
          }
        }
      }

      // Step 2: checkoutSubscription
      const idempotencyKey = generateIdempotencyKey('chk');
      const payment = await checkoutSubscription(targetSubId, idempotencyKey, controller.signal);
      if (controller.signal.aborted) return;

      // Step 3: confirmPayment (token passed strictly in React function memory)
      const eventId = generateEventId('evt');
      const confirmResult = await confirmPayment(
        {
          paymentId: payment.paymentId,
          token: payment.token,
          outcome: sandboxOutcome,
          eventId,
        },
        controller.signal
      );
      if (controller.signal.aborted) return;

      // Step 4: Outcome evaluation
      if (sandboxOutcome === 'success' && confirmResult.status === 'Succeeded') {
        const activeSub = await getSubscription(targetSubId, controller.signal);
        if (controller.signal.aborted) return;
        setSuccessSubscription(activeSub);
      } else {
        setPaymentFailure(true);
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setSubmitError(mapCheckoutError(err));
    } finally {
      if (submitControllerRef.current === controller) {
        submitControllerRef.current = null;
        setIsSubmitting(false);
      }
    }
  };

  if (successSubscription) {
    return (
      <PageReveal className="pt-20 pb-20 px-4 sm:px-6 lg:px-12 max-w-2xl mx-auto">
        <AnimatedCard className="bg-surface-container-low border border-primary/30 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>
          <div className="inline-block mb-3">
            <Badge variant="primary">{successSubscription.status}</Badge>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">
            {t('Đăng ký gói thành công!')}
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {isFreePlan
              ? t('Gói Sandbox Miễn phí đã được kích hoạt thành công.')
              : t('Thanh toán mô phỏng thành công và gói dịch vụ đã hoạt động.')}
          </p>

          <div className="bg-surface-container rounded-xl p-4 mb-6 text-left space-y-2 border border-outline-variant/20">
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">{t('API')}</span>
              <span className="font-semibold text-on-surface">{api.name}</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">{t('Gói dịch vụ')}</span>
              <span className="font-semibold text-on-surface">{plan.name}</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">{t('Trạng thái')}</span>
              <span className="font-semibold text-emerald-600">{successSubscription.status}</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">{t('Hạn mức (Quota)')}</span>
              <span className="font-semibold text-on-surface font-code-sm">
                {formatBigIntCount(successSubscription.quotaLimit || plan.quota)} {t('yêu cầu/chu kỳ')}
              </span>
            </div>
            {successSubscription.currentPeriodEnd && (
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">{t('Thời hạn chu kỳ')}</span>
                <span className="font-semibold text-on-surface">
                  {new Date(successSubscription.currentPeriodEnd).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/consumer/subscriptions"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t('Quản lý gói đăng ký')}
            </Link>
            <Link
              to="/consumer/api-keys"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/30"
            >
              {t('Tạo API Key')}
            </Link>
          </div>
        </AnimatedCard>
      </PageReveal>
    );
  }

  return (
    <PageReveal className="pt-20 pb-20 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/api/${api.id}`}
          className="text-body-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-2"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t('Quay lại')} {api.name}
        </Link>
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('Complete Your Subscription')}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {isFreePlan
            ? t('Kích hoạt gói dịch vụ Miễn phí trên môi trường Sandbox.')
            : t('Kích hoạt gói dịch vụ thông qua cơ chế mô phỏng thanh toán Sandbox.')}
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
              <h3 className="text-body-lg font-bold text-on-surface">
                {t('Subscription Target')}
              </h3>
              <Badge variant="primary">{isFreePlan ? 'Sandbox Free' : 'Sandbox Tier'}</Badge>
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
                  Quota: {formatBigIntCount(plan.quota)} yêu cầu/tháng • Rate Limit: {plan.rateLimit} req/phút
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

          {/* Payment Sandbox Simulation Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-body-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                account_balance_wallet
              </span>
              {isFreePlan
                ? t('Kích hoạt gói Miễn phí (Sandbox)')
                : t('Phương thức kích hoạt (Sandbox)')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              {isFreePlan
                ? t('Gói Sandbox Miễn phí không yêu cầu thông tin thanh toán. Hạn mức sẽ được kích hoạt ngay lập tức.')
                : t('Môi trường Sandbox phục vụ thử nghiệm tính năng thanh toán. Vui lòng chọn kịch bản kết quả để kiểm tra luồng xử lý.')}
            </p>

            {/* Resume pending checkout banner */}
            {existingPendingSub && (
              <div
                data-testid="resuming-pending-banner"
                className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-body-sm text-on-surface mb-6 flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">
                  info
                </span>
                <div>
                  <strong className="font-semibold text-primary block">
                    {t('Tiếp tục thanh toán cho gói đăng ký chờ xử lý')}
                  </strong>
                  <p className="text-on-surface-variant">
                    {t(
                      'Hệ thống ghi nhận bạn đã có yêu cầu đăng ký cho gói này (Mã: #{subId}). Quá trình xác nhận sẽ tiếp tục phiên thanh toán hiện tại mà không tạo đăng ký trùng lặp.'
                    ).replace('{subId}', existingPendingSub.id)}
                  </p>
                </div>
              </div>
            )}

            {/* Active subscription banner */}
            {hasActiveSub && (
              <div
                data-testid="active-subscription-banner"
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-body-sm text-emerald-900 dark:text-emerald-200 mb-6 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] mt-0.5 flex-shrink-0">
                    check_circle
                  </span>
                  <div>
                    <p className="font-semibold">
                      {t('Bạn đã có gói đăng ký đang hoạt động cho API này.')}
                    </p>
                    <p className="text-body-xs opacity-90">
                      {t('Bạn không cần đăng ký thêm. Hãy vào trang quản lý để xem hoặc đổi gói dịch vụ.')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/consumer/subscriptions"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-body-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  {t('Quản lý gói')}
                </Link>
              </div>
            )}

            {/* Role warning */}
            {!isConsumer && (
              <div
                data-testid="role-warning-banner"
                className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-sm text-amber-800 dark:text-amber-200 mb-6"
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>{t('Chỉ dành cho tài khoản Consumer')}</span>
                </div>
                <p>
                  {t(
                    'Tài khoản hiện tại ({role}) không có quyền đăng ký gói API Consumer. Chỉ tài khoản Consumer mới có thể thực hiện thao tác này.'
                  ).replace('{role}', String(currentUser.role))}
                </p>
              </div>
            )}

            {/* Sandbox Outcome Selector for Paid Plans */}
            {!isFreePlan && (
              <div className="space-y-3 mb-6">
                <label
                  data-testid="outcome-success-label"
                  onClick={() => setSandboxOutcome('success')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    sandboxOutcome === 'success'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">
                      check_circle
                    </span>
                    <div>
                      <span className="font-semibold text-on-surface text-body-sm block">
                        {t('Mô phỏng Thanh toán Thành công')}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">
                        {t('Giao dịch sandbox thành công, kích hoạt gói ngay')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sandboxOutcome"
                    value="success"
                    checked={sandboxOutcome === 'success'}
                    onChange={() => setSandboxOutcome('success')}
                    className="accent-primary"
                  />
                </label>

                <label
                  data-testid="outcome-failure-label"
                  onClick={() => setSandboxOutcome('failure')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    sandboxOutcome === 'failure'
                      ? 'border-error bg-error/5 ring-1 ring-error'
                      : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-[24px]">
                      cancel
                    </span>
                    <div>
                      <span className="font-semibold text-on-surface text-body-sm block">
                        {t('Mô phỏng Thanh toán Thất bại')}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">
                        {t('Giao dịch sandbox bị từ chối (Sandbox Declined) để kiểm tra luồng lỗi')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="sandboxOutcome"
                    value="failure"
                    checked={sandboxOutcome === 'failure'}
                    onChange={() => setSandboxOutcome('failure')}
                    className="accent-primary"
                  />
                </label>
              </div>
            )}

            {/* Payment simulation failure banner */}
            {paymentFailure && (
              <div
                data-testid="payment-failure-banner"
                className="p-4 bg-error/10 border border-error/30 rounded-xl mb-6"
              >
                <div className="flex items-center gap-2 text-error font-bold mb-1">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{t('Thanh toán mô phỏng thất bại (Sandbox Declined)')}</span>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-3">
                  {t(
                    'Giao dịch mô phỏng đã bị từ chối theo lựa chọn kịch bản thử nghiệm.'
                  )}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPaymentFailure(false);
                    setSubmitError(null);
                  }}
                  data-testid="retry-button"
                >
                  {t('Thử lại')}
                </Button>
              </div>
            )}

            {/* General submit error banner */}
            {submitError && (
              <div
                data-testid="checkout-error-banner"
                className="p-4 bg-error/10 border border-error/30 rounded-xl text-body-sm text-error mb-6"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{submitError}</p>
                    {submitError.includes('Bạn đã có gói đăng ký') && (
                      <Link
                        to="/consumer/subscriptions"
                        className="underline mt-1.5 inline-block text-body-xs font-semibold hover:opacity-80"
                      >
                        {t('Quản lý gói đăng ký')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 text-body-sm text-on-surface cursor-pointer select-none mb-6">
              <input
                type="checkbox"
                data-testid="terms-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
              />
              <span className="text-on-surface-variant">
                {t(
                  'Tôi đồng ý với Quy chế hoạt động sàn API HUB, chính sách hạn mức và điều khoản dịch vụ.'
                )}
              </span>
            </label>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!termsAccepted || isSubmitting || !isConsumer}
              onClick={handleSubmit}
              aria-label={
                isFreePlan
                  ? 'Activate Free Sandbox Tier - Kích hoạt gói Miễn phí (Sandbox)'
                  : undefined
              }
            >
              {isSubmitting
                ? t('Đang xử lý...')
                : isFreePlan
                  ? t('Kích hoạt gói Miễn phí (Sandbox)')
                  : `${t('Xác nhận đăng ký')} (${formatPrice(plan.priceMonthly, plan.currency)})`}
            </Button>
          </div>
        </div>

        {/* Right Col: Trust & Security guarantees */}
        <div className="space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                verified_user
              </span>
              {t('Bảo đảm tính minh bạch')}
            </h4>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                  check
                </span>
                <span>{t('Nhà cung cấp đã công bố chính thức bảng giá.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                  check
                </span>
                <span>{t('Hạn mức và giới hạn tần suất được ghi nhận trên hợp đồng.')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                  check
                </span>
                <span>{t('Tài khoản được bảo vệ qua hạ tầng Gateway trung tâm.')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h4 className="text-body-md font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                security
              </span>
              {t('Tiêu chuẩn Bảo mật')}
            </h4>
            <div className="space-y-2.5 text-body-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">
                  lock
                </span>
                <span>Mã hóa TLS 1.3 / 256-bit đường truyền</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">
                  shield
                </span>
                <span>Anti-SSRF Centralized Reverse Proxy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant/70 text-[16px]">
                  key
                </span>
                <span>Zero Plaintext Cryptographic Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageReveal>
  );
};
