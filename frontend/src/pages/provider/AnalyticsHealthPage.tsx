import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';

export const AnalyticsHealthPage: React.FC = () => {
  const { requestLogs } = useApp();
  const { t } = useLanguage();

  const totalLogs = requestLogs.length;
  const success2xx = requestLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
  const client4xx = requestLogs.filter(l => l.statusCode >= 400 && l.statusCode < 500).length;
  const server5xx = requestLogs.filter(l => l.statusCode >= 500).length;

  const successRate = totalLogs > 0 ? ((success2xx / totalLogs) * 100).toFixed(2) + '%' : '—';
  const clientErrorRate = totalLogs > 0 ? ((client4xx / totalLogs) * 100).toFixed(2) + '%' : '—';
  const serverErrorRate = totalLogs > 0 ? ((server5xx / totalLogs) * 100).toFixed(2) + '%' : '—';

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Provider Telemetry & Health Analytics')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Deep observability into latency quantiles, upstream response distributions, and regional edge performance.')}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">{t('Trạng thái giám sát (Honest Observability): ')}</strong>
          {t('Gateway hiện chỉ cung cấp số liệu tổng hợp (tổng request, tỷ lệ lỗi, độ trễ trung bình). Các chỉ số phân vị (P50/P90/P95/P99) và phân tán theo vùng chưa có pipeline telemetry đo kiểm thực tế, hiển thị theo mục tiêu SLA thiết kế.')}
        </div>
      </div>

      {/* Quantiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">{t('P50 Median Latency')}</span>
          <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
            {t('Chưa có dữ liệu thực')}
          </div>
          <span className="text-body-sm text-primary font-medium mt-1 block">
            {t('Target SLA: < 20 ms')}
          </span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">{t('P90 Tail Latency')}</span>
          <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
            {t('Chưa có dữ liệu thực')}
          </div>
          <span className="text-body-sm text-primary font-medium mt-1 block">
            {t('Target SLA: < 30 ms')}
          </span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">{t('P95 SLA Boundary')}</span>
          <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
            {t('Chưa có dữ liệu thực')}
          </div>
          <span className="text-body-sm text-primary font-medium mt-1 block">
            {t('Target SLA: < 50 ms')}
          </span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm">
          <span className="text-label-md font-semibold text-on-surface-variant uppercase block mb-1">{t('P99 Worst Case')}</span>
          <div className="text-lg font-bold text-on-surface-variant/80 font-code-md my-1">
            {t('Chưa có dữ liệu thực')}
          </div>
          <span className="text-body-sm text-primary font-medium mt-1 block">
            {t('Target SLA: < 100 ms')}
          </span>
        </div>
      </div>

      {/* HTTP Status Code Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-on-surface text-body-md">{t('2xx Success Ratio')}</span>
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          </div>
          <div className="text-4xl font-extrabold text-emerald-600 font-code-md mb-2">{successRate}</div>
          <p className="text-body-sm text-on-surface-variant">
            {totalLogs > 0 ? t('Tỷ lệ thành công dựa trên phiên làm việc hiện tại.') : t('Chưa ghi nhận request trong phiên làm việc.')}
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-on-surface text-body-md">{t('4xx Client Errors')}</span>
            <span className="material-symbols-outlined text-amber-600">warning</span>
          </div>
          <div className="text-4xl font-extrabold text-amber-600 font-code-md mb-2">{clientErrorRate}</div>
          <p className="text-body-sm text-on-surface-variant">
            {totalLogs > 0 ? t('Tỷ lệ lỗi client (4xx) trong phiên làm việc.') : t('Chưa ghi nhận request trong phiên làm việc.')}
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-on-surface text-body-md">{t('5xx Upstream Faults')}</span>
            <span className="material-symbols-outlined text-error">error</span>
          </div>
          <div className="text-4xl font-extrabold text-error font-code-md mb-2">{serverErrorRate}</div>
          <p className="text-body-sm text-on-surface-variant">
            {totalLogs > 0 ? t('Tỷ lệ sự cố upstream (5xx) trong phiên làm việc.') : t('Chưa ghi nhận request trong phiên làm việc.')}
          </p>
        </div>
      </div>

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
          {t('Hệ thống Gateway hiện chưa kích hoạt phân tán đa vùng. Các vùng bên dưới thể hiện mục tiêu SLA thiết kế khi triển khai multi-region.')}
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
  );
};
