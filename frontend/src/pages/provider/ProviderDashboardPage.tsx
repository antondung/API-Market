import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const ProviderDashboardPage: React.FC = () => {
  const { apis, verifications, requestLogs, subscriptions } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const providerVerification = verifications.find(v => v.providerId === currentUser.id);
  const isVerified = providerVerification?.status === 'Verified';
  const myApis = apis.filter(a => a.providerId === currentUser.id);
  const totalSubscribers = myApis.reduce((acc, a) => acc + (a.subscribersCount || 0), 0);
  const myApiIds = new Set(myApis.map(a => a.id));
  const myApiNames = new Set(myApis.map(a => a.name));
  const myLogs = requestLogs.filter(l => myApiNames.has(l.apiName));
  const gatewayTrafficCount = myLogs.length;
  const errorLogs = myLogs.filter(l => l.statusCode >= 500);
  const errorRate = myLogs.length > 0 ? ((errorLogs.length / myLogs.length) * 100).toFixed(2) + '%' : '0.00%';
  const mySubscriptions = subscriptions.filter(s => myApiIds.has(s.apiId) && s.status === 'Active');
  const mrr = mySubscriptions.reduce((acc, s) => acc + (s.priceMonthly || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-label-md font-semibold">
                {t('Verified Provider Suite')}
              </span>
            ) : providerVerification?.status === 'Pending' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-label-md font-semibold">
                {t('Đang xét duyệt hồ sơ')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30 text-label-md font-semibold">
                {t('Chưa xác minh')}
              </span>
            )}
            <span className="text-body-sm text-on-surface-variant font-code-md">
              Org: {currentUser.company || t('Độc lập / Cá nhân')}
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Welcome back, Developer')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Full lifecycle control over API publishing, OpenAPI documentation imports, subscriber tiers, and upstream gateway health.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="auto_stories"
            onClick={() => navigate('/provider/import-openapi')}
          >
            {t('Import OpenAPI')}
          </Button>
          <Button
            variant="primary"
            icon="add_circle"
            onClick={() => navigate('/provider/create-api')}
          >
            {t('Create API Product')}
          </Button>
        </div>
      </div>

      {/* Compliance / Verification Banner */}
      {isVerified ? (
        <div className="p-4 rounded-xl bg-surface-container-low border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
            <div>
              <span className="font-semibold text-on-surface block text-body-md">
                {t('Provider Verification Status: Verified')}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Business License')} ({providerVerification?.businessLicense}) {t('approved. You are eligible to publish live commercial APIs.')}
              </span>
            </div>
          </div>
          <Link to="/provider/verification" className="text-body-sm text-primary font-semibold hover:underline">
            {t('View Legal Details →')}
          </Link>
        </div>
      ) : providerVerification?.status === 'Pending' ? (
        <div className="p-4 rounded-xl bg-surface-container-low border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-[24px]">pending</span>
            <div>
              <span className="font-semibold text-on-surface block text-body-md">
                {t('Hồ sơ xác minh đang chờ xét duyệt')}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Hồ sơ giấy phép kinh doanh của bạn đang được ban quản trị kiểm tra.')}
              </span>
            </div>
          </div>
          <Link to="/provider/verification" className="text-body-sm text-primary font-semibold hover:underline">
            {t('Xem chi tiết →')}
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">verified_user</span>
            <div>
              <span className="font-semibold text-on-surface block text-body-md">
                {t('Chưa xác minh danh tính nhà cung cấp')}
              </span>
              <span className="text-body-sm text-on-surface-variant">
                {t('Nộp hồ sơ pháp lý doanh nghiệp để mở khóa quyền xuất bản API trực tiếp lên sàn.')}
              </span>
            </div>
          </div>
          <Link to="/provider/verification" className="text-body-sm text-primary font-semibold hover:underline">
            {t('Xác minh ngay →')}
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2 text-on-surface-variant text-body-sm">
            <span>{t('Total Subscribers')}</span>
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">
            {totalSubscribers.toLocaleString()}
          </div>
          <div className="text-on-surface-variant text-body-sm mt-1 font-medium">
            {myApis.length} {t('APIs in catalog')}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2 text-on-surface-variant text-body-sm">
            <span>{t('Gateway Traffic')}</span>
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">
            {gatewayTrafficCount > 0 ? `${gatewayTrafficCount.toLocaleString()}` : '0'}
          </div>
          <div className="text-on-surface-variant text-body-sm mt-1 font-medium">
            {gatewayTrafficCount > 0 ? t('Telemetry real-time') : t('Chưa có lưu lượng')}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2 text-on-surface-variant text-body-sm">
            <span>{t('Gateway Error Rate')}</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">
            {errorRate}
          </div>
          <div className="text-on-surface-variant text-body-sm mt-1">
            {errorLogs.length} {t('lỗi 5xx')}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2 text-on-surface-variant text-body-sm">
            <span>{t('Monthly Run Rate (MRR)')}</span>
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface font-code-md">
            ${mrr.toLocaleString()}
          </div>
          <div className="text-on-surface-variant text-body-sm mt-1 font-medium">
            {mySubscriptions.length} {t('active subscriptions')}
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">{t('API Request Volume Telemetry')}</h2>
              <p className="text-body-sm text-on-surface-variant">{t('Real-time aggregate RPS across all published upstream endpoints')}</p>
            </div>
            <div className="flex gap-1.5 p-1 bg-surface-container rounded-xl text-body-sm font-medium">
              <span className="px-2.5 py-1 bg-surface-container-lowest rounded-lg font-bold shadow-xs">24H</span>
              <span className="px-2.5 py-1 text-on-surface-variant">7D</span>
              <span className="px-2.5 py-1 text-on-surface-variant">30D</span>
            </div>
          </div>

          {/* SVG Wave Chart or Empty Telemetry State */}
          {myLogs.length === 0 ? (
            <div className="w-full h-48 flex flex-col items-center justify-center text-center text-on-surface-variant border border-dashed border-outline-variant/30 rounded-xl my-2 p-6">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">monitoring</span>
              <p className="text-body-sm font-semibold text-on-surface">{t('Chưa có dữ liệu telemetry')}</p>
              <p className="text-[12px] text-on-surface-variant max-w-sm mt-1">
                {t('Biểu đồ lưu lượng RPS thời gian thực sẽ hiển thị khi người dùng gửi yêu cầu tới các API của bạn qua Gateway.')}
              </p>
            </div>
          ) : (
            <div className="w-full h-48 relative flex flex-col justify-end">
              <svg className="w-full h-44 overflow-visible" fill="none" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="provider-chart-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2a14b4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2a14b4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0 150 C 100 130, 200 160, 300 90 C 400 20, 500 110, 600 60 C 700 10, 750 40, 800 20 L 800 200 L 0 200 Z" fill="url(#provider-chart-grad)" />
                <path d="M0 150 C 100 130, 200 160, 300 90 C 400 20, 500 110, 600 60 C 700 10, 750 40, 800 20" stroke="#2a14b4" strokeLinecap="round" strokeWidth="3" />
              </svg>
              <div className="flex justify-between text-body-sm text-on-surface-variant mt-2 font-code-sm">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>{t('Current')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Launch Panel */}
        <div className="space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-headline-sm font-bold text-on-surface mb-3">{t('Lifecycle Shortcuts')}</h3>
            <div className="space-y-2">
              <Link
                to="/provider/apis"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                  {t('My APIs Inventory')}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                to="/provider/workflow"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
                  {t('Publishing Workflow Tracker')}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                to="/provider/subscribers"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                  {t('Subscriber Management')}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                to="/provider/analytics"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-body-sm text-on-surface font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
                  {t('Health & Latency (P99)')}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Managed APIs Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Managed APIs & Endpoints')}</h2>
            <p className="text-body-sm text-on-surface-variant">{t('Live deployment status and gateway routing metrics')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/provider/apis')}>
            {t('View All')} ({myApis.length})
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
              <tr>
                <th className="px-5 py-3">{t('API Name')}</th>
                <th className="px-5 py-3">{t('Category')}</th>
                <th className="px-5 py-3">{t('Status')}</th>
                <th className="px-5 py-3">{t('Version')}</th>
                <th className="px-5 py-3">{t('P95 Latency')}</th>
                <th className="px-5 py-3">{t('Subscribers')}</th>
                <th className="px-5 py-3 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {myApis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <span className="material-symbols-outlined text-[36px] text-outline mb-2">api</span>
                      <p className="font-semibold text-body-md text-on-surface">{t('Bạn chưa xuất bản API nào')}</p>
                      <p className="text-body-sm text-on-surface-variant mt-1 mb-4">
                        {t('Tạo API đầu tiên của bạn để kết nối Gateway, quản lý endpoint và cấu hình các gói cước thương mại.')}
                      </p>
                      <Button size="sm" variant="primary" icon="add_circle" onClick={() => navigate('/provider/create-api')}>
                        {t('Create Your First API')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                myApis.map(api => (
                  <tr key={api.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-[22px]">{api.icon}</span>
                        <span className="font-bold text-on-surface">{api.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-body-sm text-on-surface-variant">{t(api.category)}</td>
                    <td className="px-5 py-4"><StatusBadge status={api.status} /></td>
                    <td className="px-5 py-4 font-code-sm text-on-surface-variant">v{api.version}</td>
                    <td className="px-5 py-4 font-code-md text-emerald-600 font-semibold">{api.latencyP95Ms} ms</td>
                    <td className="px-5 py-4 font-code-md font-semibold">{api.subscribersCount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/provider/endpoints?api=${api.id}`)}>
                          Endpoints
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/provider/workflow?api=${api.id}`)}>
                          Workflow
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
