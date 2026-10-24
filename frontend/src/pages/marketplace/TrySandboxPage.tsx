import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge, MethodBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useLanguage } from '../../i18n';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import { getMarketplaceApiDetail, formatPrice } from '../../services/marketplaceApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

export const TrySandboxPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [sandboxApiKey] = useState('ak_sand_consumer_demo_test');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activePreset, setActivePreset] = useState<'standard' | 'minimal' | 'custom'>('standard');
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMarketplaceApiDetail(id, controller.signal);
        setApi(data);
        if (data.endpoints && data.endpoints.length > 0) {
          setSelectedEndpointId(data.endpoints[0].id);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', 'Lỗi tải API'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [id]);

  const selectedEndpoint = useMemo(() => {
    if (!api || !api.endpoints) return null;
    return api.endpoints.find(e => e.id === selectedEndpointId) || api.endpoints[0] || null;
  }, [api, selectedEndpointId]);

  const firstPaidPlan = useMemo(() => api?.plans?.find(p => p.priceMonthly > 0), [api]);

  const generatedCurl = useMemo(() => {
    if (!api || !selectedEndpoint) return '';
    const baseUrl = 'https://api.apihub.vn/v1';

    let qStr = '';
    if (activePreset === 'standard' && Array.isArray(selectedEndpoint.parameters)) {
      const qParams = selectedEndpoint.parameters
        .filter((p: any) => p.in === 'query')
        .map((p: any) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.default ?? 'demo')}`);
      if (qParams.length > 0) {
        qStr = `?${qParams.join('&')}`;
      }
    }

    let curl = `curl -X ${selectedEndpoint.method} "${baseUrl}${selectedEndpoint.path}${qStr}" \\\n`;
    curl += `  -H "X-API-Key: ${sandboxApiKey}" \\\n`;
    curl += `  -H "Accept: application/json"`;

    const isBodyAllowed = selectedEndpoint.method.toUpperCase() !== 'GET' && selectedEndpoint.method.toUpperCase() !== 'DELETE';
    if (isBodyAllowed) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n`;
      curl += `  -d '{"sandbox": true, "preset": "${activePreset}"}'`;
    }

    return curl;
  }, [api, selectedEndpoint, sandboxApiKey, activePreset]);

  const handleCopyKey = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(sandboxApiKey).catch(() => {});
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyCurl = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedCurl).catch(() => {});
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-48 mb-6" />
        <div className="h-48 bg-surface-container-low rounded-2xl border border-outline-variant/30 mb-6" />
        <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
      </div>
    );
  }

  if (error || !api) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">science</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('Sandbox Not Available')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {error?.status === 404
            ? t('API này không tồn tại hoặc chưa được công khai.')
            : t('Đã xảy ra sự cố khi tải thông tin Sandbox.')}
        </p>
        <Link to="/marketplace">
          <Button variant="primary" icon="storefront">{t('Browse Marketplace')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageReveal className="pt-20 pb-16 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/api/${api.id}`} className="hover:text-primary transition-colors">{api.name}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{t('Try Before Subscribe')}</span>
      </div>

      {/* Main Guided Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-headline-lg font-bold text-on-surface">{t('Try Before Subscribe')}</h1>
                <Badge variant={api.hasFreePlan ? 'success' : 'neutral'}>
                  {api.hasFreePlan ? t('Free Tier Available') : t('Paid Only')}
                </Badge>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {t('Môi trường kiểm thử nhanh dành cho')} <strong className="text-on-surface">{api.name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="terminal"
              onClick={() => navigate(`/api/${api.id}/playground`)}
            >
              {t('Open Full Playground')}
            </Button>
          </div>
        </div>

        {/* Guided Step Progress Indicator */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: 1, title: 'Step 1: Credentials', icon: 'key' },
            { step: 2, title: 'Step 2: Endpoint & Presets', icon: 'tune' },
            { step: 3, title: 'Step 3: Execute & cURL', icon: 'play_arrow' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
                    : isCompleted
                      ? 'bg-surface-container border-outline-variant/30 text-on-surface'
                      : 'bg-surface-container/50 border-outline-variant/20 text-on-surface-variant'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-body-xs font-bold ${
                  isCurrent ? 'bg-primary text-on-primary' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : s.step}
                </span>
                <span className="text-body-xs truncate hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step 1: Sandbox Credentials Info */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                    <span>{t('Sandbox Demo Key')}</span>
                  </h3>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    {t('Khóa xác thực tạm thời dành cho việc chạy thử nghiệm an toàn trên Sandbox Gateway.')}
                  </p>
                </div>
                <Badge variant="neutral" size="sm">Sandbox Only</Badge>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-high p-2.5 rounded-xl border border-outline-variant/30">
                <code className="flex-1 font-code-sm text-primary font-bold px-2 select-all">
                  {sandboxApiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedKey ? 'check' : 'content_copy'}
                  onClick={handleCopyKey}
                >
                  {copiedKey ? t('Copied!') : t('Copy')}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-body-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <span>{t('Anti-SSRF Gateway Guard: Bật')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                  <span>{t('Rate Limit: 5 req/giây (Sandbox Mode)')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                icon="arrow_forward"
                onClick={() => setCurrentStep(2)}
              >
                {t('Tiếp tục: Chọn Endpoint (Step 2)')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Endpoint & Parameter Presets */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                  {t('1. Chọn Endpoint kiểm thử:')}
                </label>
                <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl border border-outline-variant/30">
                  <MethodBadge method={selectedEndpoint?.method as any || 'GET'} />
                  <select
                    value={selectedEndpointId}
                    onChange={(e) => setSelectedEndpointId(e.target.value)}
                    className="bg-transparent flex-1 text-on-surface font-code-md text-body-sm outline-none cursor-pointer"
                  >
                    {api.endpoints.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        {ep.method} {ep.path} {ep.description ? `— ${ep.description.slice(0, 35)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                  {t('2. Parameter Quick-Run Presets:')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'standard', label: 'Standard Query', desc: 'Sử dụng tham số mẫu mặc định' },
                    { id: 'minimal', label: 'Minimal', desc: 'Không kèm query parameters' },
                    { id: 'custom', label: 'Sandbox Payload', desc: 'Kèm mock flag payload' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        activePreset === preset.id
                          ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                          : 'bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-outline-variant'
                      }`}
                    >
                      <div className="text-body-sm font-bold">{preset.label}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
              >
                {t('Quay lại Step 1')}
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="arrow_forward"
                onClick={() => setCurrentStep(3)}
              >
                {t('Tiếp tục: Xem cURL & Chạy thử (Step 3)')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Execute / Review cURL */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                  <span>{t('Lệnh cURL kiểm thử Sandbox')}</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedCurl ? 'check' : 'content_copy'}
                  onClick={handleCopyCurl}
                >
                  {copiedCurl ? t('Copied!') : t('Copy cURL')}
                </Button>
              </div>

              <CodeBlock
                code={generatedCurl}
                language="bash"
              />

              <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-body-xs text-on-surface-variant">
                  <strong className="text-on-surface">{t('Cơ chế Sandbox Router:')}</strong>{' '}
                  {t('Lệnh cURL trên sẵn sàng chạy trong terminal để nhận dữ liệu kiểm thử từ Gateway.')}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon="play_arrow"
                  disabled={true}
                  title={t('Cơ chế kích hoạt trực tiếp từ trình duyệt đang chờ kết nối Backend Gateway Router trong Sprint 4')}
                  onClick={() => setSandboxModalOpen(true)}
                >
                  {t('Kích hoạt Sandbox Key')}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
              >
                {t('Quay lại Step 2')}
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon="terminal"
                onClick={() => navigate(`/api/${api.id}/playground`)}
              >
                {t('Chuyển tới Playground')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade to Production Plan Banner */}
      {firstPaidPlan && (
        <AnimatedCard hoverLift={true} className="bg-surface-container-low border border-primary/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
              <h3 className="text-body-lg font-bold text-on-surface">
                {t('Sẵn sàng triển khai thực tế? Nâng cấp lên')} {firstPaidPlan.name}
              </h3>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {t('Mở rộng hạn mức lên')} <strong>{firstPaidPlan.quota.toLocaleString()} {t('requests / month')}</strong> {t('với tốc độ')} {firstPaidPlan.rateLimit} req/giây.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            shine={true}
            icon="payments"
            className="flex-shrink-0"
            onClick={() => navigate(`/checkout/${api.id}/${firstPaidPlan.id}`)}
          >
            {t('Upgrade to Production Plan')} ({formatPrice(firstPaidPlan.priceMonthly, firstPaidPlan.currency)})
          </Button>
        </AnimatedCard>
      )}

      {/* Sandbox Notice Modal */}
      <Modal
        isOpen={sandboxModalOpen}
        onClose={() => setSandboxModalOpen(false)}
        title={t('Thông báo cấp phát Sandbox')}
        description={t('Trạng thái kết nối Sandbox Backend')}
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-body-sm text-on-surface">
            <div className="flex items-center gap-2 font-bold mb-1 text-primary">
              <span className="material-symbols-outlined text-[20px]">info</span>
              <span>{t('Thông báo kỹ thuật')}</span>
            </div>
            <p className="text-body-xs leading-relaxed text-on-surface-variant">
              {t('Cơ chế cấp phát Sandbox Key tự động sẽ được kích hoạt cùng dịch vụ Consumer Keys của Backend. Hiện tại, bạn có thể kiểm thử API thông qua Playground hoặc quản lý khóa trong trang Quản lý Khóa.')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setSandboxModalOpen(false)}
            >
              {t('Đóng')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSandboxModalOpen(false);
                navigate(`/api/${api.id}/playground`);
              }}
            >
              {t('Tới Playground kiểm thử')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
