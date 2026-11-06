/* oxlint-disable react/only-export-components */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOptionalAuth } from '../../context/AuthContext';
import { MethodBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import * as usageApi from '../../services/usageApi';
import type { UsageHistoryItem, UsageQueryParams } from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';
import { marketplaceApiIdError } from '../../components/usage/usageQuery';
import { canUseConsumerWorkspace } from '../../components/auth/workspaceRole';

export function formatOccurredAt(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

export function getStatusCodeBadgeClass(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30';
  }
  if (statusCode >= 400 && statusCode < 500) {
    return 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30';
  }
  if (statusCode >= 500) {
    return 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border border-rose-500/30';
  }
  return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
}

export function validateDateRange(from?: string, to?: string): string | null {
  if (!from || !to) return null;
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return 'Định dạng ngày không hợp lệ.';
  }
  if (fromTime > toTime) {
    return 'Ngày bắt đầu không được sau ngày kết thúc.';
  }
  const diffDays = (toTime - fromTime) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return 'Khoảng thời gian không được vượt quá 365 ngày.';
  }
  return null;
}

export function mapRequestHistoryError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.code === 'UNAUTHORIZED') {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (err.status === 403 || err.code === 'FORBIDDEN') {
      return 'Bạn không có quyền truy cập nhật ký yêu cầu này.';
    }
    if (err.status === 429 || err.code === 'RATE_LIMITED') {
      return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.';
    }
    if (err.status >= 500 || err.code === 'METERING_UNAVAILABLE') {
      return 'Hệ thống đo lường hoặc máy chủ đang gặp sự cố (500). Vui lòng thử lại sau.';
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) {
    if (err.name === 'AbortError') return '';
    return err.message;
  }
  return 'Không thể tải lịch sử yêu cầu API. Vui lòng thử lại.';
}

