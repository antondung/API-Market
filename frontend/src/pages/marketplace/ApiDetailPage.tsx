import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { Badge, MethodBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Modal } from '../../components/ui/Modal';
import { DocumentationViewer } from '../../components/provider/DocumentationViewer';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import { AnimatedTabs } from '../../components/motion/AnimatedTabs';
import {
  getMarketplaceApiDetail,
  formatPrice,
  formatPublishedDate,
} from '../../services/marketplaceApi';
import type {
  MarketplaceApiDetail,
  MarketplaceEndpoint,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';
import type { ProviderDocumentation } from '../../services/providerTypes';
import {
  generateCurlSnippet,
  generateFetchSnippet,
  generatePythonSnippet,
} from '../../utils/apiSnippetGenerator';

export const ApiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'documentation' | 'pricing' | 'privacy' | 'sdks'>('overview');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopyPath = (path: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(path).catch(() => {});
    }
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  };

  // Report abuse modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('API không hoạt động');
  const [reportDescription, setReportDescription] = useState('');

  // Fetch API detail with AbortController
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setApi(null);

        const data = await getMarketplaceApiDetail(id, controller.signal);
        if (controller.signal.aborted) return;
        setApi(data);
        if (data.versions && data.versions.length > 0) {
          setSelectedVersionId(data.versions[0].id);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(new ApiError(0, 'UNKNOWN_ERROR', 'Đã xảy ra sự cố khi tải chi tiết API.'));
        }
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

  // Filter endpoints for selected version strictly without cross-version fallback
  const currentEndpoints = useMemo(() => {
    if (!api || !api.endpoints) return [];
    if (!selectedVersionId) return api.endpoints;
    return api.endpoints.filter(ep => ep.versionId === selectedVersionId);
  }, [api, selectedVersionId]);

  // Filter documentation for selected version strictly without cross-version fallback
  const currentDoc = useMemo<ProviderDocumentation | null>(() => {
    if (!api || !api.documentation || api.documentation.length === 0) return null;
    const matched = selectedVersionId
      ? api.documentation.find(doc => doc.versionId === selectedVersionId)
      : api.documentation[0];
    if (!matched) return null;

    let parsedContent: any = {};
    if (typeof matched.content === 'string') {
      try {
        parsedContent = JSON.parse(matched.content);
      } catch {
        parsedContent = {};
      }
    } else if (typeof matched.content === 'object' && matched.content !== null) {
      parsedContent = matched.content;
    }

    return {
      id: matched.versionId,
      apiId: api.id,
      versionId: matched.versionId,
      source: matched.source || 'openapi',
      content: parsedContent,
    };
  }, [api, selectedVersionId]);

  // Handle Loading Skeleton
  if (isLoading) {
    return (
      <div className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto min-h-screen animate-pulse">
        <div className="h-4 bg-surface-container-high rounded w-48 mb-6" />
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-surface-container-high rounded w-1/3" />
              <div className="h-4 bg-surface-container-high rounded w-1/4" />
              <div className="h-4 bg-surface-container-high rounded w-2/3" />
            </div>
          </div>
        </div>
        <div className="h-10 bg-surface-container-high rounded w-96 mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  // Handle 404 or Not Found
  if (error && error.status === 404) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mb-4">
          <span className="material-symbols-outlined text-[32px]">search_off</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('API Not Found')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {t('API này không tồn tại, chưa được xuất bản công khai hoặc tài khoản nhà cung cấp đang tạm khóa.')}
        </p>
        <Link to="/marketplace">
          <Button variant="primary" icon="storefront">{t('Browse Marketplace')}</Button>
        </Link>
      </div>
    );
  }

  // Handle Network Error or Server Error
  if (error || !api) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">cloud_off</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">
          {error?.status === 429 ? t('Gửi yêu cầu quá nhanh') : t('Không thể tải chi tiết API')}
        </h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {error?.message || t('Đã xảy ra sự cố khi kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.')}
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            icon="refresh"
            onClick={() => {
              if (id) {
                setIsLoading(true);
                setError(null);
                getMarketplaceApiDetail(id)
                  .then((data) => {
                    setError(null);
                    setApi(data);
                    if (data.versions && data.versions.length > 0) {
                      setSelectedVersionId(data.versions[0].id);
                    }
                  })
                  .catch(setError)
                  .finally(() => setIsLoading(false));
              }
            }}
          >
            {t('Thử lại')}
          </Button>
          <Link to="/marketplace">
            <Button variant="outline">{t('Về Marketplace')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedVersionObj = api.versions?.find(v => v.id === selectedVersionId) || api.versions?.[0];

  return (
    <PageReveal className="pt-20 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/marketplace?category=${encodeURIComponent(api.category)}`} className="hover:text-primary transition-colors">
          {t(api.category)}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{api.name}</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[36px]">api</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
                  {api.name}
                </h1>
                {selectedVersionObj && (
                  <span className="font-code-md text-code-sm bg-surface-container-high px-2.5 py-0.5 rounded text-on-surface font-semibold">
                    v{selectedVersionObj.version}
                  </span>
                )}
                <Badge variant="success" size="sm">Published</Badge>
                {api.hasFreePlan && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-semibold">
                    {t('Free Tier')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1 font-medium text-on-surface">
                  {api.providerName}
                  {api.providerStatus === 'Verified' && (
                    <span
                      className="material-symbols-outlined text-primary text-[16px]"
                      title={t('Verified Provider')}
                    >
                      verified
                    </span>
                  )}
                </span>
                <span>•</span>
                <span className="text-on-surface-variant font-code-sm">
                  Provider ID: #{api.providerId}
                </span>
                <span>•</span>
                <span>{t('Published')}: {formatPublishedDate(api.publishedAt)}</span>
              </div>

              <p className="text-body-md text-on-surface-variant mt-3 max-w-3xl leading-relaxed">
                {api.description}
              </p>

              {api.tags && api.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3" data-no-translate="true">
                  {api.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] font-code-sm font-medium bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-md border border-outline-variant/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap lg:flex-col gap-3 flex-shrink-0">
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
              magnetic={true}
              onClick={() => navigate(`/api/${api.id}/try-sandbox`)}
            >
              {t('Try Sandbox')}
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

        {/* Versions selector bar if multiple versions */}
        {api.versions && api.versions.length > 1 && (
          <div className="mt-6 pt-5 border-t border-outline-variant/30 flex items-center gap-3">
            <span className="text-body-sm font-medium text-on-surface whitespace-nowrap">
              {t('Phiên bản')}:
            </span>
            <div className="flex flex-wrap gap-2">
              {api.versions.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVersionId(v.id)}
                  className={`px-3 py-1 rounded-lg text-body-xs font-code-md transition-all ${
                    selectedVersionId === v.id
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  v{v.version}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 overflow-x-auto pb-1">
        <AnimatedTabs
          tabs={[
            { id: 'overview', label: t('Overview & Specs'), icon: 'info' },
            { id: 'endpoints', label: `${t('Endpoints')} (${currentEndpoints.length})`, icon: 'alt_route' },
            { id: 'documentation', label: t('OpenAPI Documentation'), icon: 'description' },
            { id: 'pricing', label: `${t('Pricing Plans')} (${api.plans?.length || 0})`, icon: 'payments' },
            { id: 'privacy', label: t('Privacy & Compliance'), icon: 'security' },
            { id: 'sdks', label: t('Quickstart'), icon: 'code' },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          layoutId="api-detail-tabs"
        />
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-headline-sm font-bold text-on-surface mb-3">{t('About this API')}</h3>
              <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-line">
                {api.description}
              </p>

              {selectedVersionObj?.changelog && (
                <div className="mt-6 pt-4 border-t border-outline-variant/20">
                  <h4 className="text-body-md font-bold text-on-surface mb-2">
                    {t('Version Changelog')} (v{selectedVersionObj.version})
                  </h4>
                  <p className="text-body-sm text-on-surface-variant whitespace-pre-line bg-surface-container-high/40 p-3 rounded-xl border border-outline-variant/20">
                    {selectedVersionObj.changelog}
                  </p>
                </div>
              )}
            </div>

            {/* Provider Verification Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-headline-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                {t('Provider Verification & Governance')}
              </h3>
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">{api.providerName}</span>
                  <span className="text-body-xs text-on-surface-variant">
                    Provider ID: #{api.providerId}
                  </span>
                </div>
                <Badge
                  variant={api.providerStatus === 'Verified' ? 'success' : 'neutral'}
                  size="md"
                >
                  {api.providerStatus === 'Verified' ? 'Verified Provider' : api.providerStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-body-md font-bold text-on-surface mb-4">{t('Technical Summary')}</h3>
              <dl className="space-y-3 text-body-sm">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <dt className="text-on-surface-variant">{t('Category')}</dt>
                  <dd className="font-medium text-on-surface">{t(api.category)}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <dt className="text-on-surface-variant">{t('Versions')}</dt>
                  <dd className="font-code-sm text-on-surface">{api.versions?.length || 0}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <dt className="text-on-surface-variant">{t('Endpoints')}</dt>
                  <dd className="font-code-sm text-on-surface">{api.endpoints?.length || 0}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <dt className="text-on-surface-variant">{t('Active Plans')}</dt>
                  <dd className="font-code-sm text-on-surface">{api.plans?.length || 0}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-on-surface-variant">{t('Authentication')}</dt>
                  <dd className="font-code-sm text-primary">API Key / Gateway</dd>
                </div>
              </dl>

              <div className="pt-5 mt-5 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error-container/40 rounded-xl transition-colors font-medium cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  {t('Report API Vulnerability / Abuse')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">{t('Available API Endpoints')}</h3>
              <p className="text-body-sm text-on-surface-variant">
                {t('Danh sách các endpoint đã đăng ký cho phiên bản hiện tại.')}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon="terminal"
              onClick={() => navigate(`/api/${api.id}/playground${selectedVersionId ? `?versionId=${encodeURIComponent(selectedVersionId)}` : ''}`)}
            >
              {t('Open Full Interactive Playground')}
            </Button>
          </div>

          {currentEndpoints.length === 0 ? (
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">alt_route</span>
              <h4 className="text-headline-sm font-bold text-on-surface">
                {t('Phiên bản')} {selectedVersionObj ? `v${selectedVersionObj.version}` : ''} {t('chưa có tài liệu endpoint công bố')}
              </h4>
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
                {t('Vui lòng chọn phiên bản khác hoặc liên hệ nhà cung cấp API để yêu cầu thông tin.')}
              </p>
            </div>
          ) : (
            currentEndpoints.map((ep: MarketplaceEndpoint) => (
              <div key={ep.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <MethodBadge method={ep.method as any} />
                    <span className="font-code-md font-bold text-on-surface text-body-lg">
                      {ep.path}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPath(ep.path)}
                      title={copiedPath === ep.path ? t('Đã sao chép') : t('Sao chép đường dẫn')}
                      className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedPath === ep.path ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="play_arrow"
                    onClick={() => navigate(`/api/${api.id}/playground?endpoint=${encodeURIComponent(ep.path)}&method=${encodeURIComponent(ep.method)}`)}
                  >
                    {t('Playground')}
                  </Button>
                </div>

                {ep.description && (
                  <p className="text-body-sm text-on-surface-variant mb-4">
                    {ep.description}
                  </p>
                )}

                {/* Parameters table */}
                {Array.isArray(ep.parameters) && ep.parameters.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-label-md uppercase font-semibold text-on-surface-variant mb-2">{t('Parameters')}</h4>
                    <div className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20">
                      <table className="w-full text-left text-body-sm">
                        <thead className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-2">Tên</th>
                            <th className="px-4 py-2">Vị trí</th>
                            <th className="px-4 py-2">Bắt buộc</th>
                            <th className="px-4 py-2">Mô tả</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                          {ep.parameters.map((p: any, idx: number) => {
                            const name = p?.name || `param_${idx}`;
                            const inLocation = p?.in || 'query';
                            const isRequired = Boolean(p?.required);
                            const desc = p?.description || '—';
                            return (
                              <tr key={idx}>
                                <td className="px-4 py-2.5 font-code-md font-semibold text-primary">{name}</td>
                                <td className="px-4 py-2.5 font-code-sm uppercase">{inLocation}</td>
                                <td className="px-4 py-2.5">
                                  {isRequired ? (
                                    <Badge variant="danger" size="sm">Bắt buộc</Badge>
                                  ) : (
                                    <span className="text-on-surface-variant text-[12px]">Tùy chọn</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-on-surface-variant">{desc}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Response Example */}
                {ep.responseExample !== null && ep.responseExample !== undefined && (
                  <div>
                    <h4 className="text-label-md uppercase font-semibold text-on-surface-variant mb-2">
                      {t('Response Example')}
                    </h4>
                    <CodeBlock
                      code={typeof ep.responseExample === 'string' ? ep.responseExample : JSON.stringify(ep.responseExample, null, 2)}
                      language="json"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Documentation */}
      {activeTab === 'documentation' && (
        <div>
          {currentDoc ? (
            <DocumentationViewer
              doc={currentDoc}
              apiName={api.name}
            />
          ) : (
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">description</span>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {t('Phiên bản')} {selectedVersionObj ? `v${selectedVersionObj.version}` : ''} {t('chưa có OpenAPI spec công bố')}
              </h3>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
                {t('Vui lòng chọn phiên bản khác hoặc liên hệ nhà cung cấp để yêu cầu đặc tả API.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Pricing */}
      {activeTab === 'pricing' && (
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-headline-lg font-bold text-on-surface">{t('Transparent Developer Economics')}</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              {t('Các gói dịch vụ được kích hoạt trực tiếp từ nhà phát hành.')}
            </p>
          </div>

          {api.plans && api.plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {api.plans.map(plan => {
                const isPopular = plan.priceMonthly > 0;
                return (
                  <AnimatedCard
                    key={plan.id}
                    hoverLift={true}
                    className={`rounded-2xl p-6 border flex flex-col justify-between ${
                      isPopular
                        ? 'bg-surface-container-low border-primary/40 shadow-sm relative ring-1 ring-primary/20'
                        : 'bg-surface-container-low border-outline-variant/40'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                        {t('Recommended')}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-headline-sm font-bold text-on-surface">{plan.name}</h3>
                        <Badge variant={plan.priceMonthly === 0 ? 'neutral' : 'primary'}>
                          {plan.priceMonthly === 0 ? 'Free' : 'Paid'}
                        </Badge>
                      </div>

                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-extrabold text-on-surface">
                          {formatPrice(plan.priceMonthly, plan.currency)}
                        </span>
                        {plan.priceMonthly > 0 && (
                          <span className="text-body-sm text-on-surface-variant">/ tháng</span>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-outline-variant/20 mb-8">
                        <div className="flex items-center gap-2 text-body-sm font-medium text-on-surface">
                          <span className="material-symbols-outlined text-primary text-[18px]">data_usage</span>
                          <span>{plan.quota.toLocaleString()} {t('requests / month')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-body-sm font-medium text-on-surface">
                          <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                          <span>{plan.rateLimit} {t('req/sec rate limit')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button
                        variant={plan.priceMonthly === 0 ? 'secondary' : 'primary'}
                        size="lg"
                        shine={isPopular}
                        className="w-full"
                        onClick={() => navigate(`/checkout/${api.id}/${plan.id}`)}
                      >
                        {plan.priceMonthly === 0 ? t('Start Free Sandbox') : `${t('Subscribe to')} ${plan.name}`}
                      </Button>
                      <p className="text-[11px] text-center text-on-surface-variant mt-2">
                        {t('Đăng ký gói tự động sẽ khả dụng trong Sprint 4.')}
                      </p>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">payments</span>
              <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có bảng giá kích hoạt')}</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {t('Hiện tại chưa có gói dịch vụ nào đang hoạt động cho API này.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Privacy & Legal */}
      {activeTab === 'privacy' && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
          <h3 className="text-headline-sm font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">policy</span>
            {t('Khai báo Pháp lý & Quyền riêng tư')}
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-6">
            {t('Thông tin phân loại dữ liệu và bảo vệ quyền riêng tư do Nhà cung cấp công bố chính thức.')}
          </p>

          {api.legal ? (
            <dl className="space-y-4">
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                <dt className="text-body-sm font-semibold text-on-surface mb-1">{t('Phân loại dữ liệu (Data Classification)')}</dt>
                <dd className="text-body-md text-primary font-medium">{api.legal.dataClassification}</dd>
              </div>

              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                <dt className="text-body-sm font-semibold text-on-surface mb-1">{t('Xử lý dữ liệu cá nhân (Processes Personal Data)')}</dt>
                <dd className="text-body-md text-on-surface">
                  {api.legal.processesPersonalData ? (
                    <span className="text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      {t('Có xử lý dữ liệu cá nhân')}
                    </span>
                  ) : (
                    <span className="text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {t('Không xử lý dữ liệu cá nhân')}
                    </span>
                  )}
                </dd>
              </div>

              {api.legal.personalDataTypes && api.legal.personalDataTypes.length > 0 && (
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <dt className="text-body-sm font-semibold text-on-surface mb-2">{t('Các loại dữ liệu cá nhân thu thập')}</dt>
                  <dd className="flex flex-wrap gap-2">
                    {api.legal.personalDataTypes.map(tType => (
                      <Badge key={tType} variant="neutral" size="sm">
                        {tType}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}

              {api.legal.dataProcessingPurpose && (
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                  <dt className="text-body-sm font-semibold text-on-surface mb-1">{t('Mục đích xử lý dữ liệu')}</dt>
                  <dd className="text-body-sm text-on-surface-variant leading-relaxed">
                    {api.legal.dataProcessingPurpose}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">info</span>
              <p className="text-body-md">{t('Chưa có thông tin khai báo pháp lý công khai cho API này.')}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: SDKs */}
      {activeTab === 'sdks' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">{t('Quickstart Examples')}</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">
              {t('Hướng dẫn gọi API thông qua Gateway bằng API Key được cấp.')}
            </p>
          </div>

          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">cURL</h4>
            <CodeBlock
              language="bash"
              code={generateCurlSnippet({
                method: currentEndpoints[0]?.method || 'GET',
                urlPath: currentEndpoints[0]?.path || '/endpoint',
                apiKey: 'YOUR_API_KEY_HERE',
                includeTemplateNotice: true,
              })}
            />
          </div>

          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">JavaScript (fetch)</h4>
            <CodeBlock
              language="javascript"
              code={generateFetchSnippet({
                method: currentEndpoints[0]?.method || 'GET',
                urlPath: currentEndpoints[0]?.path || '/endpoint',
                apiKey: 'YOUR_API_KEY_HERE',
                includeTemplateNotice: true,
              })}
            />
          </div>

          <div>
            <h4 className="text-body-md font-bold text-on-surface mb-2">Python (requests)</h4>
            <CodeBlock
              language="python"
              code={generatePythonSnippet({
                method: currentEndpoints[0]?.method || 'GET',
                urlPath: currentEndpoints[0]?.path || '/endpoint',
                apiKey: 'YOUR_API_KEY_HERE',
                includeTemplateNotice: true,
              })}
            />
          </div>
        </div>
      )}

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={t('Báo cáo vi phạm / Lỗ hổng API')}
        description={`${t('Báo cáo vi phạm liên quan tới')} ${api.name}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-body-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{t('Lưu ý bảo mật')}</span>
            </div>
            {t('Tính năng gửi báo cáo trực tuyến đang chờ kết nối Backend (US-20). Vui lòng gửi email trực tiếp tới security@apihub.vn nếu phát hiện vi phạm bảo mật khẩn cấp.')}
          </div>

          <div>
            <label htmlFor="report-category-select" className="text-body-sm font-medium text-on-surface block mb-1">{t('Phân loại vi phạm')}</label>
            <select
              id="report-category-select"
              aria-label={t('Phân loại vi phạm') || 'Phân loại vi phạm'}
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
            >
              <option value="API không hoạt động">API không hoạt động (Down / Not Responding)</option>
              <option value="Thông tin sai lệch">Thông tin sai lệch (Misleading Docs)</option>
              <option value="Vi phạm bản quyền">Vi phạm bản quyền (IP Infringement)</option>
              <option value="Vi phạm riêng tư">Vi phạm quyền riêng tư (Privacy Breach / PII)</option>
              <option value="Hành vi nguy hiểm">Hành vi nguy hiểm (Malicious Payload)</option>
              <option value="Khác">Lý do khác</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-description-input" className="text-body-sm font-medium text-on-surface block mb-1">
              {t('Mô tả chi tiết & bằng chứng')}
            </label>
            <textarea
              id="report-description-input"
              rows={4}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder={t('Mô tả chi tiết sự cố hoặc bằng chứng vi phạm...')}
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>
              {t('Đóng')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={true}
              title={t('Chức năng đang chờ kết nối Backend')}
            >
              {t('Gửi báo cáo (Chờ Backend)')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
