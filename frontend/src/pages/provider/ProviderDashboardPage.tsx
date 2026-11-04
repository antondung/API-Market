import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { ApiError } from '../../services/authApi';
import {
  getProviderVerification,
  listProviderApis,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import { getProviderAnalyticsOverview } from '../../services/usageApi';
import type { ProviderApisPage, ProviderVerification } from '../../services/providerTypes';
import {
  type ProviderAnalyticsOverview,
  formatBigIntCount,
  parseSafeBigInt,
  formatCurrencyAmount,
} from '../../services/sprint4Types';

type Snapshot = {
  userId: string;
  revision: number;
  verification: ProviderVerification | null;
  apis: ProviderApisPage;
};

export const ProviderDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [requestError, setRequestError] = useState<{
    userId: string;
    revision: number;
    message: string;
  } | null>(null);

  const [analytics, setAnalytics] = useState<ProviderAnalyticsOverview | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [revision, setRevision] = useState(0);
  const userId = currentUser?.id;

  useEffect(() => {
    const controller = new AbortController();
    if (!userId) return () => controller.abort();

    setIsAnalyticsLoading(true);
    setAnalyticsError(null);

    Promise.all([
      getProviderVerification(controller.signal),
      listProviderApis(1, 5, controller.signal),
    ])
      .then(([verification, apis]) => {
        if (!controller.signal.aborted) {
          setSnapshot({ userId, revision, verification, apis });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setRequestError({ userId, revision, message: formatProviderErrorMessage(err) });
        }
      });

    getProviderAnalyticsOverview(undefined, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setAnalytics(res);
          setAnalyticsError(null);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setAnalytics(null);
          setAnalyticsError(
            err instanceof ApiError ? err.message : (err?.message || t('Lỗi kết nối máy chủ'))
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsAnalyticsLoading(false);
        }
      });

    return () => controller.abort();
  }, [userId, revision]);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Never expose previous account's data while its replacement request is pending.
  const data =
    snapshot && snapshot.userId === userId && snapshot.revision === revision
      ? snapshot
      : null;
  const error =
    requestError && requestError.userId === userId && requestError.revision === revision
      ? requestError.message
      : null;
  const verified = data?.verification?.status === 'Verified';
  const status = data
    ? data.verification?.status ?? 'Chưa xác minh'
    : error
      ? 'Không tải được trạng thái'
      : 'Đang tải trạng thái…';

  // Analytics Metrics Computation
  const totalRequests = parseSafeBigInt(analytics?.requests?.requestCount);
  const successRequests = parseSafeBigInt(analytics?.requests?.successCount);
  const errorRequests = parseSafeBigInt(analytics?.requests?.errorCount);

  const successRate =
    totalRequests > 0n
      ? `${(Number((successRequests * 10000n) / totalRequests) / 100).toFixed(1)}%`
      : '—';

  const errorRate =
    totalRequests > 0n
      ? `${(Number((errorRequests * 10000n) / totalRequests) / 100).toFixed(1)}%`
      : '—';

  const avgLatency =
    analytics?.requests?.averageLatencyMs !== undefined && analytics.requests.averageLatencyMs > 0
      ? `${Math.round(analytics.requests.averageLatencyMs)} ms`
      : '—';

  const activeSubscribers = analytics?.activeSubscribers
    ? formatBigIntCount(analytics.activeSubscribers)
    : '0';

  const revenueItems = analytics?.revenue || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold">{t('Provider Dashboard')}</h1>
          <p className="text-body-md text-on-surface-variant">{currentUser?.name}</p>
          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
          {data?.verification?.organizationName && (
            <p className="mt-2 text-body-sm text-on-surface font-medium">
              {data.verification.organizationName}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setRevision((value) => value + 1)}>
            {t('Làm mới')}
          </Button>
          <Button
            variant="secondary"
            icon="auto_stories"
            disabled={!verified || !data?.apis.total}
            onClick={() => navigate('/provider/import-openapi')}
          >
            {t('Import OpenAPI')}
          </Button>
          <Button
            icon="add_circle"
            disabled={!verified}
            onClick={() => navigate('/provider/create-api')}
          >
            {t('Create API Product')}
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-error-container text-on-error-container">
          {error}
        </div>
      )}

      {!data && !error && <p role="status">{t('Đang tải dữ liệu Provider…')}</p>}

      {data && !verified && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <p>
            {data.verification?.status === 'Rejected'
              ? t('Hồ sơ đã bị từ chối. Vui lòng cập nhật hồ sơ xác minh.')
              : data.verification?.status === 'Pending'
                ? t('Hồ sơ đang được xét duyệt.')
                : t('Xác minh Provider để tạo API.')}
          </p>
          <Link className="text-primary hover:underline mt-1 inline-block" to="/provider/verification">
            {t('Xem hồ sơ xác minh')}
          </Link>
        </div>
      )}

      {/* KPI Bento Grid - AC-05 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric 1: APIs in catalog */}
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">
                {t('APIs in catalog')}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">apps</span>
            </div>
            <strong className="text-3xl font-extrabold text-on-surface font-code-md">
              {data ? data.apis.total.toLocaleString() : '—'}
            </strong>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('API sản phẩm được quản lý trong danh mục')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <Link to="/provider/apis" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Xem danh sách API')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Gateway Requests */}
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">
                {t('Total Requests')}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">data_usage</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {isAnalyticsLoading ? (
                <span className="text-2xl text-on-surface-variant animate-pulse">{t('Đang tải...')}</span>
              ) : analyticsError ? (
                <span className="text-xl font-bold text-error">{t('Không thể tải')}</span>
              ) : (
                formatBigIntCount(totalRequests)
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Lưu lượng thực tế qua Gateway trong kỳ')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">
              {t('Thành công:')} <strong className="text-on-surface font-code-sm">{successRate}</strong>
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {t('Lỗi:')} <strong className="text-on-surface font-code-sm">{errorRate}</strong>
            </span>
          </div>
        </div>

        {/* Metric 3: Active Subscribers */}
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">
                {t('Active Subscribers')}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">group</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {isAnalyticsLoading ? (
                <span className="text-2xl text-on-surface-variant animate-pulse">{t('Đang tải...')}</span>
              ) : analyticsError ? (
                <span className="text-xl font-bold text-error">{t('Không thể tải')}</span>
              ) : (
                activeSubscribers
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Người dùng có thuê bao Active hợp lệ')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <Link to="/provider/subscribers" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Quản lý người đăng ký')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Metric 4: Average Latency */}
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">
                {t('Average Latency')}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">speed</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {isAnalyticsLoading ? (
                <span className="text-2xl text-on-surface-variant animate-pulse">{t('Đang tải...')}</span>
              ) : (
                avgLatency
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Thời gian phản hồi đầu cuối trung bình qua Gateway')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <Link to="/provider/telemetry" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Xem Telemetry chi tiết')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Metric 5: Multi-Currency Sandbox Revenue */}
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-2 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">
                {t('Sandbox Revenue (Multi-Currency)')}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
            </div>
            <div className="mt-1">
              {isAnalyticsLoading ? (
                <span className="text-2xl text-on-surface-variant animate-pulse">{t('Đang tải...')}</span>
              ) : analyticsError ? (
                <span className="text-xl font-bold text-error">{t('Không thể tải')}</span>
              ) : revenueItems.length === 0 ? (
                <div className="text-3xl font-extrabold text-on-surface font-code-md">
                  {formatCurrencyAmount('0', 'VND')}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 items-center">
                  {revenueItems.map((rev) => (
                    <div
                      key={rev.currency}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold font-code-md text-xl"
                    >
                      {formatCurrencyAmount(rev.amount, rev.currency)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-2">
              {t('Doanh thu thanh toán Sandbox đã quyết toán (tách biệt theo từng loại tiền tệ, không cộng dồn chéo).')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">
              {t('Quyết toán Sandbox')}
            </span>
            <span className="text-[11px] font-code-sm text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              Durable Billing
            </span>
          </div>
        </div>
      </div>

      {/* Daily Traffic Breakdown Table */}
      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-title-lg font-bold text-on-surface">
              {t('Phân tích lưu lượng theo ngày')}
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              {t('Chi tiết số lượng yêu cầu gọi qua API Gateway theo từng ngày.')}
            </p>
          </div>
        </div>

        {isAnalyticsLoading ? (
          <div className="p-8 text-center text-on-surface-variant">
            <p className="animate-pulse">{t('Đang tải dữ liệu lưu lượng…')}</p>
          </div>
        ) : analyticsError ? (
          <div className="p-6 text-center text-error border border-error/20 rounded-xl bg-error/5">
            <p className="font-semibold">{t('Không thể tải dữ liệu phân tích lưu lượng')}</p>
            <p className="text-body-sm mt-1">{analyticsError}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setRevision((v) => v + 1)}
            >
              {t('Thử lại')}
            </Button>
          </div>
        ) : !analytics || analytics.daily.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant/30 rounded-xl">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
              bar_chart
            </span>
            <p className="font-semibold text-body-md text-on-surface">
              {t('Chưa có dữ liệu lưu lượng theo ngày')}
            </p>
            <p className="text-body-sm text-on-surface-variant/80 mt-1">
              {t('Khi người dùng gọi API của bạn qua Gateway, thống kê chi tiết theo ngày sẽ được tổng hợp tự động tại đây.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="p-4 font-semibold">{t('Ngày')}</th>
                  <th className="p-4 font-semibold text-right">{t('Số lượt gọi')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.daily.map((item) => (
                  <tr
                    key={item.date}
                    className="border-b border-outline-variant/20 hover:bg-surface-container-highest/20 transition-colors"
                  >
                    <td className="p-4 font-code-sm font-medium text-on-surface">{item.date}</td>
                    <td className="p-4 font-code-sm text-right font-bold text-primary">
                      {formatBigIntCount(item.requestCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent APIs Table */}
      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between border-b border-outline-variant/20">
          <h2 className="text-title-lg font-bold">{t('API gần đây')}</h2>
          <Link className="text-primary hover:underline text-body-sm font-semibold" to="/provider/apis">
            {t('Xem tất cả API')}
          </Link>
        </div>
        {data && data.apis.items.length === 0 && (
          <p className="p-5 text-on-surface-variant">{t('Bạn chưa có API nào.')}</p>
        )}
        {data && data.apis.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant">
                <tr>
                  <th className="p-4 font-semibold">API</th>
                  <th className="p-4 font-semibold">{t('Category')}</th>
                  <th className="p-4 font-semibold">{t('Status')}</th>
                  <th className="p-4 font-semibold">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.apis.items.map((api) => (
                  <tr key={api.id} className="border-b border-outline-variant/20 hover:bg-surface-container-highest/20 transition-colors">
                    <td className="p-4 font-semibold text-on-surface">{api.name}</td>
                    <td className="p-4 text-on-surface-variant">{api.category}</td>
                    <td className="p-4">
                      <StatusBadge status={api.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/provider/endpoints?api=${api.id}`)}
                        >
                          Endpoints
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/provider/workflow?api=${api.id}`)}
                        >
                          Workflow
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
