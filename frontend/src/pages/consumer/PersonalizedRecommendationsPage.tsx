/* oxlint-disable react/only-export-components, react/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useOptionalAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { canUseConsumerWorkspace } from '../../components/auth/workspaceRole';
import { ApiError } from '../../services/authApi';
import { formatPrice } from '../../services/marketplaceApi';
import { formatBigIntCount } from '../../services/sprint4Types';
import {
  getPersonalizedRecommendations,
  updateRecommendationPreferences,
  submitRecommendationAction,
  executeRecommendationSwitch,
  type PriorityMode,
  type MigrationMode,
  type RecommendationStatusFilter,
  type RecommendationListResponse,
  type PersonalizedRecommendationItem,
  type RecommendationPreferencesInput,
} from '../../services/recommendationsApi';

type ViewTab = 'active' | 'deals' | 'saved' | 'snoozed' | 'dismissed' | 'switched';

const PRIORITY_OPTIONS: Array<{ value: PriorityMode; label: string; icon: string; hint: string }> = [
  { value: 'balanced', label: 'Cân bằng (Chi phí & Chất lượng)', icon: 'balance', hint: 'Kết hợp tiết kiệm chi phí, deal ưu đãi và cải thiện độ trễ.' },
  { value: 'cost_saving', label: 'Ưu tiên Giá rẻ & Deal', icon: 'savings', hint: 'Đưa các API có giá thấp hơn và khuyến mãi mạnh lên đầu.' },
  { value: 'high_quality', label: 'Ưu tiên Chất lượng & Độ trễ', icon: 'speed', hint: 'Tập trung vào tốc độ phản hồi nhanh và SLA ổn định.' },
  { value: 'deals_only', label: 'Chỉ hiển thị Đang có Deal', icon: 'local_offer', hint: 'Chỉ lọc các API có chương trình giảm giá hoặc ưu đãi chuyển đổi.' },
];

const DISMISS_REASON_PRESETS = [
  'Đang hài lòng với API hiện tại',
  'Chi phí chuyển đổi tích hợp code cao',
  'Mức tiết kiệm chưa đủ hấp dẫn',
  'Đang chờ hết chu kỳ gói hiện tại',
];

export function mapRecommendationError(err: unknown, defaultMsg = 'Không thể tải đề xuất cá nhân hóa.'): string {
  if (err instanceof ApiError) {
    if (err.code === 'SUBSCRIPTION_PERIOD_LOCKED' || err.message.includes('SUBSCRIPTION_PERIOD_LOCKED')) {
      return 'Gói hiện tại đã hủy và có phát sinh sử dụng trong kỳ, không thể đăng ký lại cho đến khi hết kỳ.';
    }
    if (err.code === 'SUBSCRIPTION_ALREADY_EXISTS' || err.message.includes('SUBSCRIPTION_ALREADY_EXISTS')) {
      return 'Bạn đã có gói đăng ký đang hoạt động hoặc chờ thanh toán cho API mục tiêu này.';
    }
    if (err.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (err.status === 403) return 'Tài khoản của bạn không có quyền truy cập khu vực Consumer.';
    if (err.status >= 500) return 'Lỗi máy chủ (500). Vui lòng thử lại sau.';
    return err.message || defaultMsg;
  }
  if (err instanceof Error) return err.message || defaultMsg;
  return defaultMsg;
}

export const PersonalizedRecommendationsPage: React.FC = () => {
  const auth = useOptionalAuth();
  const userId = auth === undefined ? '__standalone__' : (auth?.currentUser?.id ?? null);
  const workspaceRole = auth?.currentUser?.role;
  const consumerAllowed = canUseConsumerWorkspace(workspaceRole);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSourceApiId = searchParams.get('sourceApiId') ?? '';
  const [selectedSourceApiId, setSelectedSourceApiId] = useState<string>(initialSourceApiId);
  const [activeTab, setActiveTab] = useState<ViewTab>('active');
  const [priorityOverride, setPriorityOverride] = useState<PriorityMode | undefined>(undefined);

  const [state, setState] = useState<{
    ownerId: string | number | null | undefined;
    data: RecommendationListResponse | null;
    error: string | null;
  }>({
    ownerId: userId,
    data: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  // Modals state
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsForm, setPrefsForm] = useState<RecommendationPreferencesInput>({
    priorityMode: 'balanced',
    minUsageDays: 3,
    minSavingsPercent: 5,
    onlyVerifiedProviders: false,
    onlyActiveDeals: false,
    autoNotifyDeals: true,
    preferredMigrationMode: 'cancel_at_period_end',
  });
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const [switchItem, setSwitchItem] = useState<PersonalizedRecommendationItem | null>(null);
  const [switchPlanId, setSwitchPlanId] = useState<string>('');
  const [switchMigrationMode, setSwitchMigrationMode] = useState<MigrationMode>('cancel_at_period_end');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const [compareItem, setCompareItem] = useState<PersonalizedRecommendationItem | null>(null);

  const [dismissItem, setDismissItem] = useState<PersonalizedRecommendationItem | null>(null);
  const [dismissReason, setDismissReason] = useState<string>(DISMISS_REASON_PRESETS[0]);
  const [isDismissing, setIsDismissing] = useState(false);

  const [snoozeOpenForId, setSnoozeOpenForId] = useState<string | null>(null);

  // Render guard for account switch isolation
  const isOwner = Boolean(userId && state.ownerId === userId);
  const data = isOwner ? state.data : null;
  const loadError = isOwner ? state.error : null;

  const backendStatus: RecommendationStatusFilter = useMemo(() => {
    if (activeTab === 'deals') return 'active';
    return activeTab;
  }, [activeTab]);

  const fetchRecommendations = useCallback(
    async (signal?: AbortSignal) => {
      if (!consumerAllowed || !userId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setActionError(null);
      try {
        const res = await getPersonalizedRecommendations(
          {
            sourceApiId: selectedSourceApiId || undefined,
            status: backendStatus,
            priorityMode: priorityOverride,
          },
          signal,
        );
        if (signal?.aborted) return;
        setState({ ownerId: userId, data: res, error: null });
        setPrefsForm({
          priorityMode: res.preferences.priorityMode,
          minUsageDays: res.preferences.minUsageDays,
          minSavingsPercent: res.preferences.minSavingsPercent,
          onlyVerifiedProviders: res.preferences.onlyVerifiedProviders,
          onlyActiveDeals: res.preferences.onlyActiveDeals,
          autoNotifyDeals: res.preferences.autoNotifyDeals,
          preferredMigrationMode: res.preferences.preferredMigrationMode,
        });
      } catch (err) {
        if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) return;
        setState({
          ownerId: userId,
          data: null,
          error: mapRecommendationError(err),
        });
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [consumerAllowed, userId, selectedSourceApiId, backendStatus, priorityOverride],
  );

  useEffect(() => {
    const controller = new AbortController();
    setState({ ownerId: userId, data: null, error: null });
    fetchRecommendations(controller.signal);
    return () => controller.abort();
  }, [fetchRecommendations, userId]);

  const handleSelectSourceFilter = (apiId: string) => {
    setSelectedSourceApiId(apiId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (apiId) next.set('sourceApiId', apiId);
      else next.delete('sourceApiId');
      return next;
    });
  };

  const handleAction = async (
    item: PersonalizedRecommendationItem,
    action: 'saved' | 'snoozed' | 'dismissed' | 'restore',
    options?: { reason?: string; snoozeDays?: number },
  ) => {
    setBusyItemId(item.id);
    setActionError(null);
    setSnoozeOpenForId(null);
    try {
      await submitRecommendationAction({
        sourceApiId: item.sourceApi.id,
        recommendedApiId: item.recommendedApi.id,
        action,
        reason: options?.reason,
        snoozeDays: options?.snoozeDays,
      });

      const messages: Record<typeof action, string> = {
        saved: `Đã lưu đề xuất "${item.recommendedApi.name}" vào danh sách xem sau.`,
        snoozed: `Đã tạm ẩn "${item.recommendedApi.name}" trong ${options?.snoozeDays ?? 7} ngày.`,
        dismissed: `Đã bỏ qua đề xuất "${item.recommendedApi.name}".`,
        restore: `Đã khôi phục đề xuất "${item.recommendedApi.name}".`,
      };
      setFeedbackNotice(t(messages[action]));
      await fetchRecommendations();
    } catch (err) {
      setActionError(mapRecommendationError(err, 'Không thể cập nhật trạng thái đề xuất.'));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleOpenSwitch = (item: PersonalizedRecommendationItem) => {
    setSwitchItem(item);
    setSwitchPlanId(item.recommendedPlan.id);
    setSwitchMigrationMode(data?.preferences.preferredMigrationMode ?? 'cancel_at_period_end');
    setSwitchError(null);
  };

  const handleConfirmSwitch = async () => {
    if (!switchItem || !switchPlanId) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const res = await executeRecommendationSwitch({
        sourceApiId: switchItem.sourceApi.id,
        recommendedApiId: switchItem.recommendedApi.id,
        targetPlanId: switchPlanId,
        migrationMode: switchMigrationMode,
        sourceSubscriptionId: switchItem.sourceApi.currentSubscriptionId ?? undefined,
      });

      const targetApiId = switchItem.recommendedApi.id;
      const targetApiName = switchItem.recommendedApi.name;
      setSwitchItem(null);

      if (res.requiresCheckout) {
        navigate(`/checkout/${targetApiId}/${switchPlanId}`, {
          state: { resumeSubscriptionId: res.newSubscription.id },
        });
        return;
      }

      setFeedbackNotice(
        `Đã chuyển đổi thành công sang "${targetApiName}" (chế độ: ${switchMigrationMode}).`,
      );
      await fetchRecommendations();
    } catch (err) {
      setSwitchError(mapRecommendationError(err, 'Không thể thực hiện chuyển đổi gói API.'));
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setActionError(null);
    try {
      await updateRecommendationPreferences(prefsForm);
      setPriorityOverride(undefined);
      setPrefsOpen(false);
      setFeedbackNotice(t('Đã cập nhật tùy chọn đề xuất cá nhân hóa!'));
      await fetchRecommendations();
    } catch (err) {
      setActionError(mapRecommendationError(err, 'Không thể lưu tùy chọn đề xuất.'));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const displayedItems = useMemo(() => {
    const list = data?.items ?? [];
    if (activeTab === 'deals') {
      return list.filter((item) => item.comparison.hasActiveDeal);
    }
    return list;
  }, [data?.items, activeTab]);

  const effectiveMode = priorityOverride ?? data?.preferences.priorityMode ?? 'balanced';

  if (!consumerAllowed) {
    return (
      <div
        data-testid="consumer-role-guard"
        className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-10 text-center max-w-xl mx-auto"
      >
        <span className="material-symbols-outlined text-[40px] text-amber-600 mb-3 block">
          lock
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          {t('Khu vực dành cho Consumer & Provider')}
        </h2>
        <p className="text-body-md text-on-surface-variant">
          {t('Tính năng đề xuất API cá nhân hóa chỉ khả dụng cho tài khoản Consumer hoặc Provider mua API.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" icon="auto_awesome" size="sm">
              {t('Smart Cost & Quality Advisor')}
            </Badge>
            <span className="text-body-xs text-on-surface-variant font-mono">
              {t('Ngưỡng sử dụng:')}{' '}
              <strong>{data?.preferences.minUsageDays ?? prefsForm.minUsageDays} {t('ngày')}</strong>
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('Đề xuất API Cá nhân hóa')}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t('Tự động phân tích lịch sử sử dụng để gợi ý các API cùng loại có giá ưu đãi (Deal), chi phí tối ưu hoặc hiệu năng/độ ổn định vượt trội.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            icon="tune"
            onClick={() => setPrefsOpen(true)}
            data-testid="open-preferences-btn"
          >
            {t('Tùy chỉnh đề xuất')}
          </Button>
          <Button
            variant="secondary"
            icon="refresh"
            onClick={() => fetchRecommendations()}
            disabled={isLoading}
          >
            {t('Làm mới phân tích')}
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
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
            aria-label={t('Đóng thông báo')}
            className="p-1 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error-container/20 p-4 text-body-sm text-error flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label={t('Đóng cảnh báo')}
            className="p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div data-testid="recommendations-loading" className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-surface-container rounded-2xl" />
            ))}
          </div>
          <div className="h-56 bg-surface-container rounded-2xl" />
          <div className="h-56 bg-surface-container rounded-2xl" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <div
          role="alert"
          data-testid="recommendations-error"
          className="rounded-2xl border border-error/20 bg-error-container/10 p-8 text-center space-y-4 max-w-lg mx-auto"
        >
          <span className="material-symbols-outlined text-error text-[40px] block mx-auto">error</span>
          <p className="text-body-lg text-on-surface font-medium">{loadError}</p>
          <Button variant="primary" icon="refresh" onClick={() => fetchRecommendations()}>
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !loadError && data && (
        <>
          {/* Section 1: Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('API đã theo dõi')}
              </span>
              <div className="text-2xl font-extrabold text-on-surface font-code-md">
                {data.summary.totalSourceApisAnalyzed}
              </div>
              <span className="text-body-xs text-on-surface-variant mt-1 block">
                {data.summary.eligibleSourceApis} {t('API đủ thời gian sử dụng để tối ưu')}
              </span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Gợi ý phù hợp')}
              </span>
              <div className="text-2xl font-extrabold text-primary font-code-md">
                {displayedItems.length}
              </div>
              <span className="text-body-xs text-on-surface-variant mt-1 block">
                {t('Cùng danh mục & đáp ứng hạn mức')}
              </span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Deal ưu đãi đang mở')}
              </span>
              <div className="text-2xl font-extrabold text-amber-600 font-code-md">
                {data.summary.activeDealsCount}
              </div>
              <span className="text-body-xs text-on-surface-variant mt-1 block">
                {t('Khuyến mãi & giảm giá chuyển đổi')}
              </span>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">
                {t('Tiết kiệm dự kiến / tháng')}
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 font-code-md">
                {data.summary.potentialMonthlySavings.length > 0
                  ? data.summary.potentialMonthlySavings
                      .map((s) => formatPrice(s.amount, s.currency))
                      .join(' + ')
                  : formatPrice(0, 'VND')}
              </div>
              <span className="text-body-xs text-on-surface-variant mt-1 block">
                {data.summary.averageLatencyImprovementPercent !== null
                  ? `${t('Tốc độ cải thiện TB:')} +${data.summary.averageLatencyImprovementPercent}%`
                  : t('Theo dữ liệu chi phí thực tế')}
              </span>
            </div>
          </div>

          {/* Section 1B: Consumer Usage Insights Strip */}
          {data.usageInsights.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                    {t('Phân tích các API bạn đang sử dụng')}
                  </h2>
                  <p className="text-body-xs text-on-surface-variant">
                    {t('Nhấn vào một API để lọc các đề xuất thay thế dành riêng cho API đó.')}
                  </p>
                </div>
                {selectedSourceApiId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectSourceFilter('')}
                  >
                    {t('Xem tất cả API nguồn')}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.usageInsights.map((insight) => {
                  const isSelected = selectedSourceApiId === insight.apiId;
                  return (
                    <button
                      key={insight.apiId}
                      type="button"
                      data-testid={`usage-insight-${insight.apiId}`}
                      onClick={() =>
                        handleSelectSourceFilter(isSelected ? '' : insight.apiId)
                      }
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface-container hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-body-md text-on-surface">{insight.apiName}</div>
                          <div className="text-body-xs text-on-surface-variant mt-0.5">
                            {insight.category} • {insight.currentPlanName || t('Dùng theo lượt')}
                          </div>
                        </div>
                        <Badge variant={insight.meetsUsageTenureThreshold ? 'success' : 'warning'} size="sm">
                          {insight.daysUsed} {t('ngày')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-outline-variant/20 text-body-xs">
                        <div>
                          <span className="text-on-surface-variant block">{t('Giá hiện tại')}</span>
                          <strong className="text-on-surface">
                            {formatPrice(insight.currentPriceMonthly, insight.currency)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block">{t('Độ trễ TB')}</span>
                          <strong className="text-on-surface">
                            {insight.avgLatencyMs !== null ? `${insight.avgLatencyMs}ms` : '—'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block">{t('Lượt gọi')}</span>
                          <strong className="text-on-surface">
                            {insight.totalRequests.toLocaleString('vi-VN')}
                          </strong>
                        </div>
                      </div>
                      {!insight.meetsUsageTenureThreshold && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-2">
                          {t('Chưa đạt ngưỡng')} {data.preferences.minUsageDays} {t('ngày sử dụng. Có thể giảm ngưỡng trong "Tùy chỉnh đề xuất".')}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Priority Selector & Status Tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-sm font-semibold text-on-surface mr-1">
                {t('Mục tiêu ưu tiên:')}
              </span>
              {PRIORITY_OPTIONS.map((opt) => {
                const active = effectiveMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`priority-btn-${opt.value}`}
                    onClick={() => setPriorityOverride(opt.value)}
                    title={t(opt.hint)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-medium border transition-all cursor-pointer ${
                      active
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                    <span>{t(opt.label)}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 pb-3">
              {(
                [
                  { id: 'active', label: 'Đề xuất cho bạn', icon: 'auto_awesome' },
                  { id: 'deals', label: 'Đang có Deal ưu đãi', icon: 'local_offer' },
                  { id: 'saved', label: 'Đã lưu', icon: 'bookmark' },
                  { id: 'snoozed', label: 'Đã tạm ẩn', icon: 'snooze' },
                  { id: 'dismissed', label: 'Đã bỏ qua', icon: 'visibility_off' },
                  { id: 'switched', label: 'Đã chuyển đổi', icon: 'swap_horiz' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`rec-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-body-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{t(tab.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Recommendation Cards or Empty State */}
          {displayedItems.length === 0 ? (
            <div
              data-testid="recommendations-empty"
              className="bg-surface-container-low border border-dashed border-outline-variant/50 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[32px]">recommend</span>
              </div>
              <h3 className="text-title-lg font-bold text-on-surface">
                {activeTab === 'active'
                  ? t('Chưa có đề xuất nào khớp điều kiện hiện tại')
                  : t('Danh sách mục này đang trống')}
              </h3>
              <p className="text-body-md text-on-surface-variant">
                {data.summary.totalSourceApisAnalyzed === 0
                  ? t('Hãy đăng ký hoặc gọi thử một API trên Marketplace để hệ thống phân tích và tìm các lựa chọn giá rẻ hoặc chất lượng hơn cho bạn.')
                  : t('Bạn có thể chuyển tab, nới lỏng ngưỡng tiết kiệm / số ngày sử dụng trong phần Tùy chỉnh đề xuất, hoặc khám phá thêm API trên Marketplace.')}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button variant="outline" icon="tune" onClick={() => setPrefsOpen(true)}>
                  {t('Điều chỉnh bộ lọc đề xuất')}
                </Button>
                <Button variant="primary" icon="explore" onClick={() => navigate('/marketplace')}>
                  {t('Khám phá Marketplace')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" data-testid="recommendations-list">
              {displayedItems.map((item) => {
                const isBusy = busyItemId === item.id;
                const isSaved = item.userState.action === 'saved';
                const isRestorable =
                  item.userState.action === 'snoozed' || item.userState.action === 'dismissed';

                return (
                  <article
                    key={item.id}
                    data-testid={`recommendation-card-${item.recommendedApi.id}`}
                    className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-5 hover:border-primary/40 transition-colors"
                  >
                    {/* Context & Badges Row */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="primary" icon="auto_awesome" size="sm">
                            {t('Phù hợp')} {item.matchScore}/100
                          </Badge>
                          {item.comparison.hasActiveDeal && item.recommendedPlan.promotion && (
                            <Badge variant="warning" icon="local_offer" size="sm">
                              {item.recommendedPlan.promotion.badgeText}
                            </Badge>
                          )}
                          {item.recommendedApi.providerStatus === 'Verified' && (
                            <Badge variant="success" icon="verified" size="sm">
                              {t('Verified Provider')}
                            </Badge>
                          )}
                          {isSaved && (
                            <Badge variant="secondary" icon="bookmark" size="sm">
                              {t('Đã lưu')}
                            </Badge>
                          )}
                          {item.userState.action === 'switched' && (
                            <Badge variant="success" icon="check_circle" size="sm">
                              {t('Đã chuyển đổi')}
                            </Badge>
                          )}
                        </div>

                        <p className="text-body-sm text-on-surface-variant">
                          {t('Đề xuất thay thế / tối ưu cho')}{' '}
                          <strong className="text-on-surface">{item.sourceApi.name}</strong>{' '}
                          <span>
                            ({t('Đã dùng')} <strong>{item.sourceApi.daysUsed} {t('ngày')}</strong> •{' '}
                            <strong>{item.sourceApi.totalRequests.toLocaleString('vi-VN')}</strong> {t('lượt gọi')})
                          </span>
                        </p>

                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            to={`/api/${item.recommendedApi.id}`}
                            className="text-headline-sm font-bold text-on-surface hover:text-primary transition-colors"
                          >
                            {item.recommendedApi.name}
                          </Link>
                          <span className="text-body-xs text-on-surface-variant">
                            {t('bởi')} {item.recommendedApi.providerName}
                          </span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant max-w-3xl">
                          {item.recommendedApi.description}
                        </p>
                      </div>

                      {/* Price Highlight Block */}
                      <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30 min-w-[230px] text-left lg:text-right">
                        <span className="text-label-md uppercase font-semibold text-on-surface-variant block">
                          {t('Gói đề xuất:')} {item.recommendedPlan.name}
                        </span>
                        <div className="flex lg:justify-end items-baseline gap-2 mt-1">
                          {item.comparison.hasActiveDeal &&
                            item.comparison.originalPriceMonthly > item.comparison.effectivePriceMonthly && (
                              <span className="text-body-sm line-through text-on-surface-variant">
                                {formatPrice(item.comparison.originalPriceMonthly, item.comparison.currency)}
                              </span>
                            )}
                          <span className="text-2xl font-extrabold text-primary">
                            {formatPrice(item.comparison.effectivePriceMonthly, item.comparison.currency)}
                          </span>
                          <span className="text-body-xs text-on-surface-variant">/ {t('tháng')}</span>
                        </div>
                        {item.comparison.monthlySavingsAmount > 0 && (
                          <span className="inline-block mt-1.5 text-body-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                            {t('Tiết kiệm')} {formatPrice(item.comparison.monthlySavingsAmount, item.comparison.currency)} ({item.comparison.savingsPercent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-side Source vs Recommended Comparison Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-container-lowest/70 rounded-xl p-4 border border-outline-variant/20">
                      <div>
                        <span className="text-body-xs text-on-surface-variant block">
                          {t('Chi phí hàng tháng')}
                        </span>
                        <div className="text-body-md font-bold text-on-surface mt-0.5">
                          {formatPrice(item.sourceApi.currentPriceMonthly, item.sourceApi.currency)}{' '}
                          <span className="text-primary">→</span>{' '}
                          <span className="text-emerald-600">
                            {formatPrice(item.comparison.effectivePriceMonthly, item.comparison.currency)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-body-xs text-on-surface-variant block">
                          {t('Độ trễ trung bình')}
                        </span>
                        <div className="text-body-md font-bold text-on-surface mt-0.5">
                          {item.sourceApi.avgLatencyMs !== null ? `${item.sourceApi.avgLatencyMs}ms` : '—'}{' '}
                          <span className="text-primary">→</span>{' '}
                          <span className="text-emerald-600">
                            {item.comparison.candidateAvgLatencyMs !== null
                              ? `${item.comparison.candidateAvgLatencyMs}ms`
                              : '—'}
                          </span>
                          {item.comparison.latencyImprovementPercent !== null &&
                            item.comparison.latencyImprovementPercent > 0 && (
                              <span className="text-body-xs font-semibold text-emerald-600 ml-1">
                                (-{item.comparison.latencyImprovementPercent}%)
                              </span>
                            )}
                        </div>
                      </div>

                      <div>
                        <span className="text-body-xs text-on-surface-variant block">
                          {t('Tỷ lệ thành công (SLA)')}
                        </span>
                        <div className="text-body-md font-bold text-on-surface mt-0.5">
                          {item.sourceApi.successRatePercent !== null ? `${item.sourceApi.successRatePercent}%` : '—'}{' '}
                          <span className="text-primary">→</span>{' '}
                          <span className="text-emerald-600">
                            {item.comparison.candidateSuccessRatePercent !== null
                              ? `${item.comparison.candidateSuccessRatePercent}%`
                              : '—'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-body-xs text-on-surface-variant block">
                          {t('Hạn mức & Tốc độ')}
                        </span>
                        <div className="text-body-md font-bold text-on-surface mt-0.5">
                          {formatBigIntCount(String(item.recommendedPlan.quota))} {t('req/tháng')} •{' '}
                          {item.recommendedPlan.rateLimit} req/p
                        </div>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="space-y-2">
                      <span className="text-body-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        {t('Vì sao chúng tôi đề xuất API này cho bạn:')}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.reasons.map((reason) => (
                          <div
                            key={reason.code}
                            className="flex items-start gap-2 text-body-xs bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/20"
                          >
                            <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 shrink-0">
                              check_circle
                            </span>
                            <div>
                              <strong className="text-on-surface">{reason.label}: </strong>
                              <span className="text-on-surface-variant">{reason.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Options Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon="swap_horiz"
                          disabled={isBusy}
                          onClick={() => handleOpenSwitch(item)}
                          data-testid={`switch-btn-${item.recommendedApi.id}`}
                        >
                          {t('Chuyển sang API này')}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          icon="compare_arrows"
                          onClick={() => setCompareItem(item)}
                          data-testid={`compare-btn-${item.recommendedApi.id}`}
                        >
                          {t('So sánh chi tiết')}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon="terminal"
                          onClick={() => navigate(`/api/${item.recommendedApi.id}/playground`)}
                        >
                          {t('Thử Playground')}
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 relative">
                        {isRestorable ? (
                          <Button
                            variant="outline"
                            size="sm"
                            icon="restore"
                            disabled={isBusy}
                            onClick={() => handleAction(item, 'restore')}
                            data-testid={`restore-btn-${item.recommendedApi.id}`}
                          >
                            {t('Khôi phục đề xuất')}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={isSaved ? 'bookmark_added' : 'bookmark_border'}
                              disabled={isBusy}
                              onClick={() =>
                                handleAction(item, isSaved ? 'restore' : 'saved')
                              }
                              data-testid={`save-btn-${item.recommendedApi.id}`}
                            >
                              {isSaved ? t('Bỏ lưu') : t('Lưu xem sau')}
                            </Button>

                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon="snooze"
                                disabled={isBusy}
                                onClick={() =>
                                  setSnoozeOpenForId(snoozeOpenForId === item.id ? null : item.id)
                                }
                                data-testid={`snooze-btn-${item.recommendedApi.id}`}
                              >
                                {t('Tạm ẩn')}
                              </Button>
                              {snoozeOpenForId === item.id && (
                                <div className="absolute right-0 bottom-10 z-30 w-44 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg p-1.5 space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAction(item, 'snoozed', { snoozeDays: 7 })}
                                    className="w-full text-left px-3 py-2 rounded-lg text-body-xs font-medium hover:bg-surface-container text-on-surface cursor-pointer"
                                  >
                                    {t('Nhắc lại sau 7 ngày')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAction(item, 'snoozed', { snoozeDays: 30 })}
                                    className="w-full text-left px-3 py-2 rounded-lg text-body-xs font-medium hover:bg-surface-container text-on-surface cursor-pointer"
                                  >
                                    {t('Nhắc lại sau 30 ngày')}
                                  </button>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              icon="close"
                              disabled={isBusy}
                              onClick={() => {
                                setDismissItem(item);
                                setDismissReason(DISMISS_REASON_PRESETS[0]);
                              }}
                              data-testid={`dismiss-btn-${item.recommendedApi.id}`}
                            >
                              {t('Bỏ qua')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal 1: Smart Switch / Migration Options */}
      <Modal
        isOpen={Boolean(switchItem)}
        onClose={() => !isSwitching && setSwitchItem(null)}
        title={t('Chuyển đổi sang API được đề xuất')}
        description={
          switchItem
            ? `${switchItem.sourceApi.name} → ${switchItem.recommendedApi.name}`
            : undefined
        }
        maxWidth="lg"
      >
        {switchItem && (
          <div className="space-y-5">
            {/* Target Plan Selector */}
            <div className="space-y-2">
              <span className="text-body-sm font-semibold text-on-surface block">
                {t('1. Chọn gói cước cho API mới:')}
              </span>
              <div className="space-y-2">
                {switchItem.candidatePlans.map((plan) => {
                  const selected = switchPlanId === plan.id;
                  return (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/40 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="targetPlanId"
                          value={plan.id}
                          checked={selected}
                          onChange={() => setSwitchPlanId(plan.id)}
                          className="mt-1 accent-primary"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface">{plan.name}</span>
                            {plan.hasActiveDeal && plan.promotion && (
                              <Badge variant="warning" size="sm">
                                {plan.promotion.badgeText}
                              </Badge>
                            )}
                          </div>
                          <div className="text-body-xs text-on-surface-variant mt-0.5">
                            {formatBigIntCount(String(plan.quota))} {t('req/tháng')} • {plan.rateLimit} req/phút
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {plan.hasActiveDeal && plan.priceMonthly > plan.effectivePriceMonthly && (
                          <span className="text-body-xs line-through text-on-surface-variant block">
                            {formatPrice(plan.priceMonthly, plan.currency)}
                          </span>
                        )}
                        <strong className="text-body-md text-primary">
                          {formatPrice(plan.effectivePriceMonthly, plan.currency)}
                        </strong>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Migration Mode Options */}
            <div className="space-y-2">
              <span className="text-body-sm font-semibold text-on-surface block">
                {t('2. Chọn cách xử lý gói API cũ')} ({switchItem.sourceApi.name}):
              </span>

              <div className="space-y-2.5">
                {(
                  [
                    {
                      mode: 'cancel_at_period_end',
                      title: 'Hủy gói cũ vào cuối chu kỳ (Khuyên dùng)',
                      desc: 'Đăng ký API mới và giữ API cũ chạy hết chu kỳ đã trả phí rồi tự ngừng gia hạn.',
                    },
                    {
                      mode: 'parallel',
                      title: 'Chạy song song cả 2 API (Di trú an toàn)',
                      desc: 'Giữ nguyên gói cũ để kiểm thử và chuyển đổi code dần sang API mới.',
                    },
                    {
                      mode: 'immediate_cancel',
                      title: 'Hủy gói cũ ngay lập tức',
                      desc: 'Thu hồi quyền gọi API Gateway của gói cũ ngay khi chuyển sang API mới.',
                    },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.mode}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      switchMigrationMode === opt.mode
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-outline-variant/40 hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="migrationMode"
                      value={opt.mode}
                      checked={switchMigrationMode === opt.mode}
                      onChange={() => setSwitchMigrationMode(opt.mode)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <strong className="text-body-sm text-on-surface block">{t(opt.title)}</strong>
                      <p className="text-body-xs text-on-surface-variant mt-0.5">{t(opt.desc)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {switchError && (
              <div role="alert" className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-body-sm text-error">
                {switchError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Button variant="outline" onClick={() => setSwitchItem(null)} disabled={isSwitching}>
                {t('Hủy')}
              </Button>
              <Button
                variant="primary"
                icon="swap_horiz"
                loading={isSwitching}
                onClick={handleConfirmSwitch}
                data-testid="confirm-switch-btn"
              >
                {t('Xác nhận chuyển đổi')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Quick Side-by-Side Comparison */}
      <Modal
        isOpen={Boolean(compareItem)}
        onClose={() => setCompareItem(null)}
        title={t('So sánh nhanh API')}
        description={
          compareItem
            ? `${compareItem.sourceApi.name} vs ${compareItem.recommendedApi.name}`
            : undefined
        }
        maxWidth="2xl"
      >
        {compareItem && (
          <div className="space-y-5">
            <div className="overflow-x-auto border border-outline-variant/30 rounded-xl">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-high text-on-surface">
                  <tr>
                    <th className="p-3.5">{t('Tiêu chí')}</th>
                    <th className="p-3.5">{compareItem.sourceApi.name} ({t('Đang dùng')})</th>
                    <th className="p-3.5 text-primary">{compareItem.recommendedApi.name} ({t('Đề xuất')})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="p-3.5 font-medium text-on-surface-variant">{t('Giá gói / tháng')}</td>
                    <td className="p-3.5">{formatPrice(compareItem.sourceApi.currentPriceMonthly, compareItem.sourceApi.currency)}</td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {formatPrice(compareItem.comparison.effectivePriceMonthly, compareItem.comparison.currency)}
                      {compareItem.comparison.savingsPercent > 0 && ` (-${compareItem.comparison.savingsPercent}%)`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-on-surface-variant">{t('Độ trễ trung bình')}</td>
                    <td className="p-3.5">{compareItem.sourceApi.avgLatencyMs !== null ? `${compareItem.sourceApi.avgLatencyMs}ms` : '—'}</td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {compareItem.comparison.candidateAvgLatencyMs !== null ? `${compareItem.comparison.candidateAvgLatencyMs}ms` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-on-surface-variant">{t('Tỷ lệ thành công')}</td>
                    <td className="p-3.5">{compareItem.sourceApi.successRatePercent !== null ? `${compareItem.sourceApi.successRatePercent}%` : '—'}</td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {compareItem.comparison.candidateSuccessRatePercent !== null ? `${compareItem.comparison.candidateSuccessRatePercent}%` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-on-surface-variant">{t('Hạn mức tháng')}</td>
                    <td className="p-3.5">{formatBigIntCount(String(compareItem.sourceApi.quotaLimit))} req</td>
                    <td className="p-3.5 font-bold">{formatBigIntCount(String(compareItem.recommendedPlan.quota))} req</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-on-surface-variant">{t('Rate Limit')}</td>
                    <td className="p-3.5">{compareItem.sourceApi.rateLimitPerMinute} req/phút</td>
                    <td className="p-3.5 font-bold">{compareItem.recommendedPlan.rateLimit} req/phút</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                icon="open_in_new"
                onClick={() =>
                  navigate(
                    `/compare?api1=${compareItem.sourceApi.id}&api2=${compareItem.recommendedApi.id}`,
                  )
                }
              >
                {t('Mở trang so sánh đầy đủ')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCompareItem(null)}>
                  {t('Đóng')}
                </Button>
                <Button
                  variant="primary"
                  icon="swap_horiz"
                  onClick={() => {
                    const target = compareItem;
                    setCompareItem(null);
                    handleOpenSwitch(target);
                  }}
                >
                  {t('Chuyển sang API này')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 3: Dismiss with Feedback Reason */}
      <Modal
        isOpen={Boolean(dismissItem)}
        onClose={() => !isDismissing && setDismissItem(null)}
        title={t('Bỏ qua đề xuất này')}
        description={dismissItem?.recommendedApi.name}
        maxWidth="md"
      >
        {dismissItem && (
          <div className="space-y-4">
            <p className="text-body-sm text-on-surface-variant">
              {t('Cho chúng tôi biết lý do để cải thiện độ chính xác của các đề xuất tiếp theo:')}
            </p>
            <div className="space-y-2">
              {DISMISS_REASON_PRESETS.map((preset) => (
                <label
                  key={preset}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant/40 cursor-pointer hover:bg-surface-container"
                >
                  <input
                    type="radio"
                    name="dismissReasonPreset"
                    checked={dismissReason === preset}
                    onChange={() => setDismissReason(preset)}
                    className="accent-primary"
                  />
                  <span className="text-body-sm text-on-surface">{t(preset)}</span>
                </label>
              ))}
            </div>
            <div>
              <label htmlFor="dismiss-custom-reason" className="text-body-xs font-semibold text-on-surface block mb-1">
                {t('Hoặc nhập lý do cụ thể:')}
              </label>
              <input
                id="dismiss-custom-reason"
                type="text"
                maxLength={200}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full rounded-xl bg-surface-container border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDismissItem(null)} disabled={isDismissing}>
                {t('Hủy')}
              </Button>
              <Button
                variant="danger"
                loading={isDismissing}
                data-testid="confirm-dismiss-btn"
                onClick={async () => {
                  setIsDismissing(true);
                  const target = dismissItem;
                  setDismissItem(null);
                  await handleAction(target, 'dismissed', {
                    reason: dismissReason.trim() || DISMISS_REASON_PRESETS[0],
                  });
                  setIsDismissing(false);
                }}
              >
                {t('Xác nhận bỏ qua')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Recommendation Preferences */}
      <Modal
        isOpen={prefsOpen}
        onClose={() => !isSavingPrefs && setPrefsOpen(false)}
        title={t('Cài đặt Đề xuất Cá nhân hóa')}
        description={t('Tùy chỉnh tiêu chí thuật toán tự động gợi ý API thay thế và Deal ưu đãi.')}
        maxWidth="lg"
      >
        <form data-testid="preferences-form" onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pref-priority-mode" className="text-body-sm font-semibold text-on-surface block mb-1">
                {t('Mục tiêu ưu tiên mặc định')}
              </label>
              <select
                id="pref-priority-mode"
                value={prefsForm.priorityMode}
                onChange={(e) =>
                  setPrefsForm((prev) => ({ ...prev, priorityMode: e.target.value as PriorityMode }))
                }
                className="w-full rounded-xl bg-surface-container border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pref-migration-mode" className="text-body-sm font-semibold text-on-surface block mb-1">
                {t('Chế độ chuyển đổi mặc định')}
              </label>
              <select
                id="pref-migration-mode"
                value={prefsForm.preferredMigrationMode}
                onChange={(e) =>
                  setPrefsForm((prev) => ({
                    ...prev,
                    preferredMigrationMode: e.target.value as MigrationMode,
                  }))
                }
                className="w-full rounded-xl bg-surface-container border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface"
              >
                <option value="cancel_at_period_end">{t('Hủy gói cũ cuối kỳ (Khuyên dùng)')}</option>
                <option value="parallel">{t('Chạy song song 2 gói')}</option>
                <option value="immediate_cancel">{t('Hủy gói cũ ngay lập tức')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-min-days" className="text-body-sm font-semibold text-on-surface block mb-1">
                {t('Số ngày sử dụng tối thiểu trước khi đề xuất')}
              </label>
              <input
                id="pref-min-days"
                type="number"
                min={0}
                max={365}
                value={prefsForm.minUsageDays}
                onChange={(e) =>
                  setPrefsForm((prev) => ({
                    ...prev,
                    minUsageDays: Math.max(0, Math.min(365, Number(e.target.value) || 0)),
                  }))
                }
                className="w-full rounded-xl bg-surface-container border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface"
              />
            </div>

            <div>
              <label htmlFor="pref-min-savings" className="text-body-sm font-semibold text-on-surface block mb-1">
                {t('Mức tiết kiệm tối thiểu (%)')}
              </label>
              <input
                id="pref-min-savings"
                type="number"
                min={0}
                max={95}
                value={prefsForm.minSavingsPercent}
                onChange={(e) =>
                  setPrefsForm((prev) => ({
                    ...prev,
                    minSavingsPercent: Math.max(0, Math.min(95, Number(e.target.value) || 0)),
                  }))
                }
                className="w-full rounded-xl bg-surface-container border border-outline-variant/40 px-3 py-2 text-body-sm text-on-surface"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-body-sm text-on-surface">
              <input
                type="checkbox"
                checked={prefsForm.onlyVerifiedProviders}
                onChange={(e) =>
                  setPrefsForm((prev) => ({ ...prev, onlyVerifiedProviders: e.target.checked }))
                }
                className="rounded accent-primary w-4 h-4"
              />
              <span>{t('Chỉ đề xuất API từ Nhà cung cấp đã xác minh (Verified)')}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-body-sm text-on-surface">
              <input
                type="checkbox"
                checked={prefsForm.onlyActiveDeals}
                onChange={(e) =>
                  setPrefsForm((prev) => ({ ...prev, onlyActiveDeals: e.target.checked }))
                }
                className="rounded accent-primary w-4 h-4"
              />
              <span>{t('Chỉ hiển thị các gói đang có Deal giảm giá / ưu đãi')}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-body-sm text-on-surface">
              <input
                type="checkbox"
                checked={prefsForm.autoNotifyDeals}
                onChange={(e) =>
                  setPrefsForm((prev) => ({ ...prev, autoNotifyDeals: e.target.checked }))
                }
                className="rounded accent-primary w-4 h-4"
              />
              <span>{t('Tự động đánh dấu nổi bật khi có Deal mới phù hợp')}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button variant="outline" type="button" onClick={() => setPrefsOpen(false)} disabled={isSavingPrefs}>
              {t('Đóng')}
            </Button>
            <Button variant="primary" type="submit" icon="save" loading={isSavingPrefs} data-testid="save-preferences-btn">
              {t('Lưu tùy chọn')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