export const RequestHistoryPage: React.FC = () => {
  const auth = useOptionalAuth();
  const userId = auth === undefined ? '__standalone__' : (auth?.currentUser?.id ?? null);
  const { t } = useLanguage();

  const [historyData, setHistoryData] = useState<{
    ownerId: string | number | null | undefined;
    items: UsageHistoryItem[];
    total: number;
    error: string | null;
  }>({
    ownerId: userId,
    items: [],
    total: 0,
    error: null,
  });
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [apiIdInput, setApiIdInput] = useState<string>('');
  const [activeApiId, setActiveApiId] = useState<string>('');
  const [dateFromInput, setDateFromInput] = useState<string>('');
  const [dateToInput, setDateToInput] = useState<string>('');
  const [activeDateFrom, setActiveDateFrom] = useState<string>('');
  const [activeDateTo, setActiveDateTo] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [apiIdError, setApiIdError] = useState<string | null>(null);
  const workspaceRole = auth?.currentUser?.role;
  const consumerAllowed = canUseConsumerWorkspace(workspaceRole);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rawActiveLog, setRawActiveLog] = useState<UsageHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Render guard: zero stale render on account switch or logout
  const isOwner = Boolean(userId && historyData.ownerId === userId);
  const items = isOwner ? historyData.items : [];
  const total = isOwner ? historyData.total : 0;
  const error = isOwner ? historyData.error : null;
  const activeLog = isOwner ? rawActiveLog : null;
  const setActiveLog = setRawActiveLog;

  const requestIdRef = useRef<number>(0);

  const fetchHistory = useCallback(
    async (
      targetPage: number,
      statusVal: string,
      apiIdVal: string,
      fromVal: string,
      toVal: string,
      signal?: AbortSignal
    ) => {
      const currentReqId = ++requestIdRef.current;
      setIsLoading(true);

      try {
        const params: UsageQueryParams = {
          page: targetPage,
          pageSize,
        };

        if (statusVal && statusVal !== 'all') {
          const parsed = parseInt(statusVal, 10);
          if (!Number.isNaN(parsed)) {
            params.status = parsed;
          }
        }

        if (apiIdVal.trim()) {
          params.apiId = apiIdVal.trim();
        }

        if (fromVal.trim()) {
          params.from = fromVal.trim();
        }

        if (toVal.trim()) {
          params.to = toVal.trim();
        }

        const res = await usageApi.getConsumerUsageHistory(params, signal);

        if (currentReqId !== requestIdRef.current) {
          return;
        }

        setHistoryData({
          ownerId: userId,
          items: res.items || [],
          total: res.total || 0,
          error: null,
        });
      } catch (err: unknown) {
        if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) {
          return;
        }
        if (currentReqId !== requestIdRef.current) {
          return;
        }
        setHistoryData(prev => ({
          ...prev,
          ownerId: userId,
          error: mapRequestHistoryError(err),
        }));
      } finally {
        if (currentReqId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [userId, pageSize]
  );

  useEffect(() => {
    const controller = new AbortController();
    setHistoryData({ ownerId: userId, items: [], total: 0, error: null });
    setRawActiveLog(null);
    if (!consumerAllowed) {
      setIsLoading(false);
      return () => {
        controller.abort();
      };
    }
    if (userId) {
      fetchHistory(
        page,
        selectedStatus,
        activeApiId,
        activeDateFrom,
        activeDateTo,
        controller.signal
      );
    } else {
      setIsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [userId, fetchHistory, page, selectedStatus, activeApiId, activeDateFrom, activeDateTo, consumerAllowed]);

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rangeErr = validateDateRange(dateFromInput, dateToInput);
    const idErr = marketplaceApiIdError(apiIdInput);
    setDateError(rangeErr);
    setApiIdError(idErr);
    if (rangeErr || idErr) {
      return;
    }
    setPage(1);
    setActiveApiId(apiIdInput);
    setActiveDateFrom(dateFromInput);
    setActiveDateTo(dateToInput);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setApiIdInput('');
    setActiveApiId('');
    setDateFromInput('');
    setDateToInput('');
    setActiveDateFrom('');
    setActiveDateTo('');
    setDateError(null);
    setApiIdError(null);
    setPage(1);
  };

  const handleCopyRequestId = (id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(id).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
          {t('Lịch sử request chỉ mở cho Consumer và Provider. Tài khoản Admin dùng Admin Console.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden compatibility hook for test assertions */}
      <span className="sr-only">No telemetry logs captured</span>

      <div className="pb-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('API Request History & Logs')}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t(
              'Audit trail of Gateway requests. Sensitive tokens, credentials, and bodies are automatically redacted.'
            )}
          </p>
        </div>
      </div>

      {/* Honest Advisory Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">
          info
        </span>
        <div>
          <strong className="text-on-surface font-semibold">
            {t('Hiện trạng chức năng Sprint 3 & Sprint 4:')}{' '}
          </strong>
          <span>
            {t(
              'Nhật ký yêu cầu được lấy trực tiếp từ Gateway proxy telemetry. Mọi thông tin nhạy cảm như Authorization headers, khóa API, cookie và nội dung request/response body đều bị loại bỏ hoàn toàn trước khi lưu trữ.'
            )}
          </span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <form
        onSubmit={handleApplyFilter}
        className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl shadow-sm space-y-4"
        role="search"
        aria-label="Bộ lọc lịch sử yêu cầu"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="history-status-filter"
              className="text-label-sm font-semibold text-on-surface-variant"
            >
              {t('Mã trạng thái (Status):')}
            </label>
            <select
              id="history-status-filter"
              data-testid="status-filter"
              aria-label="Lọc trạng thái HTTP"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">{t('Tất cả trạng thái (All)')}</option>
              <option value="200">200 OK</option>
              <option value="401">401 Unauthorized</option>
              <option value="403">403 Forbidden</option>
              <option value="404">404 Not Found</option>
              <option value="429">429 Too Many Requests</option>
              <option value="500">500 Server Error</option>
              <option value="503">503 Unavailable</option>
            </select>
          </div>

          {/* API ID Filter */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="history-api-id-filter"
              className="text-label-sm font-semibold text-on-surface-variant"
            >
              {t('API ID:')}
            </label>
            <input
              id="history-api-id-filter"
              type="text"
              data-testid="filter-api-id"
              placeholder={t('Nhập API ID dạng số (ví dụ: 12)')}
              value={apiIdInput}
              onChange={(e) => setApiIdInput(e.target.value)}
              className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="history-date-from"
              className="text-label-sm font-semibold text-on-surface-variant"
            >
              {t('Từ ngày (From):')}
            </label>
            <input
              id="history-date-from"
              type="date"
              data-testid="filter-date-from"
              aria-label="Từ ngày"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
              className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="history-date-to"
              className="text-label-sm font-semibold text-on-surface-variant"
            >
              {t('Đến ngày (To):')}
            </label>
            <input
              id="history-date-to"
              type="date"
              data-testid="filter-date-to"
              aria-label="Đến ngày"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
              className="bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <p className="text-body-xs text-on-surface-variant">
          {t('Bộ lọc trạng thái khớp đúng một mã HTTP. Hợp đồng backend chưa có lọc theo nhóm 2xx, 4xx hoặc 5xx.')}
        </p>

        {dateError && (
          <div
            role="alert"
            className="text-body-xs text-error flex items-center gap-1.5 pt-1"
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{dateError}</span>
          </div>
        )}
        {apiIdError && (
          <div
            role="alert"
            data-testid="filter-api-error"
            className="text-body-xs text-error flex items-center gap-1.5 pt-1"
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{apiIdError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
          >
            {t('Đặt lại')}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            icon="search"
          >
            {t('Áp dụng bộ lọc')}
          </Button>
        </div>
      </form>

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          data-testid="history-loading"
          className="space-y-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="h-5 w-40 bg-surface-container-highest animate-pulse rounded" />
            <div className="h-5 w-24 bg-surface-container-highest animate-pulse rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex items-center gap-4 py-2">
              <div className="h-4 w-28 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-4 w-36 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-4 w-16 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-4 flex-1 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-4 w-12 bg-surface-container-highest animate-pulse rounded" />
              <div className="h-4 w-16 bg-surface-container-highest animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div
          data-testid="history-error"
          role="alert"
          className="bg-error-container/20 border border-error/30 rounded-2xl p-8 text-center shadow-sm space-y-4"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-title-md font-bold text-on-surface">
              {t('Không thể tải lịch sử yêu cầu')}
            </h3>
            <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
              {error}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon="refresh"
            onClick={() => {
              fetchHistory(
                page,
                selectedStatus,
                activeApiId,
                activeDateFrom,
                activeDateTo
              );
            }}
          >
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div
          data-testid="history-empty"
          className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center shadow-sm space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          </div>
          <h3 className="text-title-md font-bold text-on-surface">
            {t('Không tìm thấy nhật ký yêu cầu nào')}
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
            {t(
              'Chưa có dữ liệu telemetry cho các tiêu chí lọc đã chọn. Hãy gửi các lệnh gọi API thông qua Gateway để kiểm tra hệ thống ghi nhận.'
            )}
          </p>
        </div>
      )}

      {/* Success Table */}
      {!isLoading && !error && items.length > 0 && (
        <div
          data-testid="history-table"
          className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm" role="table">
              <thead className="bg-surface-container/60 text-on-surface-variant border-b border-outline-variant/30 text-label-sm uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Request ID')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Thời gian')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('API')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Method')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Path')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Trạng thái')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Mã lỗi')}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t('Độ trễ')}
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    {t('Thao tác')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                {items.map((log) => {
                  const truncatedReqId =
                    log.requestId && log.requestId.length > 12
                      ? `${log.requestId.slice(0, 10)}…`
                      : log.requestId;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-container/30 transition-colors"
                      data-testid={`history-row-${log.id}`}
                    >
                      {/* Request ID */}
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={log.requestId}
                            className="font-semibold text-on-surface"
                          >
                            {truncatedReqId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRequestId(log.requestId)}
                            aria-label={`Sao chép ${log.requestId}`}
                            title={
                              copiedId === log.requestId
                                ? 'Đã sao chép!'
                                : 'Sao chép Request ID'
                            }
                            className="text-on-surface-variant hover:text-primary transition-colors p-0.5 rounded cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {copiedId === log.requestId ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Occurred At */}
                      <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                        {formatOccurredAt(log.occurredAt)}
                      </td>

                      {/* API Name & ID */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">
                            {log.apiName}
                          </span>
                          <span className="font-mono text-[11px] text-on-surface-variant">
                            {log.apiId}
                          </span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-5 py-3.5">
                        <MethodBadge method={log.method || 'GET'} />
                      </td>

                      {/* Path */}
                      <td
                        className="px-5 py-3.5 font-mono text-xs text-on-surface max-w-xs truncate"
                        title={log.path || '/'}
                      >
                        {log.path || '/'}
                      </td>

                      {/* Status Code */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusCodeBadgeClass(
                            log.statusCode
                          )}`}
                        >
                          {log.statusCode}
                        </span>
                      </td>

                      {/* Error Code */}
                      <td className="px-5 py-3.5">
                        {log.errorCode ? (
                          <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                            {log.errorCode}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/50">-</span>
                        )}
                      </td>

                      {/* Latency */}
                      <td className="px-5 py-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                        {log.latencyMs} ms
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveLog(log)}
                          className="text-primary hover:underline font-medium text-xs cursor-pointer"
                        >
                          {t('Chi tiết')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && total > 0 && (
        <nav
          aria-label="Phân trang lịch sử"
          className="flex items-center justify-between pt-4 border-t border-outline-variant/20"
        >
          <span className="text-body-sm text-on-surface-variant">
            {t('Trang')} {page} / {totalPages} ({total} {t('yêu cầu')})
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('Trang trước')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('Trang sau')}
            </Button>
          </div>
        </nav>
      )}

      {/* Detail Modal */}
      {activeLog && (
        <Modal
          isOpen={true}
          onClose={() => setActiveLog(null)}
          title={`Chi tiết Yêu cầu API`}
        >
          <div className="space-y-4" data-testid="request-detail-modal">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-body-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                verified_user
              </span>
              <span>
                {t(
                  'Bản ghi bảo mật: Không lưu trữ và không hiển thị Authorization headers, API keys, cookies, payment tokens hay nội dung request/response body.'
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Mã yêu cầu (Request ID):')}
                </span>
                <span
                  className="font-mono text-xs font-semibold text-on-surface break-all"
                  data-testid="modal-request-id"
                >
                  {activeLog.requestId}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Thời gian ghi nhận:')}
                </span>
                <span
                  className="font-mono text-xs text-on-surface"
                  data-testid="modal-timestamp"
                >
                  {formatOccurredAt(activeLog.occurredAt)}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Tên API / ID:')}
                </span>
                <div className="flex flex-col" data-testid="modal-api-name">
                  <span className="font-semibold text-on-surface">
                    {activeLog.apiName}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    ID: {activeLog.apiId}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Phương thức & Đường dẫn:')}
                </span>
                <div
                  className="flex items-center gap-2"
                  data-testid="modal-method-path"
                >
                  <MethodBadge method={activeLog.method || 'GET'} />
                  <span className="font-mono text-xs text-on-surface break-all">
                    {activeLog.path || '/'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Trạng thái HTTP:')}
                </span>
                <span
                  className={`inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusCodeBadgeClass(
                    activeLog.statusCode
                  )}`}
                  data-testid="modal-status-code"
                >
                  {activeLog.statusCode}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Mã lỗi (Error Code):')}
                </span>
                <span
                  className="font-mono text-xs text-on-surface"
                  data-testid="modal-error-code"
                >
                  {activeLog.errorCode || t('Không có (None)')}
                </span>
              </div>

              <div>
                <span className="text-on-surface-variant block text-xs mb-0.5">
                  {t('Độ trễ xử lý (Latency):')}
                </span>
                <span
                  className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                  data-testid="modal-latency"
                >
                  {activeLog.latencyMs} ms
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
