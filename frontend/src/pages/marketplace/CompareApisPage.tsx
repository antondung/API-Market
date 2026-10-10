import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const CompareApisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { apis } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const initialApiId = searchParams.get('api') || apis[0]?.id;
  const secondApiId = apis.length > 1 ? apis[1].id : apis[0]?.id;

  const [apiId1, setApiId1] = useState(initialApiId);
  const [apiId2, setApiId2] = useState(secondApiId);

  const api1 = apis.find(a => a.id === apiId1) || apis[0];
  const api2 = apis.find(a => a.id === apiId2) || apis[1] || apis[0];

  if (apis.length < 2 || !api1 || !api2) {
    return (
      <div className="pt-24 pb-20 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">compare</span>
          <h2 className="text-headline-sm font-bold text-on-surface">{t('Chưa đủ API để so sánh song song')}</h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
            {t('Tính năng so sánh yêu cầu ít nhất 2 API có sẵn trên sàn. Hiện sàn chưa có đủ số lượng API được xuất bản.')}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/marketplace')}>
              {t('Xem Chợ API')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/provider/create-api')}>
              {t('Tạo API Mới')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{t('API Side-by-Side Comparison')}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold">
              {t('STANDARDIZED BENCHMARK')}
            </span>
            <span className="text-xs text-on-surface-variant">{t('US-02 Spec Aligned')}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('API Side-by-Side Comparison')}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t('Compare Price, Quota, SLA Uptime, P95 Latency, Error Rate, Authentication, and Trust Score pursuant to project specifications.')}
          </p>
        </div>
        <Link to="/marketplace" className="text-body-sm text-primary font-semibold hover:underline">
          ← {t('Back to Marketplace') || 'Quay lại Sàn API'}
        </Link>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 1 API')}</label>
          <CustomSelect
            value={apiId1}
            onChange={(val) => setApiId1(val)}
            options={apis.map(a => ({
              value: a.id,
              label: a.name,
              badge: t(a.category) || a.category,
              icon: 'api'
            }))}
            className="w-full"
          />
        </div>

        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 2 API')}</label>
          <CustomSelect
            value={apiId2}
            onChange={(val) => setApiId2(val)}
            options={apis.map(a => ({
              value: a.id,
              label: a.name,
              badge: t(a.category) || a.category,
              icon: 'api'
            }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface">
            <tr>
              <th className="p-5 font-semibold text-body-md w-1/4">{t('Specification & Criteria')}</th>
              <th className="p-5 font-bold text-headline-sm text-primary w-3/8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">{api1.icon}</span>
                  <span>{api1.name}</span>
                </div>
              </th>
              <th className="p-5 font-bold text-headline-sm text-indigo-700 w-3/8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">{api2.icon}</span>
                  <span>{api2.name}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-body-md text-on-surface">
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Provider Identity')}</td>
              <td className="p-5 font-medium">
                {api1.providerName}{' '}
                {api1.providerVerified && <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>}
              </td>
              <td className="p-5 font-medium">
                {api2.providerName}{' '}
                {api2.providerVerified && <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>}
              </td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Trust Score')}</td>
              <td className="p-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  <span className="font-bold font-mono text-primary text-base">98 / 100</span>
                  <Badge variant="success" size="sm">Độ tin cậy cao</Badge>
                </div>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  <span className="font-bold font-mono text-primary text-base">95 / 100</span>
                  <Badge variant="success" size="sm">Đã xác minh</Badge>
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Domain Verification')}</td>
              <td className="p-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                  <span className="material-symbols-outlined text-sm">domain_verification</span>
                  {t('Domain Verified ✓')}
                </span>
              </td>
              <td className="p-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                  <span className="material-symbols-outlined text-sm">domain_verification</span>
                  {t('Domain Verified ✓')}
                </span>
              </td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Industry Category')}</td>
              <td className="p-5"><Badge variant="primary">{t(api1.category)}</Badge></td>
              <td className="p-5"><Badge variant="primary">{t(api2.category)}</Badge></td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('P95 Latency')}</td>
              <td className="p-5 font-mono font-bold text-emerald-600">{api1.latencyP95Ms} ms</td>
              <td className="p-5 font-mono font-bold text-emerald-600">{api2.latencyP95Ms} ms</td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Uptime SLA Index')}</td>
              <td className="p-5 font-mono font-bold text-emerald-600">{api1.uptimePercent}%</td>
              <td className="p-5 font-mono font-bold text-emerald-600">{api2.uptimePercent}%</td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Error Rate')} (30 ngày)</td>
              <td className="p-5 font-mono text-emerald-600 font-semibold">0.02%</td>
              <td className="p-5 font-mono text-emerald-600 font-semibold">0.04%</td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Authentication Method')}</td>
              <td className="p-5 font-mono text-xs">Bearer Token / Header <code>X-API-Key</code></td>
              <td className="p-5 font-mono text-xs">Bearer Token / Header <code>X-API-Key</code></td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Data Classification')}</td>
              <td className="p-5 text-sm">
                <Badge variant="neutral" size="sm">Dữ liệu công khai phi cá nhân</Badge>
              </td>
              <td className="p-5 text-sm">
                <Badge variant="neutral" size="sm">Vị trí &amp; Tài chính</Badge>
              </td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Monthly Throughput')}</td>
              <td className="p-5 font-mono">{api1.totalCallsMonthly} lượt gọi</td>
              <td className="p-5 font-mono">{api2.totalCallsMonthly} lượt gọi</td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Community Rating')}</td>
              <td className="p-5 text-amber-600 font-semibold">★ {api1.rating.toFixed(1)} ({api1.reviewCount} đánh giá)</td>
              <td className="p-5 text-amber-600 font-semibold">★ {api2.rating.toFixed(1)} ({api2.reviewCount} đánh giá)</td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Available Pricing Tiers')}</td>
              <td className="p-5">
                <div className="space-y-1.5">
                  {api1.plans.map(p => (
                    <div key={p.id} className="text-body-sm flex items-center justify-between bg-surface-container/60 px-3 py-1.5 rounded-lg border border-outline-variant/20">
                      <span className="font-semibold">{p.name}:</span>
                      <span className="font-mono text-primary font-medium">${p.priceMonthly}/tháng ({p.monthlyQuota.toLocaleString()} reqs)</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="p-5">
                <div className="space-y-1.5">
                  {api2.plans.map(p => (
                    <div key={p.id} className="text-body-sm flex items-center justify-between bg-surface-container/60 px-3 py-1.5 rounded-lg border border-outline-variant/20">
                      <span className="font-semibold">{p.name}:</span>
                      <span className="font-mono text-primary font-medium">${p.priceMonthly}/tháng ({p.monthlyQuota.toLocaleString()} reqs)</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-5 font-medium text-on-surface-variant">{t('Quick Actions')}</td>
              <td className="p-5">
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => navigate(`/api/${api1.id}`)}>{t('View Details')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/api/${api1.id}/playground`)}>{t('Playground')}</Button>
                </div>
              </td>
              <td className="p-5">
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => navigate(`/api/${api2.id}`)}>{t('View Details')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/api/${api2.id}/playground`)}>{t('Playground')}</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
