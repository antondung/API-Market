/* oxlint-disable react/only-export-components */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useOptionalAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import { getConsumerUsageSummary } from '../../services/usageApi';
import {
  type UsageSubscriptionSummary,
  type DailyUsageSummary,
  type UsageSummaryResponse,
  type SubscriptionStatus,
  type UsageQueryParams,
  formatBigIntCount,
  parseSafeBigInt,
} from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';
import { DailyRequestChart } from '../../components/usage/DailyRequestChart';
import { marketplaceApiIdError, usageRatePercent } from '../../components/usage/usageQuery';
import { canUseConsumerWorkspace } from '../../components/auth/workspaceRole';

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

export function validateDateRange(from?: string, to?: string): string | null {
  if (!from || !to) return null;
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return 'Ngày không hợp lệ';
  }
  if (fromTime > toTime) {
    return 'Ngày bắt đầu không được lớn hơn ngày kết thúc';
  }
  const diffDays = (toTime - fromTime) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return 'Khoảng thời gian không được vượt quá 365 ngày (tối đa 365 ngày)';
  }
  return null;
}

export function mapUsageError(err: unknown, defaultMsg = 'Không thể tải dữ liệu sử dụng.'): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (err.status === 403) {
      return 'Bạn không có quyền truy cập dữ liệu sử dụng này.';
    }
    if (err.status >= 500) {
      return 'Lỗi máy chủ (500). Vui lòng thử lại sau.';
    }
    return err.message || defaultMsg;
  }
  if (err instanceof Error) {
    return err.message || defaultMsg;
  }
  return defaultMsg;
}

