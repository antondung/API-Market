/* oxlint-disable react/only-export-components, react/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOptionalAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import {
  listSubscriptions,
  cancelSubscription,
  changeSubscriptionPlan,
  confirmPayment,
  generateEventId,
} from '../../services/billingApi';
import { getMarketplaceApiDetail, formatPrice } from '../../services/marketplaceApi';
import type { MarketplacePricingPlan } from '../../services/marketplaceTypes';
import {
  type SubscriptionView,
  type SubscriptionStatus,
  formatCurrencyAmount,
  formatBigIntCount,
  parseSafeBigInt,
} from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';

export function calculateQuotaProgress(usedStr: string, limitStr: string): number {
  try {
    const limit = parseSafeBigInt(limitStr);
    if (limit <= 0n) return 0;
    const used = parseSafeBigInt(usedStr);
    if (used <= 0n) return 0;
    const pct = (used * 100n) / limit;
    if (pct > 100n) return 100;
    return Number(pct);
  } catch {
    return 0;
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

export function mapSubscriptionError(err: unknown, defaultMsg = 'Đã có lỗi xảy ra'): string {
  if (err instanceof ApiError) {
    if (err.code === 'SUBSCRIPTION_PERIOD_LOCKED' || err.message.includes('SUBSCRIPTION_PERIOD_LOCKED')) {
      return 'Gói đã hủy trong kỳ hiện tại đã sử dụng quota, không thể đăng ký lại cho đến khi hết hạn kỳ.';
    }
    if (err.code === 'SUBSCRIPTION_ALREADY_EXISTS' || err.message.includes('SUBSCRIPTION_ALREADY_EXISTS')) {
      return 'Đã có đăng ký cho API này.';
    }
    if (err.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (err.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (err.status === 404) {
      return 'Không tìm thấy gói đăng ký.';
    }
    if (err.status >= 500) {
      return 'Lỗi máy chủ (500). Vui lòng thử lại sau.';
    }
    return err.message || defaultMsg;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return defaultMsg;
}

export const MySubscriptionsPage: React.FC = () => {
  const auth = useOptionalAuth();
  const userId = auth === undefined ? '__standalone__' : (auth?.currentUser?.id ?? null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [subsData, setSubsData] = useState<{
    ownerId: string | number | null | undefined;
    items: SubscriptionView[];
    total: number;
    error: string | null;
  }>({
    ownerId: userId,
    items: [],
    total: 0,
    error: null,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [rawCancelModalSub, setRawCancelModalSub] = useState<SubscriptionView | null>(null);
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const [rawChangePlanSub, setRawChangePlanSub] = useState<SubscriptionView | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MarketplacePricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [changePlanOutcome, setChangePlanOutcome] = useState<'success' | 'failure'>('success');
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [changePlanError, setChangePlanError] = useState<string | null>(null);

  // Render guard: zero stale render on account switch or logout
  const isOwner = Boolean(userId && subsData.ownerId === userId);
  const subscriptions = isOwner ? subsData.items : [];
  const total = isOwner ? subsData.total : 0;
  const fetchError = isOwner ? subsData.error : null;
  const cancelModalSub = isOwner ? rawCancelModalSub : null;
  const setCancelModalSub = setRawCancelModalSub;
  const changePlanSub = isOwner ? rawChangePlanSub : null;
  const setChangePlanSub = setRawChangePlanSub;

  const fetchSubscriptions = useCallback(async (targetPage: number, signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const res = await listSubscriptions(targetPage, pageSize, signal);
      if (signal?.aborted) return;
      setSubsData({
        ownerId: userId,
        items: res.items || [],
        total: res.total || 0,
        error: null,
      });
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setSubsData(prev => ({
        ...prev,
        ownerId: userId,
        error: mapSubscriptionError(err, 'Không thể tải danh sách gói đăng ký.'),
      }));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [userId, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    setSubsData({ ownerId: userId, items: [], total: 0, error: null });
    setRawCancelModalSub(null);
    setRawChangePlanSub(null);
    if (userId) {
      fetchSubscriptions(page, controller.signal);
    } else {
      setIsLoading(false);
    }
    return () => {
      controller.abort();
    };
  }, [userId, page, fetchSubscriptions]);

  const handleConfirmCancel = async () => {
    if (!cancelModalSub) return;
    setIsCanceling(true);
    setCancelError(null);
    try {
      await cancelSubscription(cancelModalSub.id, cancelImmediate);
      setFeedbackNotice(
        cancelImmediate
          ? t('Đã hủy gói đăng ký ngay lập tức. Quyền truy cập API Gateway đã bị thu hồi.')
          : t('Đã đặt lịch hủy gói vào cuối kỳ. Bạn vẫn có thể dùng đến hết chu kỳ.')
      );
      setCancelModalSub(null);
      await fetchSubscriptions(page);
    } catch (err) {
      setCancelError(mapSubscriptionError(err, t('Lỗi khi hủy gói đăng ký.')));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleOpenChangePlan = async (sub: SubscriptionView) => {
    setChangePlanSub(sub);
    setSelectedPlanId('');
    setChangePlanOutcome('success');
    setChangePlanError(null);
    setIsLoadingPlans(true);
    try {
      const apiDetail = await getMarketplaceApiDetail(sub.apiId);
      const filtered = (apiDetail.plans || []).filter(
        (p) => String(p.id) !== String(sub.planId)
      );
      setAvailablePlans(filtered);
    } catch (err) {
      setChangePlanError(mapSubscriptionError(err, t('Không thể tải danh sách gói của API.')));
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleConfirmChangePlan = async () => {
    if (!changePlanSub || !selectedPlanId) return;
    setIsChangingPlan(true);
    setChangePlanError(null);

    try {
      const payment = await changeSubscriptionPlan(changePlanSub.id, selectedPlanId);
      const eventId = generateEventId('chg');
      const confirmResult = await confirmPayment({
        paymentId: payment.paymentId,
        token: payment.token,
        outcome: changePlanOutcome,
        eventId,
      });

      if (changePlanOutcome === 'failure' || confirmResult.status === 'Failed') {
        setChangePlanError(
          t('Mô phỏng thanh toán thất bại: Giao dịch bị từ chối. Gói dịch vụ hiện tại và hạn ngạch của bạn được giữ nguyên không đổi.')
        );
      } else {
        setFeedbackNotice(t('Đổi gói dịch vụ thành công!'));
        setChangePlanSub(null);
        await fetchSubscriptions(page);
      }
    } catch (err) {
      setChangePlanError(mapSubscriptionError(err, t('Lỗi khi đổi gói dịch vụ.')));
    } finally {
      setIsChangingPlan(false);
    }
  };

  const renderStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">{t('Đang hoạt động')}</Badge>;
      case 'Pending':
        return <Badge variant="warning">{t('Chờ thanh toán')}</Badge>;
      case 'Past Due':
        return <Badge variant="warning">{t('Quá hạn thanh toán')}</Badge>;
      case 'Suspended':
        return <Badge variant="neutral">{t('Tạm dừng')}</Badge>;
      case 'Canceled':
        return <Badge variant="danger">{t('Đã hủy')}</Badge>;
      case 'Expired':
        return <Badge variant="neutral">{t('Hết hạn')}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('My API Subscriptions')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Manage subscribed endpoints, current quota periods, automated renewal cycles.')}
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

      {/* Honest Sprint 3 & Sprint 4 Status Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
        <div>
          <strong className="text-on-surface font-semibold">Lộ trình triển khai (Sprint 3 & Sprint 4): </strong>
          <span>
            Tính năng Đăng ký gói (Commercial Subscription & Metered Billing) được kích hoạt trong Sprint 4.
            Hiện tại người dùng có thể tạo và sử dụng <strong>Gói dùng thử Sandbox</strong> trực tiếp trong mục API Keys.
          </span>
        </div>
      </div>

      {feedbackNotice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-body-sm text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{feedbackNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
            aria-label={t('Đóng thông báo')}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div data-testid="subscriptions-loading" role="status" aria-label={t('Đang tải danh sách đăng ký')} className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 bg-surface-container-highest rounded w-1/3" />
                <div className="h-6 bg-surface-container-highest rounded w-20" />
              </div>
              <div className="h-3 bg-surface-container-highest rounded w-full" />
              <div className="h-4 bg-surface-container-highest rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && fetchError && (
        <div
          role="alert"
          data-testid="subscriptions-error"
          className="rounded-2xl border border-error/20 bg-error-container/10 p-8 text-center space-y-4 max-w-lg mx-auto"
        >
          <span className="material-symbols-outlined text-error text-[40px] block mx-auto">error</span>
          <p className="text-body-lg text-on-surface font-medium">{fetchError}</p>
          <Button
            variant="primary"
            icon="refresh"
            onClick={() => fetchSubscriptions(page)}
          >
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !fetchError && subscriptions.length === 0 && (
        <div
          data-testid="subscriptions-empty"
          className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <h3 className="text-title-lg font-bold text-on-surface mb-2">{t('No Subscriptions Found')}</h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            {t('Bạn chưa đăng ký gói API nào. Khám phá các API chất lượng cao trên Marketplace ngay hôm nay!')}
          </p>
          <Button
            variant="primary"
            icon="explore"
            onClick={() => navigate('/marketplace')}
          >
            {t('Khám phá Marketplace')}
          </Button>
        </div>
      )}

      {/* Subscriptions List */}
      {!isLoading && !fetchError && subscriptions.length > 0 && (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const usedPercent = calculateQuotaProgress(sub.quotaUsed, sub.quotaLimit);
            const isPending = sub.status === 'Pending';
            const isActive = sub.status === 'Active';

            return (
              <div
                key={sub.id}
                data-testid={`subscription-item-${sub.id}`}
                className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col gap-5 hover:border-outline-variant/60 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[28px]">api</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/api/${sub.apiId}`}
                          className="text-headline-sm font-bold text-on-surface hover:text-primary transition-colors"
                        >
                          API #{sub.apiId}
                        </Link>
                        {renderStatusBadge(sub.status)}
                        <Badge variant="primary">{t('Gói:')} {sub.planId}</Badge>
                        <span className="text-body-xs font-mono text-on-surface-variant">ID: #{sub.id}</span>
                        {sub.cancelAtPeriodEnd && (
                          <Badge variant="warning">
                            {t('Hủy vào cuối kỳ:')} {formatDate(sub.currentPeriodEnd)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
                        <span>
                          {t('Rate Limit:')}{' '}
                          <strong className="text-on-surface">
                            {sub.rateLimitPerMinute} {t('req/phút')}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          {t('Giá:')}{' '}
                          <strong className="text-on-surface">
                            {formatCurrencyAmount(sub.priceAmount, sub.priceCurrency)} / {t('tháng')}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          {t('Kỳ:')}{' '}
                          <span className="font-mono text-body-xs">
                            {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon="shopping_cart_checkout"
                        onClick={() =>
                          navigate(`/checkout/${sub.apiId}/${sub.planId}`, {
                            state: { resumeSubscriptionId: sub.id },
                          })
                        }
                      >
                        {t('Thanh toán ngay')}
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon="swap_horiz"
                        onClick={() => handleOpenChangePlan(sub)}
                      >
                        {t('Đổi gói')}
                      </Button>
                    )}
                    {(isActive || isPending) && !sub.cancelAtPeriodEnd && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon="cancel"
                        onClick={() => {
                          setCancelModalSub(sub);
                          setCancelImmediate(false);
                          setCancelError(null);
                        }}
                      >
                        {t('Hủy gói')}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="space-y-1.5 pt-2 border-t border-outline-variant/15">
                  <div className="flex items-center justify-between text-body-xs text-on-surface-variant">
                    <span>
                      {t('Quota đã dùng:')}{' '}
                      <strong className="text-on-surface font-semibold font-mono">
                        {formatBigIntCount(sub.quotaUsed)}
                      </strong>{' '}
                      / <span className="font-mono">{formatBigIntCount(sub.quotaLimit)}</span>
                    </span>
                    <span className="font-mono font-semibold">{usedPercent}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        usedPercent >= 90
                          ? 'bg-error'
                          : usedPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-body-xs text-on-surface-variant/80">
                  <span>
                    {t('Chu kỳ kết thúc vào:')}{' '}
                    <strong className="text-on-surface font-mono">{formatDate(sub.currentPeriodEnd)}</strong>
                  </span>
                  <span>{t('Ghi chú: Không tự động gia hạn gói trả phí.')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !fetchError && total > pageSize && (
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
          <span className="text-body-sm text-on-surface-variant">
            {t('Trang')} {page} / {totalPages} ({total} {t('gói đăng ký')})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('Trang trước')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('Trang sau')}
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalSub && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 id="cancel-dialog-title" className="text-title-lg font-bold text-on-surface">
                {t('Xác nhận hủy gói')}
              </h3>
              <button
                type="button"
                aria-label={t('Đóng hộp thoại')}
                onClick={() => {
                  if (!isCanceling) {
                    setCancelModalSub(null);
                    setCancelError(null);
                  }
                }}
                className="text-on-surface-variant hover:text-on-surface rounded-lg p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-body-sm text-on-surface-variant space-y-1">
              <p>
                {t('Bạn đang thao tác hủy gói')} <strong className="text-on-surface">{cancelModalSub.planId}</strong> {t('cho API')} <strong className="text-on-surface">{cancelModalSub.apiId}</strong> (ID: #{cancelModalSub.id}).
              </p>
              <p>{t('Vui lòng chọn phương thức hủy:')}</p>
            </div>

            <div className="space-y-3">
              {/* Option A: Default */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !cancelImmediate
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="cancelOption"
                  aria-label={t('Hủy vào cuối kỳ')}
                  checked={!cancelImmediate}
                  onChange={() => setCancelImmediate(false)}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-on-surface block">
                    {t('Hủy vào cuối kỳ')}
                  </span>
                  <p className="text-body-sm text-on-surface-variant">
                    {t('Tiếp tục sử dụng quyền truy cập API cho đến ngày')}{' '}
                    <strong className="text-on-surface">{formatDate(cancelModalSub.currentPeriodEnd)}</strong>. {t('Không gia hạn cho chu kỳ tiếp theo.')}
                  </p>
                </div>
              </label>

              {/* Option B: Immediate */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  cancelImmediate
                    ? 'border-error bg-error-container/10 ring-1 ring-error'
                    : 'border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="cancelOption"
                  aria-label={t('Hủy ngay lập tức')}
                  checked={cancelImmediate}
                  onChange={() => setCancelImmediate(true)}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-error block">
                    {t('Hủy ngay lập tức')}
                  </span>
                  <p className="text-body-sm text-error font-bold mt-1">
                    {t('CẢNH BÁO: Thu hồi quyền truy cập API Gateway ngay lập tức!')}
                  </p>
                  <p className="text-body-xs text-on-surface-variant">
                    {t('Mọi yêu cầu gửi đến API Gateway sẽ bị chặn ngay lập tức sau khi xác nhận.')}
                  </p>
                </div>
              </label>
            </div>

            {cancelError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-body-sm text-error flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
                <span>{cancelError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Button
                variant="outline"
                size="sm"
                disabled={isCanceling}
                onClick={() => {
                  setCancelModalSub(null);
                  setCancelError(null);
                }}
              >
                {t('Đóng')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={isCanceling}
                onClick={handleConfirmCancel}
              >
                {t('Xác nhận hủy')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Dialog */}
      {changePlanSub && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-plan-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 id="change-plan-dialog-title" className="text-title-lg font-bold text-on-surface">
                {t('Đổi gói dịch vụ')}
              </h3>
              <button
                type="button"
                aria-label={t('Đóng hộp thoại')}
                onClick={() => {
                  if (!isChangingPlan) {
                    setChangePlanSub(null);
                    setChangePlanError(null);
                  }
                }}
                className="text-on-surface-variant hover:text-on-surface rounded-lg p-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-body-sm text-on-surface-variant space-y-1">
              <p>
                {t('Đang đổi gói cho API')} <strong className="text-on-surface">#{changePlanSub.apiId}</strong> (ID: #{changePlanSub.id}).
              </p>
              <p>
                {t('Gói hiện tại:')} <strong className="text-on-surface">{changePlanSub.planId}</strong>
              </p>
            </div>

            {/* Explicit Quota Preservation Advisory */}
            <div
              data-testid="quota-preservation-advisory"
              className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5 flex-shrink-0">
                info
              </span>
              <span>
                {t('Hạn ngạch đã sử dụng trong kỳ hiện tại được bảo toàn (không reset).')}
              </span>
            </div>

            {/* Plans List */}
            {isLoadingPlans && (
              <div
                data-testid="loading-change-plans"
                className="py-8 text-center text-body-sm text-on-surface-variant space-y-2"
              >
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p>{t('Đang tải danh sách gói khả dụng...')}</p>
              </div>
            )}

            {!isLoadingPlans && availablePlans.length === 0 && (
              <p className="text-body-sm text-on-surface-variant text-center py-4">
                {t('Không có gói dịch vụ nào khác khả dụng cho API này.')}
              </p>
            )}

            {!isLoadingPlans && availablePlans.length > 0 && (
              <div className="space-y-3" data-testid="available-plans-list">
                <span className="text-body-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('Chọn gói mới:')}
                </span>
                {availablePlans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <label
                      key={p.id}
                      data-testid={`change-plan-option-${p.id}`}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/40 bg-surface-container hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="changePlanSelected"
                            value={p.id}
                            checked={isSelected}
                            onChange={() => setSelectedPlanId(p.id)}
                            className="mt-1 accent-primary"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-on-surface text-body-md">
                                {p.name}
                              </span>
                              <Badge variant="primary">
                                {formatPrice(p.priceMonthly, p.currency)}
                              </Badge>
                            </div>
                            <div className="text-body-xs text-on-surface-variant mt-1 space-x-3">
                              <span>
                                {t('Quota:')} <strong className="font-mono">{formatBigIntCount(p.quota)}</strong> {t('yêu cầu/tháng')}
                              </span>
                              <span>•</span>
                              <span>
                                {t('Rate Limit:')} <strong className="font-mono">{p.rateLimit} req/phút</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {availablePlans.length > 0 && (
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-on-surface">
                    {t('Mô phỏng Sandbox:')}
                  </span>
                  <span className="text-[11px] font-code-sm text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                    Sandbox Test
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      changePlanOutcome === 'success'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-outline-variant/40 hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="changePlanOutcome"
                      value="success"
                      checked={changePlanOutcome === 'success'}
                      onChange={() => setChangePlanOutcome('success')}
                      className="accent-emerald-500"
                    />
                    <span className="text-body-sm">{t('Thành công')}</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      changePlanOutcome === 'failure'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                        : 'border-outline-variant/40 hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="changePlanOutcome"
                      value="failure"
                      checked={changePlanOutcome === 'failure'}
                      onChange={() => setChangePlanOutcome('failure')}
                      className="accent-rose-500"
                    />
                    <span className="text-body-sm">{t('Thất bại')}</span>
                  </label>
                </div>
                <p className="text-body-xs text-on-surface-variant">
                  {changePlanOutcome === 'success'
                    ? t('Mô phỏng thanh toán thành công: Gói mới sẽ được kích hoạt ngay, bảo toàn hạn ngạch hiện tại.')
                    : t('Mô phỏng thanh toán thất bại: Giao dịch bị từ chối, gói hiện tại và hạn ngạch được giữ nguyên.')}
                </p>
              </div>
            )}

            {changePlanError && (
              <div
                role="alert"
                data-testid="change-plan-error"
                className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-body-sm text-error flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
                <span>{changePlanError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Button
                variant="outline"
                size="sm"
                disabled={isChangingPlan}
                onClick={() => {
                  setChangePlanSub(null);
                  setChangePlanError(null);
                }}
              >
                {t('Đóng')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isChangingPlan}
                disabled={!selectedPlanId || isChangingPlan}
                onClick={handleConfirmChangePlan}
              >
                {t('Xác nhận đổi gói')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
