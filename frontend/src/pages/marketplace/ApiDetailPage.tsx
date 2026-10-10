import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';
import { Badge, MethodBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Modal } from '../../components/ui/Modal';

export const ApiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apis, tryGrants } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'pricing' | 'sdks'>('overview');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('Security Vulnerability');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const api = apis.find(a => a.id === id);

  if (!api) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('API Not Found')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{t('The requested API does not exist or has not been published yet.')}</p>
        <Link to="/marketplace">
          <Button variant="primary" icon="storefront">{t('Browse Marketplace')}</Button>
        </Link>
      </div>
    );
  }

  const remainingTrial = tryGrants[api.id] ?? 8;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportModalOpen(false);
      setReportDescription('');
    }, 1800);
  };

  return (
    <div className="pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>{t(api.category)}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{api.name}</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[36px]">{api.icon}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
                  {api.name}
                </h1>
                <span className="font-code-md text-code-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                  v{api.version}
                </span>
                <StatusBadge status={api.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1 font-medium text-on-surface">
                  {api.providerName}
                  {api.providerVerified && (
                    <span className="material-symbols-outlined text-primary text-[16px]" title={t('Verified Provider')}>
                      verified
                    </span>
                  )}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  {api.rating.toFixed(2)} ({api.reviewCount} {t('reviews')})
                </span>
                <span>•</span>
                <span>{api.subscribersCount.toLocaleString()} {t('active subscribers')}</span>
              </div>

              <p className="text-body-md text-on-surface-variant mt-3 max-w-3xl leading-relaxed">
                {t(api.shortDescription) || api.shortDescription}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              icon="terminal"
              onClick={() => navigate(`/api/${api.id}/playground`)}
            >
              {t('Test in Playground')}
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon="bolt"
              onClick={() => navigate(`/api/${api.id}/try-sandbox`)}
            >
              {t('Try Sandbox')} ({remainingTrial} lượt)
            </Button>
            <Button
              variant="outline"
              size="md"
              icon="compare_arrows"
              onClick={() => navigate(`/compare?api=${api.id}`)}
            >
              {t('Compare API')}
            </Button>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 pt-6 border-t border-outline-variant/30">
          <div>
            <span className="text-[12px] uppercase font-semibold text-on-surface-variant tracking-wider block">
              {t('P95 Latency')}
            </span>
            <span className="text-headline-sm font-bold text-emerald-600 font-mono">
              {api.latencyP95Ms} ms
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Gateway overhead: 1.8ms</span>
          </div>
          <div>
            <span className="text-[12px] uppercase font-semibold text-on-surface-variant tracking-wider block">
              {t('SLA Uptime')}
            </span>
            <span className="text-headline-sm font-bold text-emerald-600 font-mono">
              {api.uptimePercent}%
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Chỉ số 30 ngày qua</span>
          </div>
          <div>
            <span className="text-[12px] uppercase font-semibold text-on-surface-variant tracking-wider block">
              {t('Error Rate')}
            </span>
            <span className="text-headline-sm font-bold text-emerald-600 font-mono">
              0.02%
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Tổng hợp 4xx/5xx</span>
          </div>
          <div>
            <span className="text-[12px] uppercase font-semibold text-on-surface-variant tracking-wider block">
              {t('Trust Score')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              <span className="text-headline-sm font-bold text-primary font-mono">98/100</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">{t('Domain Verified ✓')}</span>
          </div>
          <div>
            <span className="text-[12px] uppercase font-semibold text-on-surface-variant tracking-wider block">
              {t('Data Classification')}
            </span>
            <span className="text-body-md font-bold text-primary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[18px]">policy</span>
              GDPR / SOC2
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">Môi trường Sandbox không lưu dữ liệu</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">info</span> {t('Overview & Specs')}
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-5 py-3 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'endpoints'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">alt_route</span> {t('Endpoints')} ({api.endpoints.length})
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-5 py-3 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pricing'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span> {t('Pricing Plans')} ({api.plans.length})
        </button>
        <button
          onClick={() => setActiveTab('sdks')}
          className={`px-5 py-3 text-body-md font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sdks'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">code</span> {t('Quickstart & SDKs')}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-headline-sm font-bold text-on-surface mb-3">{t('About this API')}</h3>
              <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-line">
                {api.longDescription}
              </p>

              <h4 className="text-body-md font-bold text-on-surface mt-6 mb-2">{t('Key Architectural Features')}</h4>
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span>Strict schema validation với hỗ trợ JSON mode, cam kết không truncate token.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span>Định tuyến API Gateway đa vùng địa lý, kiểm soát quota bằng Redis và cơ chế tự động bảo vệ fail-closed.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span>Header Gateway ký mã hóa HMAC ngăn chặn bypass trực tiếp upstream (chuẩn US-23).</span>
                </li>
              </ul>
            </div>

            {/* Compliance Section */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                {t('Compliance & Legal Governance')}
              </h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-4">
                {api.complianceNotes}
              </p>
              <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/20 text-body-sm flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">Thỏa thuận Nhà cung cấp & Điều khoản Dịch vụ</span>
                  <span className="text-[12px] text-on-surface-variant">Cam kết quyền sở hữu trí tuệ và không vi phạm bản quyền</span>
                </div>
                <Badge variant="success">Tuân thủ</Badge>
              </div>
            </div>
          </div>

          {/* Right Sidebar info */}
          <div className="space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-body-md font-bold text-on-surface mb-4">Base URL</h3>
              <div className="bg-surface-container-highest/60 p-3 rounded-xl font-code-md text-code-sm text-on-surface break-all border border-outline-variant/30 mb-4">
                {api.baseUrl}
              </div>

              <h3 className="text-body-md font-bold text-on-surface mb-2">{t('Authentication Mechanism')}</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">
                Yêu cầu được xác thực qua header chuẩn <code className="text-primary font-code-md">X-API-Key</code>.
              </p>

              <div className="pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error-container/40 rounded-xl transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  {t('Report API Vulnerability / Abuse')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-headline-sm font-bold text-on-surface">{t('Available API Endpoints')}</h3>
            <Button
              variant="primary"
              size="sm"
              icon="terminal"
              onClick={() => navigate(`/api/${api.id}/playground`)}
            >
              {t('Open Full Interactive Playground')}
            </Button>
          </div>

          {api.endpoints.map(ep => (
            <div key={ep.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <MethodBadge method={ep.method} />
                  <span className="font-code-md font-bold text-on-surface text-body-lg">
                    {ep.path}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm text-on-surface-variant font-code-sm">
                    Rate Limit: {ep.rateLimitPerSec} req/giây
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="play_arrow"
                    onClick={() => navigate(`/api/${api.id}/playground?endpoint=${encodeURIComponent(ep.path)}`)}
                  >
                    {t('Playground')}
                  </Button>
                </div>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-4">
                {ep.description}
              </p>

              {ep.parameters.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-label-md uppercase font-semibold text-on-surface-variant mb-2">{t('Parameters')}</h4>
                  <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20">
                    <table className="w-full text-left text-body-sm">
                      <thead className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2">Tên</th>
                          <th className="px-4 py-2">Kiểu</th>
                          <th className="px-4 py-2">Vị trí</th>
                          <th className="px-4 py-2">Bắt buộc</th>
                          <th className="px-4 py-2">Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                        {ep.parameters.map(p => (
                          <tr key={p.name}>
                            <td className="px-4 py-2.5 font-code-md font-semibold text-primary">{p.name}</td>
                            <td className="px-4 py-2.5 font-code-sm text-on-surface-variant">{p.type}</td>
                            <td className="px-4 py-2.5 font-code-sm uppercase">{p.in}</td>
                            <td className="px-4 py-2.5">
                              {p.required ? (
                                <Badge variant="danger" size="sm">Bắt buộc</Badge>
                              ) : (
                                <span className="text-on-surface-variant text-[12px]">Tùy chọn</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-on-surface-variant">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {ep.sampleResponse && (
                <div>
                  <h4 className="text-label-md uppercase font-semibold text-on-surface-variant mb-2">{t('Sample Response')} (200 OK)</h4>
                  <CodeBlock code={ep.sampleResponse} language="json" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-headline-lg font-bold text-on-surface">{t('Transparent Developer Economics')}</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              {t('Select a predictable plan backed by guaranteed SLAs and real-time quota alerts.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {api.plans.map(plan => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'bg-surface-container-lowest border-primary shadow-lg ring-2 ring-primary/20 relative'
                    : 'bg-surface-container-low border-outline-variant/40'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-label-md font-bold px-3 py-0.5 rounded-full shadow-sm">
                    {t('Most Popular')}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-headline-sm font-bold text-on-surface">{plan.name}</h3>
                    <Badge variant={plan.tier === 'Free' ? 'neutral' : 'primary'}>{plan.tier}</Badge>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-on-surface">${plan.priceMonthly}</span>
                    <span className="text-body-sm text-on-surface-variant">/ tháng</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-outline-variant/20 mb-8">
                    <div className="flex items-center gap-2 text-body-sm font-medium text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px]">data_usage</span>
                      <span>{plan.monthlyQuota.toLocaleString()} {t('requests / month')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm font-medium text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                      <span>{plan.rateLimitPerSec} {t('req/sec rate limit')}</span>
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px] flex-shrink-0 mt-0.5">check</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/checkout/${api.id}/${plan.id}`)}
                >
                  {plan.priceMonthly === 0 ? t('Start Free Sandbox') : `${t('Subscribe to')} ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SDKs Tab */}
      {activeTab === 'sdks' && (
        <div className="space-y-6">
          <h3 className="text-headline-sm font-bold text-on-surface mb-2">{t('Integration Examples')}</h3>
          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">cURL</h4>
            <CodeBlock
              language="bash"
              code={`curl -X POST "${api.baseUrl}/v4/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY_HERE" \\
  -d '{
    "model": "neural-v4-turbo",
    "messages": [{"role": "user", "content": "Hello API HUB!"}]
  }'`}
            />
          </div>

          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">Python (requests)</h4>
            <CodeBlock
              language="python"
              code={`import requests

url = "${api.baseUrl}/v4/chat/completions"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_API_KEY_HERE"
}
payload = {
    "model": "neural-v4-turbo",
    "messages": [{"role": "user", "content": "Hello API HUB!"}]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
            />
          </div>

          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">Node.js (fetch)</h4>
            <CodeBlock
              language="javascript"
              code={`const response = await fetch("${api.baseUrl}/v4/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_API_KEY_HERE"
  },
  body: JSON.stringify({
    model: "neural-v4-turbo",
    messages: [{ role: "user", content: "Hello API HUB!" }]
  })
});

const data = await response.json();
console.log(data);`}
            />
          </div>
        </div>
      )}

      {/* Abuse Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={t('Report API or Security Vulnerability')}
        description={`${t('File an official moderation report regarding')} ${api.name}`}
      >
        {reportSubmitted ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-[48px] text-emerald-600 mb-2">check_circle</span>
            <h4 className="text-headline-sm font-bold text-on-surface">{t('Report Submitted')}</h4>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('Our Security & Moderation team has received your ticket and will investigate immediately.')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">{t('Issue Category')}</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
              >
                <option value="API không hoạt động">API không hoạt động (API Not Responding / Down)</option>
                <option value="Thông tin sai lệch">Thông tin sai lệch (Misleading Documentation / Spec)</option>
                <option value="Vi phạm quyền sở hữu">Vi phạm quyền sở hữu (Copyright / IP Infringement)</option>
                <option value="Vi phạm quyền riêng tư">Vi phạm quyền riêng tư (Privacy Breach / Unauthorized PII)</option>
                <option value="Dữ liệu không hợp pháp">Dữ liệu không hợp pháp (Illegal / Prohibited Content)</option>
                <option value="API có hành vi nguy hiểm">API có hành vi nguy hiểm (Malicious Payload / Security Risk)</option>
                <option value="Lý do khác">Lý do khác (Other Concern)</option>
              </select>
            </div>

            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">{t('Description & Evidence')}</label>
              <textarea
                required
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Cung cấp thông tin chi tiết, endpoint bị ảnh hưởng hoặc các bước tái hiện..."
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="danger" icon="send">
                {t('Submit Report')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