export function renderSubscriptionStatusBadge(status: SubscriptionStatus) {
  switch (status) {
    case 'Active':
      return (
        <span data-testid="status-badge-active">
          <Badge variant="success" icon="check_circle">
            Active
          </Badge>
        </span>
      );
    case 'Pending':
      return (
        <span data-testid="status-badge-pending">
          <Badge variant="warning" icon="schedule">
            Pending
          </Badge>
        </span>
      );
    case 'Past Due':
      return (
        <span data-testid="status-badge-past-due">
          <Badge variant="warning" icon="warning">
            Past Due
          </Badge>
        </span>
      );
    case 'Suspended':
      return (
        <span data-testid="status-badge-suspended">
          <Badge variant="danger" icon="pause_circle">
            Suspended
          </Badge>
        </span>
      );
    case 'Canceled':
      return (
        <span data-testid="status-badge-canceled">
          <Badge variant="danger" icon="cancel">
            Canceled
          </Badge>
        </span>
      );
    case 'Expired':
      return (
        <span data-testid="status-badge-expired">
          <Badge variant="neutral" icon="event_busy">
            Expired
          </Badge>
        </span>
      );
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export const UsageQuotaPage: React.FC = () => {
  const auth = useOptionalAuth();
  const userId = auth === undefined ? '__standalone__' : (auth?.currentUser?.id ?? null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialApiId = searchParams.get('apiId') || '';
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';

  const [apiIdFilter, setApiIdFilter] = useState(initialApiId);
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [dateError, setDateError] = useState<string | null>(null);
  const [apiIdError, setApiIdError] = useState<string | null>(null);
  const workspaceRole = auth?.currentUser?.role;
  const consumerAllowed = canUseConsumerWorkspace(workspaceRole);

  const [usageState, setUsageState] = useState<{
    ownerId: string | number | null | undefined;
    data: UsageSummaryResponse | null;
    error: string | null;
  }>({
    ownerId: userId,
    data: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Render guard: zero stale render on account switch or logout
  const isOwner = Boolean(userId && usageState.ownerId === userId);
  const usageData = isOwner ? usageState.data : null;
  const fetchError = isOwner ? usageState.error : null;

  const fetchUsage = useCallback(
    async (signal?: AbortSignal) => {
      const vErr = validateDateRange(fromDate, toDate);
      const idErr = marketplaceApiIdError(apiIdFilter);
      setDateError(vErr);
      setApiIdError(idErr);
      if (vErr || idErr) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const params: UsageQueryParams = {};
      if (apiIdFilter.trim()) {
        params.apiId = apiIdFilter.trim();
      }
      if (fromDate.trim()) {
        params.from = fromDate.trim();
      }
      if (toDate.trim()) {
        params.to = toDate.trim();
      }

      try {
        const data = await getConsumerUsageSummary(params, signal);
        if (signal?.aborted) return;
        setUsageState({
          ownerId: userId,
          data,
          error: null,
        });
      } catch (err: unknown) {
        if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        setUsageState(prev => ({
          ...prev,
          ownerId: userId,
          error: mapUsageError(err),
        }));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [userId, apiIdFilter, fromDate, toDate]
  );

  useEffect(() => {
    const controller = new AbortController();
    setUsageState({ ownerId: userId, data: null, error: null });
    if (!consumerAllowed) {
      setIsLoading(false);
      return () => controller.abort();
    }
    if (userId) {
      fetchUsage(controller.signal);
    } else {
      setIsLoading(false);
    }
    return () => {
      controller.abort();
    };
  }, [userId, fetchUsage, retryTrigger, consumerAllowed]);

  const subscriptions: UsageSubscriptionSummary[] = useMemo(
    () => usageData?.subscriptions || [],
    [usageData]
  );

  const daily: DailyUsageSummary[] = useMemo(
    () => usageData?.daily || [],
    [usageData]
  );

  // Compute daily summary aggregates safely with BigInt
  const dailyTotals = useMemo(() => {
    const totalRequests = daily.reduce(
      (acc, d) => acc + parseSafeBigInt(d.requestCount),
      0n
    );
    const totalSuccess = daily.reduce(
      (acc, d) => acc + parseSafeBigInt(d.successCount),
      0n
    );
    const totalError = daily.reduce(
      (acc, d) => acc + parseSafeBigInt(d.errorCount),
      0n
    );
    return {
      totalRequests,
      totalSuccess,
      totalError,
      successRate: usageRatePercent(totalSuccess, totalRequests),
      errorRate: usageRatePercent(totalError, totalRequests),
    };
  }, [daily]);

  const handleResetFilters = () => {
    setApiIdFilter('');
    setFromDate('');
    setToDate('');
    setDateError(null);
    setApiIdError(null);
  };

  const handleApplyFilters = () => {
    const vErr = validateDateRange(fromDate, toDate);
    if (vErr) {
      setDateError(vErr);
      return;
    }
    setDateError(null);
    setRetryTrigger(c => c + 1);
  };

  const isEmpty =
    !isLoading &&
    !fetchError &&
    usageData !== null &&
    subscriptions.length === 0 &&
    daily.length === 0;

  if (!consumerAllowed) {
    return (
      <div
        role="alert"
        data-testid="consumer-role-guard"
        className="rounded-2xl border border-error/30 bg-error/10 p-8 text-center space-y-2"
      >
        <h1 className="text-headline-sm font-bold text-on-surface">
          {t('Màn hình dành cho Consumer')}
        </h1>
        <p className="text-body-sm text-on-surface-variant">
          {t('Hạn ngạch và lịch sử request chỉ mở cho Consumer và Provider. Tài khoản Admin dùng Admin Console.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('API Usage, Quota & Rate Limits')}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t(
              'Real-time metrics tracking monthly request allowances versus instantaneous burst rate limits.'
            )}
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

      {/* Critical Architecture Concept: Quota vs Rate Limit vs Sandbox */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </div>
          <div className="space-y-2 text-body-sm leading-relaxed">
            <h3 className="font-bold text-on-surface text-body-md">
              {t('Understanding Quota vs Rate Limit (US-23 Architecture)')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <span className="font-semibold text-primary block mb-0.5">
                  1. Hạn mức tháng (Monthly Quota)
                </span>
                <p className="text-on-surface-variant text-body-xs">
                  Tổng khối lượng gọi tối đa trong chu kỳ thanh toán hiện tại, quản lý bền vững tại Control Plane.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">
                  2. Giới hạn tốc độ (Rate Limit)
                </span>
                <p className="text-on-surface-variant text-body-xs">
                  Tốc độ gọi tức thời qua cửa sổ trượt Redis theo phút (RPM). Gọi dồn dập vượt ngưỡng req/phút sẽ nhận phản hồi HTTP 429.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  3. Gói dùng thử Sandbox
                </span>
                <p className="text-on-surface-variant text-body-xs">
                  Hạn ngạch thử nghiệm an toàn 24 giờ (5 lượt gọi/API/24h) phục vụ đánh giá trước khi đăng ký chính thức.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* API ID Filter */}
          <div className="flex-1">
            <label
              htmlFor="filter-api-id"
              className="text-body-xs font-semibold text-on-surface-variant block mb-1"
            >
              {t('Lọc theo API ID')}
            </label>
            <input
              id="filter-api-id"
              data-testid="filter-api-id"
              type="text"
              placeholder={t('Nhập API ID dạng số (ví dụ: 12)')}
              value={apiIdFilter}
              onChange={e => setApiIdFilter(e.target.value)}
              className="w-full px-3 py-2 text-body-sm rounded-xl border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* From Date Filter */}
          <div className="w-full md:w-44">
            <label
              htmlFor="filter-from-date"
              className="text-body-xs font-semibold text-on-surface-variant block mb-1"
            >
              {t('Từ ngày (From)')}
            </label>
            <input
              id="filter-from-date"
              data-testid="filter-from-date"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2 text-body-sm rounded-xl border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* To Date Filter */}
          <div className="w-full md:w-44">
            <label
              htmlFor="filter-to-date"
              className="text-body-xs font-semibold text-on-surface-variant block mb-1"
            >
              {t('Đến ngày (To)')}
            </label>
            <input
              id="filter-to-date"
              data-testid="filter-to-date"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2 text-body-sm rounded-xl border border-outline-variant/50 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2 pt-1 md:pt-5">
            <Button
              variant="primary"
              size="sm"
              icon="filter_alt"
              data-testid="filter-apply-btn"
              onClick={handleApplyFilters}
            >
              {t('Lọc')}
            </Button>
            {(apiIdFilter || fromDate || toDate) && (
              <Button
                variant="outline"
                size="sm"
                icon="clear"
                data-testid="filter-reset-btn"
                onClick={handleResetFilters}
              >
                {t('Đặt lại')}
              </Button>
            )}
          </div>
        </div>

        {/* Date Validation Error Alert */}
        {dateError && (
          <div
            role="alert"
            data-testid="filter-date-error"
            className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-body-xs text-error flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{dateError}</span>
          </div>
        )}
        {apiIdError && (
          <div
            role="alert"
            data-testid="filter-api-error"
            className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-body-xs text-error flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{apiIdError}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="usage-loading" className="space-y-6">
          <div className="h-28 bg-surface-container-low border border-outline-variant/30 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 bg-surface-container-low border border-outline-variant/30 rounded-2xl animate-pulse" />
            <div className="h-28 bg-surface-container-low border border-outline-variant/30 rounded-2xl animate-pulse" />
            <div className="h-28 bg-surface-container-low border border-outline-variant/30 rounded-2xl animate-pulse" />
          </div>
          <div className="h-56 bg-surface-container-low border border-outline-variant/30 rounded-2xl animate-pulse" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && fetchError && (
        <div
          role="alert"
          data-testid="usage-error"
          className="bg-surface-container-low border border-error/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h3 className="text-body-lg font-bold text-on-surface">
            {t('Không thể tải dữ liệu')}
          </h3>
          <p className="text-body-sm text-error">{fetchError}</p>
          <Button
            variant="primary"
            icon="refresh"
            data-testid="usage-retry-btn"
            onClick={() => setRetryTrigger(c => c + 1)}
          >
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div
          data-testid="usage-empty"
          className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center max-w-lg mx-auto"
        >
          <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">
            pie_chart
          </span>
          <h3 className="text-body-lg font-bold text-on-surface mb-2">
            {t('Chưa có đăng ký API')}
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-6">
            {t(
              'Chưa có gói cước thương mại hoặc dữ liệu sử dụng nào trong khoảng thời gian đã chọn. Khám phá Marketplace để bắt đầu.'
            )}
          </p>
          <Button
            variant="primary"
            icon="explore"
            onClick={() => navigate('/marketplace')}
          >
            {t('Explore Marketplace')}
          </Button>
        </div>
      )}

      {/* Success Content */}
      {!isLoading && !fetchError && usageData && !isEmpty && (
        <div data-testid="usage-content" className="space-y-8">
          {/* Subscribed APIs Usage Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm font-bold text-on-surface">
                {t('Active Subscription Breakdown')}
              </h2>
              <span className="text-body-sm text-on-surface-variant font-medium">
                {subscriptions.length} {t('gói đăng ký')}
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                  inventory_2
                </span>
                <p className="text-body-sm text-on-surface-variant">
                  {t('Không có gói đăng ký nào khớp với bộ lọc hiện tại.')}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {subscriptions.map(sub => {
                  const progressPct = calculateQuotaProgress(
                    sub.quotaUsed,
                    sub.quotaLimit
                  );
                  const isExhausted =
                    sub.status === 'Active' &&
                    parseSafeBigInt(sub.quotaUsed) >= parseSafeBigInt(sub.quotaLimit);
                  const isPeriodExpired =
                    Boolean(sub.periodEnd) &&
                    new Date(sub.periodEnd).getTime() <= Date.now();

                  return (
                    <div
                      key={sub.id}
                      data-testid={`subscription-usage-card-${sub.id}`}
                      className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4 hover:border-outline-variant/60 transition-colors"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[24px]">
                              api
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/api/${sub.apiId}`}
                                className="text-title-lg font-bold text-on-surface hover:text-primary transition-colors"
                              >
                                API #{sub.apiId}
                              </Link>
                              {renderSubscriptionStatusBadge(sub.status)}
                              <span className="text-body-xs font-mono text-on-surface-variant">
                                Sub ID: #{sub.id}
                              </span>
                            </div>
                            <span className="text-body-xs text-on-surface-variant block mt-0.5">
                              {t('Kỳ hạn ngạch:')} {formatDate(sub.periodStart)} →{' '}
                              {formatDate(sub.periodEnd)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              progressPct >= 100
                                ? 'danger'
                                : progressPct > 80
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {progressPct >= 100
                              ? t('Exhausted')
                              : progressPct > 80
                              ? t('Heavy Usage')
                              : t('Healthy')}
                          </Badge>
                        </div>
                      </div>

                      {/* Quota Exhausted Alert */}
                      {isExhausted && (
                        <div
                          role="alert"
                          data-testid={`quota-exhausted-${sub.id}`}
                          className="rounded-xl border border-error/30 bg-error/10 p-3 text-body-sm text-error flex items-center gap-2.5"
                        >
                          <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                            warning
                          </span>
                          <div>
                            <strong className="font-semibold block sm:inline">
                              Hạn ngạch đã cạn (Quota Exhausted)
                            </strong>
                            <span className="text-body-xs text-on-surface-variant sm:ml-2">
                              Lệnh gọi tiếp theo bị Gateway từ chối với HTTP 403. Vượt tốc độ theo phút vẫn là HTTP 429.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Period Expired Alert */}
                      {isPeriodExpired && (
                        <div
                          data-testid={`period-expired-${sub.id}`}
                          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-body-xs text-amber-800 dark:text-amber-200 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                            event_busy
                          </span>
                          <span>
                            {t('Kỳ hạn ngạch đã kết thúc (Period Expired):')}{' '}
                            {formatDate(sub.periodEnd)}
                          </span>
                        </div>
                      )}

                      {/* Quota Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-body-sm">
                          <span className="text-on-surface-variant font-medium">
                            {t('Tiến độ sử dụng hạn ngạch')}
                          </span>
                          <span className="font-mono font-bold text-on-surface">
                            {formatBigIntCount(sub.quotaUsed)} /{' '}
                            {formatBigIntCount(sub.quotaLimit)} ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
                          <div
                            role="progressbar"
                            aria-valuenow={progressPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct >= 100
                                ? 'bg-error'
                                : progressPct > 80
                                ? 'bg-amber-500'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics Footer Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/20 text-body-sm">
                        <div>
                          <span className="text-[11px] text-on-surface-variant block uppercase font-semibold">
                            {t('Remaining Requests')}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBigIntCount(sub.remainingRequests)} {t('lượt')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-on-surface-variant block uppercase font-semibold">
                            {t('Chu kỳ bắt đầu')}
                          </span>
                          <span className="font-mono text-on-surface">
                            {formatDate(sub.periodStart)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-on-surface-variant block uppercase font-semibold">
                            {t('Hạn ngạch reset')}
                          </span>
                          <span className="font-mono text-on-surface">
                            {formatDate(sub.periodEnd)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-on-surface-variant block uppercase font-semibold">
                            {t('Chính sách vượt ngạch')}
                          </span>
                          <span className="font-semibold text-error">
                            {t('Hard Cutoff (HTTP 403)')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Traffic Breakdown Section */}
          <div className="space-y-6 pt-4 border-t border-outline-variant/30">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">
                {t('Daily Usage Telemetry')}
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                {t(
                  'Tổng hợp số lượt gọi, yêu cầu thành công và lỗi theo từng ngày.'
                )}
              </p>
            </div>

            {/* Daily Summary Aggregate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] uppercase font-semibold text-on-surface-variant tracking-wider block mb-1">
                  {t('Tổng lượt gọi (Total Requests)')}
                </span>
                <div className="text-2xl font-bold font-mono text-on-surface">
                  {formatBigIntCount(dailyTotals.totalRequests)}
                </div>
                <span className="text-body-xs text-on-surface-variant mt-1 block">
                  {t('Ghi nhận qua API Gateway')}
                </span>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider block mb-1">
                  {t('Thành công (Success Count)')}
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatBigIntCount(dailyTotals.totalSuccess)}
                </div>
                <span className="text-body-xs text-on-surface-variant mt-1 block">
                  {t('Tỷ lệ thành công:')}{' '}
                  {dailyTotals.successRate === null ? '—' : `${dailyTotals.successRate.toFixed(1)}%`}
                </span>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
                <span className="text-[11px] uppercase font-semibold text-error tracking-wider block mb-1">
                  {t('Lỗi (Error Count)')}
                </span>
                <div className="text-2xl font-bold font-mono text-error">
                  {formatBigIntCount(dailyTotals.totalError)}
                </div>
                <span className="text-body-xs text-on-surface-variant mt-1 block">
                  {t('Tỷ lệ lỗi:')}{' '}
                  {dailyTotals.errorRate === null ? '—' : `${dailyTotals.errorRate.toFixed(1)}%`}
                </span>
              </div>
            </div>

            {daily.length > 0 && (
              <DailyRequestChart
                points={daily}
                title={t('Biểu đồ lượt gọi theo ngày')}
              />
            )}

            {/* Daily Breakdown Table / List */}
            {daily.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                  query_stats
                </span>
                <p className="text-body-sm text-on-surface-variant">
                  {t('Chưa có dữ liệu lưu lượng ngày trong khoảng thời gian này.')}
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">{t('Ngày')}</th>
                        <th className="py-3 px-4 text-right">{t('Tổng yêu cầu')}</th>
                        <th className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                          {t('Thành công')}
                        </th>
                        <th className="py-3 px-4 text-right text-error">{t('Lỗi')}</th>
                        <th className="py-3 px-4 text-center">{t('Phân bổ')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {daily.map(day => {
                        const dayReq = parseSafeBigInt(day.requestCount);
                        const daySucc = parseSafeBigInt(day.successCount);
                        const dayErr = parseSafeBigInt(day.errorCount);
                        const succPct =
                          dayReq > 0n
                            ? Number((daySucc * 100n) / dayReq)
                            : 100;

                        return (
                          <tr
                            key={day.date}
                            data-testid={`daily-row-${day.date}`}
                            className="hover:bg-surface-container-high/40 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-medium text-on-surface">
                              {formatDate(day.date)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-on-surface">
                              {formatBigIntCount(day.requestCount)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                              {formatBigIntCount(day.successCount)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-error">
                              {formatBigIntCount(day.errorCount)}
                            </td>
                            <td className="py-3 px-4 w-44">
                              <div className="w-full bg-error/20 h-2 rounded-full overflow-hidden flex">
                                <div
                                  className="bg-emerald-500 h-full transition-all"
                                  style={{ width: `${succPct}%` }}
                                  title={`Thành công: ${succPct}%`}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
