import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../i18n';
import { useOptionalAuth } from '../../context/AuthContext';
import { canUseProviderWorkspace } from '../../components/auth/workspaceRole';
import { getProviderAnalyticsOverview } from '../../services/usageApi';
import { listProviderApis, listProviderEndpoints } from '../../services/providerApi';
import type {
  ProviderAnalyticsOverview,
  ProviderAnalyticsQueryParams,
  ProviderTopEndpoint,
  ProviderApiBreakdown,
} from '../../services/sprint4Types';
import type { ProviderApi, ProviderEndpoint } from '../../services/providerTypes';
import { formatBigIntCount, formatCurrencyAmount, parseSafeBigInt } from '../../services/sprint4Types';
import { DailyRequestChart } from '../../components/usage/DailyRequestChart';
import {
  validateUsageDateRange,
  marketplaceApiIdError,
  marketplaceEndpointIdError,
  usageRatePercent,
} from '../../components/usage/usageQuery';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../services/authApi';

export const AnalyticsHealthPage: React.FC = () => {
  const { t } = useLanguage();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const auth = useOptionalAuth();
  const currentUser = auth?.currentUser;
  const userId = currentUser?.id;
  const isProvider = canUseProviderWorkspace(currentUser?.role);

  // APIs and Endpoints for filter dropdowns
  const [providerApis, setProviderApis] = useState<ProviderApi[]>([]);
  const [providerEndpoints, setProviderEndpoints] = useState<ProviderEndpoint[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Filter drafts
  const [draftApiId, setDraftApiId] = useState('');
  const [draftEndpointId, setDraftEndpointId] = useState('');
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [filterError, setFilterError] = useState<string | null>(null);

  // Applied query params
  const [appliedQuery, setAppliedQuery] = useState<ProviderAnalyticsQueryParams>({});

  // Analytics State
  const [analytics, setAnalytics] = useState<ProviderAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cancellation and race condition guards
  const apisAbortControllerRef = useRef<AbortController | null>(null);
  const endpointsAbortControllerRef = useRef<AbortController | null>(null);
  const analyticsAbortControllerRef = useRef<AbortController | null>(null);
  const latestAnalyticsRequestIdRef = useRef<number>(0);
  const accountKey = `${userId ?? ''}_${isProvider ? '1' : '0'}`;
  const prevAccountKeyRef = useRef<string>(accountKey);

  // Reset all state immediately on user/account change
  useEffect(() => {
    if (prevAccountKeyRef.current !== accountKey) {
      prevAccountKeyRef.current = accountKey;
      apisAbortControllerRef.current?.abort();
      endpointsAbortControllerRef.current?.abort();
      analyticsAbortControllerRef.current?.abort();

      setProviderApis([]);
      setProviderEndpoints([]);
      setDraftApiId('');
      setDraftEndpointId('');
      setDraftFrom('');
      setDraftTo('');
      setFilterError(null);
      setAppliedQuery({});
      setAnalytics(null);
      setLoadError(null);
    }
  }, [accountKey]);

  // Load provider APIs for filter dropdown with AbortSignal check
  useEffect(() => {
    if (!userId || !isProvider) {
      setProviderApis([]);
      setIsLoadingFilters(false);
      return;
    }
    const controller = new AbortController();
    apisAbortControllerRef.current = controller;
    setIsLoadingFilters(true);

    listProviderApis(1, 100, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setProviderApis(res.items);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProviderApis([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingFilters(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [userId, isProvider]);

  // Load provider endpoints when API is selected with AbortSignal check
  useEffect(() => {
    endpointsAbortControllerRef.current?.abort();
    if (!draftApiId.trim() || !userId || !isProvider) {
      setProviderEndpoints([]);
      setDraftEndpointId('');
      return;
    }
    const controller = new AbortController();
    endpointsAbortControllerRef.current = controller;

    listProviderEndpoints(draftApiId.trim(), controller.signal)
      .then((endpoints) => {
        if (!controller.signal.aborted) {
          setProviderEndpoints(endpoints);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProviderEndpoints([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [draftApiId, userId, isProvider]);

  // Fetch analytics overview guarded against out-of-order responses
  const fetchAnalytics = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId || !isProvider) {
        setIsLoading(false);
        setAnalytics(null);
        return;
      }
      const requestId = ++latestAnalyticsRequestIdRef.current;
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getProviderAnalyticsOverview(appliedQuery, signal);
        if (signal?.aborted || requestId !== latestAnalyticsRequestIdRef.current) return;
        setAnalytics(data);
      } catch (err: unknown) {
        if (signal?.aborted || requestId !== latestAnalyticsRequestIdRef.current) return;
        if (err instanceof ApiError) {
          setLoadError(err.message || tRef.current('Lỗi kết nối máy chủ'));
        } else if (err instanceof Error) {
          setLoadError(err.message);
        } else {
          setLoadError(tRef.current('Không thể tải dữ liệu phân tích telemetry'));
        }
      } finally {
        if (!signal?.aborted && requestId === latestAnalyticsRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [userId, isProvider, appliedQuery]
  );

  useEffect(() => {
    if (!userId || !isProvider) {
      setAnalytics(null);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    analyticsAbortControllerRef.current = controller;
    fetchAnalytics(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchAnalytics, userId, isProvider]);

  const handleRetry = useCallback(() => {
    analyticsAbortControllerRef.current?.abort();
    const controller = new AbortController();
    analyticsAbortControllerRef.current = controller;
    fetchAnalytics(controller.signal);
  }, [fetchAnalytics]);

  // Apply filters handler
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const apiErr = marketplaceApiIdError(draftApiId);
    const epErr = marketplaceEndpointIdError(draftEndpointId);
    const dateErr = validateUsageDateRange(draftFrom, draftTo);

    const firstErr = apiErr || epErr || dateErr;
    if (firstErr) {
      setFilterError(firstErr);
      return;
    }
    setFilterError(null);

    const next: ProviderAnalyticsQueryParams = {};
    if (draftApiId.trim()) next.apiId = draftApiId.trim();
    if (draftEndpointId.trim()) next.endpointId = draftEndpointId.trim();
    if (draftFrom.trim()) next.from = draftFrom.trim();
    if (draftTo.trim()) next.to = draftTo.trim();

    setAppliedQuery(next);
  };

  const handleResetFilters = () => {
    setDraftApiId('');
    setDraftEndpointId('');
    setDraftFrom('');
    setDraftTo('');
    setFilterError(null);
    setAppliedQuery({});
  };

  // Metrics computation
  const req = analytics?.requests;
  const totalRequests = parseSafeBigInt(req?.requestCount ?? '0');
  const successCount = parseSafeBigInt(req?.successCount ?? '0');
  const errorCount = parseSafeBigInt(req?.errorCount ?? '0');
  const clientErrorCount = parseSafeBigInt(req?.clientErrorCount ?? '0');
  const serverErrorCount = parseSafeBigInt(req?.serverErrorCount ?? '0');

  const successPercent = usageRatePercent(successCount, totalRequests);
  const clientErrorPercent = usageRatePercent(clientErrorCount, totalRequests);
  const serverErrorPercent = usageRatePercent(serverErrorCount, totalRequests);

  const errorRateDisplay =
    req?.errorRatePercent !== undefined && req.errorRatePercent !== null
      ? `${req.errorRatePercent.toFixed(2)}%`
      : totalRequests > 0n
        ? `${((Number(errorCount) / Number(totalRequests)) * 100).toFixed(2)}%`
        : '—';

  const averageLatencyDisplay =
    req?.averageLatencyMs && req.averageLatencyMs > 0
      ? `${req.averageLatencyMs.toFixed(1)} ms`
      : totalRequests > 0n
        ? '0 ms'
        : '—';

  // Helper for honest quantile rendering
  const formatQuantile = (val: number | null | undefined): string => {
    if (val === null || val === undefined) {
      return t('Chưa có dữ liệu thực');
    }
    return `${val} ms`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('Provider Telemetry & Health Analytics')}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t(
              'Deep observability into latency quantiles, upstream response distributions, and regional edge performance.'
            )}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">
        <form
          data-testid="analytics-filter-form"
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          {/* API Selector */}
          <div>
            <label htmlFor="analytics-api-select" className="block text-body-xs font-semibold text-on-surface mb-1">
              {t('Lọc theo API')}
            </label>
            <select
              id="analytics-api-select"
              aria-label={t('Lọc theo API')}
              value={draftApiId}
              onChange={(e) => {
                const newApiId = e.target.value;
                setDraftApiId(newApiId);
                setDraftEndpointId('');
                setProviderEndpoints([]);
              }}
              disabled={isLoadingFilters || isLoading}
              className="w-full bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('Tất cả API')}</option>
              {providerApis.map((api) => (
                <option key={api.id} value={api.id}>
                  {api.name}
                </option>
              ))}
            </select>
          </div>

          {/* Endpoint Selector */}
          <div>
            <label htmlFor="analytics-endpoint-select" className="block text-body-xs font-semibold text-on-surface mb-1">
              {t('Lọc theo Endpoint')}
            </label>
            <select
              id="analytics-endpoint-select"
              aria-label={t('Lọc theo Endpoint')}
              value={draftEndpointId}
              onChange={(e) => setDraftEndpointId(e.target.value)}
              disabled={!draftApiId || isLoading}
              className="w-full bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">{t('Tất cả Endpoint')}</option>
              {providerEndpoints.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.method} {ep.path}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label htmlFor="analytics-from-date" className="block text-body-xs font-semibold text-on-surface mb-1">
              {t('Từ ngày (UTC)')}
            </label>
            <input
              id="analytics-from-date"
              aria-label={t('Từ ngày (UTC)')}
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm font-code-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* To Date */}
          <div>
            <label htmlFor="analytics-to-date" className="block text-body-xs font-semibold text-on-surface mb-1">
              {t('Đến ngày (UTC)')}
            </label>
            <input
              id="analytics-to-date"
              aria-label={t('Đến ngày (UTC)')}
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2 text-body-sm font-code-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" className="flex-1 justify-center" disabled={isLoading}>
              {t('Áp dụng')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={isLoading || (!draftApiId && !draftEndpointId && !draftFrom && !draftTo)}
              className="justify-center"
            >
              {t('Đặt lại')}
            </Button>
          </div>
        </form>

        {filterError && (
          <div role="alert" className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{filterError}</span>
          </div>
        )}
      </div>

      {/* Error State */}
      {loadError && (
        <div role="alert" className="p-6 rounded-2xl bg-error-container/20 border border-error/30 text-center space-y-3">
          <span className="material-symbols-outlined text-error text-[36px]">error</span>
          <p className="text-body-md text-error font-medium">{loadError}</p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="mx-auto">
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="analytics-skeleton" className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
            <div className="h-28 bg-surface-container rounded-2xl" />
          </div>
          <div className="h-64 bg-surface-container rounded-2xl" />
          <div className="h-48 bg-surface-container rounded-2xl" />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !loadError && (
        <div className="space-y-8">
          {/* Honest Observability Notice */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
            <div className="text-body-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{t('Trạng thái giám sát (Honest Observability): ')}</strong>
              {t(
                'Gateway cung cấp số liệu tổng hợp (tổng request, tỷ lệ lỗi, độ trễ trung bình) và phân vị độ trễ thực tế (P50, P95, P99). Trường hợp chưa đủ mẫu đo, hệ thống hiển thị "Chưa có dữ liệu thực". Các số liệu phân tán đa vùng (Regional Edge) hiện là mục tiêu SLA thiết kế trên lộ trình phát triển.'
              )}
            </div>
          </div>

          {/* Traffic Overview & Health KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Tổng lượt gọi (Requests)')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {formatBigIntCount(totalRequests)}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {t('Trong khoảng thời gian đã lọc')}
              </span>
            </div>

            {/* Error Rate */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Tỷ lệ lỗi (Error Rate)')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {errorRateDisplay}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {totalRequests > 0n
                  ? `${formatBigIntCount(errorCount)} ${t('lượt lỗi (4xx / 5xx)')}`
                  : t('Chưa có request')}
              </span>
            </div>

            {/* Average Latency */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Độ trễ trung bình')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {averageLatencyDisplay}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {t('Gateway round-trip latency')}
              </span>
            </div>

            {/* Active Subscribers */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Active Subscribers')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {analytics?.activeSubscribers ?? '0'}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {t('Consumer đang hoạt động')}
              </span>
            </div>
          </div>

          {/* Multi-Currency Revenue Cards */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
                {t('Doanh thu theo đơn vị tiền tệ (UTC)')}
              </h3>
              <span className="text-body-xs text-on-surface-variant">
                {t('Tách biệt độc lập — Không gộp đơn vị tiền tệ')}
              </span>
            </div>

            {analytics?.revenue && analytics.revenue.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {analytics.revenue.map((rev) => (
                  <div
                    key={rev.currency}
                    className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-label-sm font-bold text-on-surface-variant block uppercase">
                        {rev.currency}
                      </span>
                      <div className="text-title-lg font-bold text-on-surface font-code-md mt-1">
                        {formatCurrencyAmount(rev.amount, rev.currency)}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-[28px]">account_balance_wallet</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-center text-body-sm text-on-surface-variant">
                {t('Chưa ghi nhận doanh thu phát sinh trong khoảng thời gian đã lọc.')}
              </div>
            )}
          </div>

          {/* Quantiles Grid (P50, P95, P99 Supported by Backend) */}
          <div className="space-y-4">
            <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">speed</span>
              {t('Phân vị độ trễ (Latency Quantiles & SLA Boundaries)')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* P50 */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
                <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                  {t('P50 Median Latency')}
                </span>
                <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
                  {formatQuantile(req?.p50LatencyMs)}
                </div>
                <span className="text-body-sm text-primary font-medium mt-1 block">
                  {t('Target SLA: < 20 ms')}
                </span>
              </div>

              {/* P95 */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
                <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                  {t('P95 SLA Boundary')}
                </span>
                <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
                  {formatQuantile(req?.p95LatencyMs)}
                </div>
                <span className="text-body-sm text-primary font-medium mt-1 block">
                  {t('Target SLA: < 50 ms')}
                </span>
              </div>

              {/* P99 */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
                <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                  {t('P99 Worst Case')}
                </span>
                <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
                  {formatQuantile(req?.p99LatencyMs)}
                </div>
                <span className="text-body-sm text-primary font-medium mt-1 block">
                  {t('Target SLA: < 100 ms')}
                </span>
              </div>
            </div>
          </div>

          {/* HTTP Status Code Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-on-surface text-body-md">{t('Tỷ lệ thành công (<400)')}</span>
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 font-code-md mb-2">
                {successPercent !== null ? `${successPercent.toFixed(2)}%` : '—'}
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {totalRequests > 0n
                  ? `${formatBigIntCount(successCount)} ${t('lượt gọi thành công (<400: 2xx & 3xx)')}`
                  : t('Chưa ghi nhận request trong phiên làm việc.')}
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-on-surface text-body-md">{t('4xx Client Errors')}</span>
                <span className="material-symbols-outlined text-amber-600">warning</span>
              </div>
              <div className="text-4xl font-extrabold text-amber-600 font-code-md mb-2">
                {clientErrorPercent !== null ? `${clientErrorPercent.toFixed(2)}%` : '—'}
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {totalRequests > 0n
                  ? `${formatBigIntCount(clientErrorCount)} ${t('lỗi client (4xx)')}`
                  : t('Chưa ghi nhận request trong phiên làm việc.')}
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-on-surface text-body-md">{t('5xx Upstream Faults')}</span>
                <span className="material-symbols-outlined text-error">error</span>
              </div>
              <div className="text-4xl font-extrabold text-error font-code-md mb-2">
                {serverErrorPercent !== null ? `${serverErrorPercent.toFixed(2)}%` : '—'}
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {totalRequests > 0n
                  ? `${formatBigIntCount(serverErrorCount)} ${t('sự cố upstream (5xx)')}`
                  : t('Chưa ghi nhận request trong phiên làm việc.')}
              </p>
            </div>
          </div>

          {/* Daily Request Chart */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <DailyRequestChart
              points={analytics?.daily ?? []}
              title={t('Biểu đồ lưu lượng request theo ngày (UTC)')}
            />
          </div>

          {/* Top 10 Endpoints Table */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">table_rows</span>
                {t('Top 10 Endpoints phổ biến')}
              </h3>
              <span className="text-body-xs text-on-surface-variant">
                {t('Xếp theo tổng số lượt gọi giảm dần')}
              </span>
            </div>

            {analytics?.topEndpoints && analytics.topEndpoints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-body-xs text-on-surface-variant uppercase font-semibold">
                      <th className="pb-3 pr-4">{t('Method')}</th>
                      <th className="pb-3 pr-4">{t('Path')}</th>
                      <th className="pb-3 pr-4">{t('API')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Lượt gọi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Lỗi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Tỷ lệ lỗi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('P50')}</th>
                      <th className="pb-3 text-right">{t('P95')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-code-sm">
                    {analytics.topEndpoints.map((ep: ProviderTopEndpoint) => (
                      <tr key={`${ep.apiId}-${ep.endpointId}`} className="hover:bg-surface-container/50">
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              ep.method === 'GET'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : ep.method === 'POST'
                                  ? 'bg-blue-500/10 text-blue-600'
                                  : ep.method === 'PUT'
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : ep.method === 'DELETE'
                                      ? 'bg-error/10 text-error'
                                      : 'bg-outline-variant/20 text-on-surface'
                            }`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-on-surface font-semibold">{ep.path}</td>
                        <td className="py-3 pr-4 text-on-surface-variant font-sans">{ep.apiName}</td>
                        <td className="py-3 pr-4 text-right text-on-surface font-bold">
                          {formatBigIntCount(ep.requestCount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-amber-600 font-bold">
                          {formatBigIntCount(ep.errorCount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-on-surface">
                          {ep.errorRatePercent !== undefined ? `${ep.errorRatePercent.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-on-surface-variant">
                          {ep.p50LatencyMs !== null && ep.p50LatencyMs !== undefined ? `${ep.p50LatencyMs}ms` : '—'}
                        </td>
                        <td className="py-3 text-right text-on-surface-variant">
                          {ep.p95LatencyMs !== null && ep.p95LatencyMs !== undefined ? `${ep.p95LatencyMs}ms` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-center text-body-sm text-on-surface-variant">
                {t('Chưa có dữ liệu endpoint trong khoảng thời gian này.')}
              </div>
            )}
          </div>

          {/* API Breakdown Table */}
          {analytics?.apiBreakdown && analytics.apiBreakdown.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">category</span>
                  {t('Phân bổ lưu lượng theo API')}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-body-xs text-on-surface-variant uppercase font-semibold">
                      <th className="pb-3 pr-4">{t('API Name')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Lượt gọi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Lỗi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('Tỷ lệ lỗi')}</th>
                      <th className="pb-3 pr-4 text-right">{t('P50')}</th>
                      <th className="pb-3 text-right">{t('P95')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-code-sm">
                    {analytics.apiBreakdown.map((item: ProviderApiBreakdown) => (
                      <tr key={item.apiId} className="hover:bg-surface-container/50">
                        <td className="py-3 pr-4 text-on-surface font-sans font-semibold">{item.apiName}</td>
                        <td className="py-3 pr-4 text-right text-on-surface font-bold">
                          {formatBigIntCount(item.requestCount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-amber-600 font-bold">
                          {formatBigIntCount(item.errorCount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-on-surface">
                          {item.errorRatePercent !== undefined ? `${item.errorRatePercent.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-on-surface-variant">
                          {item.p50LatencyMs !== null && item.p50LatencyMs !== undefined ? `${item.p50LatencyMs}ms` : '—'}
                        </td>
                        <td className="py-3 text-right text-on-surface-variant">
                          {item.p95LatencyMs !== null && item.p95LatencyMs !== undefined ? `${item.p95LatencyMs}ms` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Regional Edge Performance */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface">
                {t('Regional Edge Latencies (Mục tiêu SLA — Chưa có dữ liệu thực)')}
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-outline-variant/20 text-on-surface-variant font-medium">
                {t('Roadmap / Đang phát triển')}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-4">
              {t(
                'Hệ thống Gateway hiện chưa kích hoạt phân tán đa vùng. Các vùng bên dưới thể hiện mục tiêu SLA thiết kế khi triển khai multi-region.'
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-on-surface">AP-Southeast (Singapore / Hanoi)</span>
                  <span className="font-code-md text-sm font-medium text-on-surface-variant">{t('Chưa có dữ liệu')}</span>
                </div>
                <span className="text-[12px] text-primary font-medium block mb-1">{t('Mục tiêu SLA: < 15 ms')}</span>
                <span className="text-[12px] text-on-surface-variant">{t('Direct fiber connection to edge node (dự kiến)')}</span>
              </div>

              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-on-surface">US-East (N. Virginia)</span>
                  <span className="font-code-md text-sm font-medium text-on-surface-variant">{t('Chưa có dữ liệu')}</span>
                </div>
                <span className="text-[12px] text-primary font-medium block mb-1">{t('Mục tiêu SLA: < 20 ms')}</span>
                <span className="text-[12px] text-on-surface-variant">{t('Multi-zone cluster redundancy (dự kiến)')}</span>
              </div>

              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-on-surface">EU-Central (Frankfurt)</span>
                  <span className="font-code-md text-sm font-medium text-on-surface-variant">{t('Chưa có dữ liệu')}</span>
                </div>
                <span className="text-[12px] text-primary font-medium block mb-1">{t('Mục tiêu SLA: < 25 ms')}</span>
                <span className="text-[12px] text-on-surface-variant">{t('GDPR isolated ingress gateway (dự kiến)')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
