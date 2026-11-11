import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { useOptionalAuth } from '../../context/AuthContext';
import {
  getCostGuardSummary,
  updateCostGuardBudget,
  validateBudgetAmount,
  type CostGuardSummary,
  type CostGuardCurrencyBudget,
} from '../../services/costGuardApi';
import { formatCurrencyAmount, parseSafeBigInt } from '../../services/sprint4Types';
import { ApiError } from '../../services/authApi';

export const CostGuardPage: React.FC = () => {
  const { t } = useLanguage();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const auth = useOptionalAuth();
  const currentUser = auth?.currentUser;

  const [summary, setSummary] = useState<CostGuardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [budgetInput, setBudgetInput] = useState<string>('');
  const [hardCutoffInput, setHardCutoffInput] = useState<boolean>(true);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeFetchControllerRef = useRef<AbortController | null>(null);
  const activeSaveControllerRef = useRef<AbortController | null>(null);
  const latestFetchRequestIdRef = useRef<number>(0);
  const selectedCurrencyRef = useRef<string>(selectedCurrency);

  useEffect(() => {
    selectedCurrencyRef.current = selectedCurrency;
  }, [selectedCurrency]);

  // Always ensure USD and VND are available, preserving any other backend currencies
  const availableCurrencies = useMemo(() => {
    const defaults = ['USD', 'VND'];
    if (!summary || summary.currencies.length === 0) {
      return defaults;
    }
    const backendCurrencies = summary.currencies.map((c) => c.currency);
    return Array.from(new Set([...defaults, ...backendCurrencies]));
  }, [summary]);

  const currentCurrencyBudget: CostGuardCurrencyBudget | undefined = useMemo(() => {
    return summary?.currencies.find((c) => c.currency === selectedCurrency);
  }, [summary, selectedCurrency]);

  // Sync form inputs when selectedCurrency or summary changes
  useEffect(() => {
    if (currentCurrencyBudget) {
      setBudgetInput(currentCurrencyBudget.monthlyBudget ?? '');
      setHardCutoffInput(currentCurrencyBudget.hardCutoff ?? false);
    } else {
      setBudgetInput('');
      setHardCutoffInput(false);
    }
  }, [selectedCurrency, currentCurrencyBudget]);

  const fetchSummary = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++latestFetchRequestIdRef.current;
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getCostGuardSummary(signal);
        if (signal?.aborted || requestId !== latestFetchRequestIdRef.current) return;
        setSummary(data);
      } catch (err: unknown) {
        if (signal?.aborted || requestId !== latestFetchRequestIdRef.current) return;
        if (err instanceof ApiError) {
          setLoadError(err.message || tRef.current('Lỗi kết nối máy chủ'));
        } else if (err instanceof Error) {
          setLoadError(err.message);
        } else {
          setLoadError(tRef.current('Không thể tải dữ liệu Cost Guard'));
        }
      } finally {
        if (!signal?.aborted && requestId === latestFetchRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Trigger fetch on mount/user switch and ensure full account isolation
  useEffect(() => {
    activeFetchControllerRef.current?.abort();
    activeSaveControllerRef.current?.abort();

    setSummary(null);
    setLoadError(null);
    setValidationError(null);
    setSaveError(null);
    setSaveSuccess(null);
    setSelectedCurrency('USD');
    setBudgetInput('');
    setHardCutoffInput(false);

    const controller = new AbortController();
    activeFetchControllerRef.current = controller;
    fetchSummary(controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentUser?.id, fetchSummary]);

  const handleRetry = useCallback(() => {
    activeFetchControllerRef.current?.abort();
    const controller = new AbortController();
    activeFetchControllerRef.current = controller;
    fetchSummary(controller.signal);
  }, [fetchSummary]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSaveError(null);
    setSaveSuccess(null);

    const err = validateBudgetAmount(budgetInput);
    if (err) {
      setValidationError(err);
      return;
    }

    const currencyToSave = selectedCurrency;
    const savingUserId = currentUser?.id;

    activeSaveControllerRef.current?.abort();
    const saveController = new AbortController();
    activeSaveControllerRef.current = saveController;

    setIsSaving(true);
    try {
      const updated = await updateCostGuardBudget(
        {
          currency: currencyToSave,
          monthlyBudget: budgetInput.trim(),
          hardCutoff: hardCutoffInput,
        },
        saveController.signal
      );

      if (saveController.signal.aborted || (savingUserId && savingUserId !== currentUser?.id)) {
        return;
      }

      setSummary(updated);
      if (selectedCurrencyRef.current === currencyToSave) {
        setSaveSuccess(t('Cập nhật ngân sách thành công!'));
      }
    } catch (err: unknown) {
      if (saveController.signal.aborted || (savingUserId && savingUserId !== currentUser?.id)) {
        return;
      }
      if (err instanceof ApiError) {
        setSaveError(err.message || t('Lỗi lưu ngân sách từ máy chủ.'));
      } else if (err instanceof Error) {
        setSaveError(err.message);
      } else {
        setSaveError(t('Không thể lưu ngân sách. Vui lòng thử lại.'));
      }
    } finally {
      if (!saveController.signal.aborted && (!savingUserId || savingUserId === currentUser?.id)) {
        setIsSaving(false);
      }
    }
  };

  const spentPercent = currentCurrencyBudget?.spentPercent ?? null;
  const reachedThresholds = currentCurrencyBudget?.reachedThresholds ?? [];
  const hasBudget = Boolean(currentCurrencyBudget?.monthlyBudget);
  const unpricedCount = parseSafeBigInt(summary?.unpricedRequests ?? '0');

  // Cap progress visual width at 100% while displaying actual percent
  const visualProgressWidth = Math.min(100, Math.max(0, spentPercent ?? 0));
  const ariaValueNow = Math.min(100, Math.max(0, spentPercent ?? 0));
  const ariaValueText = spentPercent !== null ? `${spentPercent}%` : t('Chưa có ngân sách');

  const progressColorClass = useMemo(() => {
    if (spentPercent === null) return 'bg-outline-variant/40';
    if (spentPercent >= 100) return 'bg-error';
    if (spentPercent >= 80) return 'bg-amber-500';
    if (spentPercent >= 50) return 'bg-yellow-500';
    return 'bg-emerald-600';
  }, [spentPercent]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('API Cost Guard & Giám Sát Ngân Sách')}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t('Thiết lập hạn mức chi tiêu hàng tháng, ngắt tự động chống chi phí phát sinh bất thường.')}
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/30 text-body-sm text-on-surface-variant font-code-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
            <span>{`${summary.periodStart} → ${summary.periodEndExclusive} (UTC)`}</span>
          </div>
        )}
      </div>

      {/* Unpriced Requests Alert if legacy data exists */}
      {unpricedCount > 0n && (
        <div
          role="status"
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-amber-600 text-[22px] mt-0.5">info</span>
          <div>
            <h4 className="text-body-md font-bold text-on-surface">
              {t('Thông tin bản ghi lịch sử')}
            </h4>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {t(
                `Có ${unpricedCount.toLocaleString()} request từ các phiên bản trước chưa được định giá và không tính vào chi phí ước tính tháng này.`
              )}
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="cost-guard-skeleton" className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-surface-container rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-surface-container rounded-2xl" />
        </div>
      )}

      {/* Error State with Retry */}
      {!isLoading && loadError && (
        <div
          role="alert"
          className="p-6 rounded-2xl bg-error-container/20 border border-error/30 text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-container text-on-error-container">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {t('Không thể tải dữ liệu Cost Guard')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1">{loadError}</p>
          </div>
          <Button variant="primary" onClick={handleRetry}>
            <span className="material-symbols-outlined text-[18px] mr-1.5">refresh</span>
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !loadError && (
        <div className="space-y-8">
          {/* Currency Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <label htmlFor="currency-select" className="text-body-sm font-semibold text-on-surface">
                {t('Đơn vị tiền tệ:')}
              </label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  setValidationError(null);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
                className="bg-surface-container rounded-lg border border-outline-variant/40 px-3 py-1.5 text-body-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
              >
                {availableCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-body-sm text-on-surface-variant">
              {hasBudget ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  {t('Đã kích hoạt Cost Guard')}
                </span>
              ) : (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  {t('Chưa thiết lập ngân sách')}
                </span>
              )}
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Monthly Budget */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Ngân sách tháng')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {hasBudget && currentCurrencyBudget?.monthlyBudget
                  ? formatCurrencyAmount(currentCurrencyBudget.monthlyBudget, selectedCurrency)
                  : t('Chưa thiết lập')}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {hasBudget ? t('Hạn mức chi tiêu tối đa') : t('Vui lòng nhập ngân sách bên dưới')}
              </span>
            </div>

            {/* Estimated Spend */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Ước tính đã dùng (UTC)')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {formatCurrencyAmount(currentCurrencyBudget?.estimatedSpend ?? '0.00', selectedCurrency)}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {t('Cộng dồn từ request thực tế')}
              </span>
            </div>

            {/* Spent Percent */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Tỷ lệ sử dụng')}
              </span>
              <div className="text-headline-sm font-bold text-on-surface font-code-md my-1">
                {spentPercent !== null ? `${spentPercent}%` : '—'}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {spentPercent !== null && spentPercent >= 100
                  ? t('Vượt ngân sách')
                  : t('So với hạn mức tháng')}
              </span>
            </div>

            {/* Hard Cutoff Policy */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Cơ chế ngắt cứng (Hard Cutoff)')}
              </span>
              <div className="text-title-md font-bold text-on-surface my-1 flex items-center gap-1.5">
                {currentCurrencyBudget?.hardCutoff ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    {t('Đang BẬT')}
                  </span>
                ) : (
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    {t('Đang TẮT')}
                  </span>
                )}
              </div>
              <span className="text-body-xs text-on-surface-variant block mt-1">
                {currentCurrencyBudget?.hardCutoff
                  ? t('Chặn 429 BUDGET_EXHAUSTED khi chạm trần')
                  : t('Chỉ gửi cảnh báo, không chặn request')}
              </span>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">trending_up</span>
                <h3 className="text-title-md font-bold text-on-surface">
                  {t('Tiến độ chi tiêu tháng hiện tại')}
                </h3>
              </div>
              <div className="text-body-sm font-bold font-code-md text-on-surface">
                {spentPercent !== null ? (
                  <span>
                    {spentPercent}%{' '}
                    {spentPercent >= 100 && (
                      <span className="text-error font-semibold">({t('Đã chạm hoặc vượt ngân sách')})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-on-surface-variant font-normal">
                    {t('Chưa có ngân sách để tính tỷ lệ')}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden border border-outline-variant/20 relative">
              <div
                role="progressbar"
                aria-valuenow={ariaValueNow}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={ariaValueText}
                aria-label={t('Tỷ lệ sử dụng ngân sách')}
                className={`h-full transition-all duration-300 ${progressColorClass}`}
                style={{ width: `${visualProgressWidth}%` }}
              />
            </div>

            {/* Threshold Markers Legend */}
            <div className="flex justify-between text-body-xs text-on-surface-variant pt-1 px-0.5">
              <span>0%</span>
              <span className={reachedThresholds.includes(50) ? 'text-amber-600 font-bold' : ''}>
                50% {reachedThresholds.includes(50) && '✓'}
              </span>
              <span className={reachedThresholds.includes(80) ? 'text-amber-600 font-bold' : ''}>
                80% {reachedThresholds.includes(80) && '✓'}
              </span>
              <span className={reachedThresholds.includes(100) ? 'text-error font-bold' : ''}>
                100% {reachedThresholds.includes(100) && '✓'}
              </span>
            </div>
          </div>

          {/* Form & Warning Stream Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Cấu Hình (Left 2 cols) */}
            <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                  {t('Cấu hình hạn mức')}
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {t('Thiết lập ngân sách tháng cho đồng tiền')} <strong className="text-on-surface">{selectedCurrency}</strong>.
                </p>
              </div>

              <form data-testid="cost-guard-form" onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label htmlFor="monthly-budget-input" className="text-body-sm font-medium text-on-surface block mb-1">
                    {t('Hạn mức ngân sách tháng')} ({selectedCurrency})
                  </label>
                  <div className="flex items-center bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary">
                    <span className="text-body-md text-on-surface-variant font-bold mr-2">
                      {selectedCurrency}
                    </span>
                    <input
                      id="monthly-budget-input"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 50.00"
                      value={budgetInput}
                      onChange={(e) => {
                        setBudgetInput(e.target.value);
                        setValidationError(null);
                      }}
                      disabled={isSaving}
                      className="w-full bg-transparent text-body-md font-bold text-on-surface outline-none"
                    />
                  </div>
                  <span className="text-body-xs text-on-surface-variant block mt-1">
                    {t('Số dương, tối đa 2 chữ số thập phân (ví dụ: 30.00).')}
                  </span>
                </div>

                {/* Hard Cutoff Checkbox */}
                <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hard-cutoff-toggle"
                    checked={hardCutoffInput}
                    onChange={(e) => setHardCutoffInput(e.target.checked)}
                    disabled={isSaving}
                    className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="hard-cutoff-toggle" className="cursor-pointer select-none text-body-sm">
                    <strong className="text-on-surface font-semibold block">
                      {t('Kích hoạt ngắt cứng (Hard Cutoff)')}
                    </strong>
                    <span className="text-on-surface-variant text-body-xs block mt-0.5">
                      {t(
                        'Khi chi tiêu chạm hoặc dự kiến vượt ngân sách, Gateway từ chối request trả phí với mã lỗi HTTP 429 BUDGET_EXHAUSTED.'
                      )}
                    </span>
                  </label>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div role="alert" className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error text-body-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Server Error Message */}
                {saveError && (
                  <div role="alert" className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error text-body-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Save Success Message */}
                {saveSuccess && (
                  <div role="status" className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-body-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{saveSuccess}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      {t('Đang lưu...')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {t('Lưu hạn mức')}
                    </span>
                  )}
                </Button>
              </form>

              {/* Sandbox info card */}
              <div className="pt-4 border-t border-outline-variant/30">
                <span className="text-label-md font-semibold text-on-surface-variant block mb-1">
                  {t('Chi phí thử nghiệm Sandbox (Quyết toán riêng)')}
                </span>
                <p className="text-body-sm font-bold text-on-surface font-code-md">
                  {formatCurrencyAmount(currentCurrencyBudget?.settledSandboxCharges ?? '0.00', selectedCurrency)}
                </p>
                <p className="text-body-xs text-on-surface-variant mt-0.5">
                  {t('Giao dịch sandbox không bị trừ vào ngân sách API Gateway chính thức.')}
                </p>
              </div>
            </div>

            {/* Warning State & Policy Details (Right 3 cols) */}
            <div className="lg:col-span-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">notifications_active</span>
                  {t('Trạng thái cảnh báo & Ngưỡng chi tiêu')}
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {t('Hệ thống kiểm tra trực tiếp từ dữ liệu backend (không dùng thông báo ảo hay email chưa kích hoạt).')}
                </p>
              </div>

              {/* Thresholds Cards */}
              <div className="space-y-3">
                {/* 50% Threshold */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    reachedThresholds.includes(50)
                      ? 'bg-amber-500/10 border-amber-500/40 text-on-surface'
                      : 'bg-surface-container/50 border-outline-variant/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          reachedThresholds.includes(50) ? 'text-amber-600' : 'text-on-surface-variant'
                        }`}
                      >
                        {reachedThresholds.includes(50) ? 'warning' : 'radio_button_unchecked'}
                      </span>
                      <strong className="text-body-md font-semibold">
                        {t('Cảnh báo cấp 1: Chạm mốc 50%')}
                      </strong>
                    </div>
                    {reachedThresholds.includes(50) && (
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-700">
                        {t('Đã kích hoạt')}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {reachedThresholds.includes(50)
                      ? t('Chi tiêu thực tế đã vượt 50% hạn mức tháng. Đây là cảnh báo thông tin.')
                      : t('Chưa kích hoạt. Ngưỡng này sẽ bật khi chi tiêu đạt từ 50% ngân sách.')}
                  </p>
                </div>

                {/* 80% Threshold */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    reachedThresholds.includes(80)
                      ? 'bg-amber-500/15 border-amber-500/50 text-on-surface'
                      : 'bg-surface-container/50 border-outline-variant/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          reachedThresholds.includes(80) ? 'text-amber-600' : 'text-on-surface-variant'
                        }`}
                      >
                        {reachedThresholds.includes(80) ? 'warning' : 'radio_button_unchecked'}
                      </span>
                      <strong className="text-body-md font-semibold">
                        {t('Cảnh báo cấp 2: Chạm mốc 80% (Mức cao)')}
                      </strong>
                    </div>
                    {reachedThresholds.includes(80) && (
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-700">
                        {t('Đã kích hoạt')}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {reachedThresholds.includes(80)
                      ? t('Chi tiêu đã đạt từ 80% hạn mức. Vui lòng rà soát lưu lượng API để tránh gián đoạn.')
                      : t('Chưa kích hoạt. Ngưỡng này sẽ bật khi chi tiêu đạt từ 80% ngân sách.')}
                  </p>
                </div>

                {/* 100% Threshold */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    reachedThresholds.includes(100)
                      ? 'bg-error-container/20 border-error/50 text-on-surface'
                      : 'bg-surface-container/50 border-outline-variant/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          reachedThresholds.includes(100) ? 'text-error' : 'text-on-surface-variant'
                        }`}
                      >
                        {reachedThresholds.includes(100) ? 'report' : 'radio_button_unchecked'}
                      </span>
                      <strong className="text-body-md font-semibold">
                        {t('Cảnh báo cấp 3: Chạm hoặc vượt 100%')}
                      </strong>
                    </div>
                    {reachedThresholds.includes(100) && (
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-error-container text-on-error-container">
                        {t('Đã chạm trần')}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {reachedThresholds.includes(100) ? (
                      currentCurrencyBudget?.hardCutoff ? (
                        <span className="text-error font-medium">
                          {t(
                            'Ngân sách đã cạn! Chế độ ngắt cứng đang BẬT: Gateway từ chối request trả phí với HTTP 429 BUDGET_EXHAUSTED.'
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          {t(
                            'Ngân sách đã cạn! Chế độ ngắt cứng đang TẮT: Gateway tiếp tục xử lý request và chi phí có thể vượt hạn mức.'
                          )}
                        </span>
                      )
                    ) : (
                      t('Chưa kích hoạt. Ngân sách vẫn còn khả dụng.')
                    )}
                  </p>
                </div>
              </div>

              {/* Policy Explanation */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
                <h4 className="text-body-md font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">policy</span>
                  {t('Nguyên tắc hoạt động Gateway')}
                </h4>
                <ul className="text-body-xs text-on-surface-variant space-y-1 list-disc list-inside">
                  <li>
                    {t('Gói Free (0 USD) và request thử nghiệm Sandbox luôn được miễn trừ khỏi kiểm tra Cost Guard.')}
                  </li>
                  <li>
                    {t('Mỗi request trả phí thành công được tính chi phí dựa trên đơn giá gói đăng ký.')}
                  </li>
                  <li>
                    {t('Khi kích hoạt Hard Cutoff, Gateway từ chối request mới nếu chi phí ước tính vượt quá ngân sách đã thiết lập.')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
