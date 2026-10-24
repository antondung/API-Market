import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MethodBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import { PublicApiUnavailable } from '../../components/marketplace/PublicApiUnavailable';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedTabs } from '../../components/motion/AnimatedTabs';
import { getMarketplaceApiDetail } from '../../services/marketplaceApi';
import type {
  MarketplaceApiDetail,
  MarketplaceEndpoint,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';
import {
  generateCurlSnippet,
  generateFetchSnippet,
  generatePythonSnippet,
} from '../../utils/apiSnippetGenerator';

export const ApiPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const queryEp = searchParams.get('endpoint');
  const queryMethod = searchParams.get('method');

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headerParams, setHeaderParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState('{\n  "query": "test"\n}');
  const [jsonValidStatus, setJsonValidStatus] = useState<string | null>(null);

  // Tabs
  const [requestTab, setRequestTab] = useState<'params' | 'headers' | 'body'>('params');
  const [rightPanelTab, setRightPanelTab] = useState<'snippets' | 'response'>('snippets');
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python'>('curl');

  // Proxy advisory modal
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const initEndpointParams = (ep: MarketplaceEndpoint) => {
    const qParams: Record<string, string> = {};
    const hParams: Record<string, string> = {};

    if (Array.isArray(ep.parameters)) {
      ep.parameters.forEach((p: any) => {
        const name = p?.name;
        if (!name) return;
        if (p.in === 'query') {
          qParams[name] = p.default !== undefined ? String(p.default) : '';
        } else if (p.in === 'header') {
          hParams[name] = p.default !== undefined ? String(p.default) : '';
        }
      });
    }

    setQueryParams(qParams);
    setHeaderParams(hParams);

    if (ep.requestSchema) {
      setRequestBody(JSON.stringify(ep.requestSchema, null, 2));
    } else if (ep.method.toUpperCase() === 'GET' || ep.method.toUpperCase() === 'DELETE') {
      setRequestBody('');
    } else {
      setRequestBody('{\n  "example": true\n}');
    }
  };

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMarketplaceApiDetail(id, controller.signal);
        if (controller.signal.aborted) return;
        setApi(data);

        if (data.endpoints && data.endpoints.length > 0) {
          const matched = (queryEp && queryMethod)
            ? data.endpoints.find(e => e.path === queryEp && e.method.toUpperCase() === queryMethod.toUpperCase())
            : (queryEp ? data.endpoints.find(e => e.path === queryEp) : data.endpoints[0]);

          const initialEndpoint = matched || data.endpoints[0];
          setSelectedEndpointId(initialEndpoint.id);
          initEndpointParams(initialEndpoint);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', 'Lỗi tải chi tiết'));
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
  }, [id, queryEp, queryMethod]);

  const selectedEndpoint = useMemo(() => {
    if (!api || !api.endpoints) return null;
    return api.endpoints.find(e => e.id === selectedEndpointId) || api.endpoints[0] || null;
  }, [api, selectedEndpointId]);

  const handleEndpointSelect = (newId: string) => {
    setSelectedEndpointId(newId);
    const ep = api?.endpoints.find(e => e.id === newId);
    if (ep) {
      initEndpointParams(ep);
    }
  };

  // Generate dynamic cURL command via hardened generator
  const generatedCurl = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generateCurlSnippet({
      method: selectedEndpoint.method,
      urlPath: selectedEndpoint.path,
      apiKey: apiKeyInput.trim() || 'YOUR_API_KEY',
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, apiKeyInput, queryParams, headerParams, requestBody]);

  // Generate JavaScript fetch via hardened generator
  const generatedJs = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generateFetchSnippet({
      method: selectedEndpoint.method,
      urlPath: selectedEndpoint.path,
      apiKey: apiKeyInput.trim() || 'YOUR_API_KEY',
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, apiKeyInput, queryParams, headerParams, requestBody]);

  // Generate Python requests via hardened generator
  const generatedPython = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generatePythonSnippet({
      method: selectedEndpoint.method,
      urlPath: selectedEndpoint.path,
      apiKey: apiKeyInput.trim() || 'YOUR_API_KEY',
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, apiKeyInput, queryParams, headerParams, requestBody]);

  const activeSnippet = useMemo(() => {
    if (codeLang === 'curl') return generatedCurl;
    if (codeLang === 'javascript') return generatedJs;
    return generatedPython;
  }, [codeLang, generatedCurl, generatedJs, generatedPython]);

  const copyToClipboard = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(activeSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      } catch {
        // clipboard access denied - do not show false positive copy success
      }
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
      setJsonValidStatus('JSON hợp lệ');
      setTimeout(() => setJsonValidStatus(null), 2000);
    } catch (e: any) {
      setJsonValidStatus('Lỗi cú pháp: ' + (e?.message || 'Invalid JSON'));
      setTimeout(() => setJsonValidStatus(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-48 mb-6" />
        <div className="h-10 bg-surface-container-high rounded w-96 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-96 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  if (error || !api || !api.endpoints || api.endpoints.length === 0) {
    return <PublicApiUnavailable />;
  }

  return (
    <PageReveal className="pt-20 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to={`/api/${api.id}`} className="hover:text-primary transition-colors">{api.name}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">{t('Interactive Playground')}</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
            {t('API Playground & Gateway Sandbox')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/api/${api.id}/try-sandbox`}
            className="px-3.5 py-1.5 rounded-xl border border-outline-variant text-body-sm text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            <span>{t('Try Sandbox')}</span>
          </Link>
          <Link
            to={`/api/${api.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high text-body-sm text-on-surface font-medium hover:bg-surface-container-highest transition-colors"
          >
            {t('API Overview')}
          </Link>
        </div>
      </div>

      {/* Gateway Proxy Status Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] mt-0.5 flex-shrink-0">
          security
        </span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">
            {t('Chính sách Gateway Proxy & Chống SSRF:')}
          </strong>{' '}
          {t('Để bảo vệ hệ thống và tuân thủ chính sách bảo mật SSRF, trình duyệt không gọi trực tiếp URL máy chủ của nhà cung cấp. Các lệnh gọi API được định tuyến an toàn qua Gateway trung tâm. Vui lòng sử dụng lệnh cURL bên dưới để chạy trực tiếp trên môi trường của bạn.')}
        </div>
      </div>

      {/* Playground Workbench Layout: 2-column request / response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Request Configuration */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                {t('Request Builder')}
              </h3>
              <span className="text-body-xs font-code-sm text-on-surface-variant">
                Endpoint: <code className="text-primary font-bold">{selectedEndpoint?.path}</code>
              </span>
            </div>

            {/* Endpoint Selector Bar */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1.5">{t('Select Endpoint')}</label>
              <div className="flex items-center gap-2 p-2 bg-surface-container rounded-xl border border-outline-variant/30">
                <MethodBadge method={selectedEndpoint?.method as any || 'GET'} />
                <select
                  value={selectedEndpointId}
                  onChange={(e) => handleEndpointSelect(e.target.value)}
                  className="bg-transparent flex-1 text-on-surface font-code-md text-body-sm outline-none cursor-pointer"
                >
                  {api.endpoints.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.method} {ep.path} {ep.description ? `— ${ep.description.slice(0, 30)}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Request Configuration Tabs */}
            <div className="pt-1">
              <AnimatedTabs
                tabs={[
                  { id: 'params', label: `${t('Query Params')} (${Object.keys(queryParams).length})`, icon: 'tune' },
                  { id: 'headers', label: `${t('Headers')} (${Object.keys(headerParams).length + 1})`, icon: 'view_headline' },
                  { id: 'body', label: t('Body'), icon: 'data_object' },
                ]}
                activeTab={requestTab}
                onChange={(tabId) => setRequestTab(tabId as typeof requestTab)}
                layoutId="playground-request-tabs"
              />
            </div>

            {/* Tab: Query Params */}
            {requestTab === 'params' && (
              <div className="space-y-3">
                {Object.keys(queryParams).length === 0 ? (
                  <div className="p-6 text-center text-body-xs text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant/20">
                    {t('Endpoint này không yêu cầu tham số query.')}
                  </div>
                ) : (
                  <div className="space-y-2 bg-surface-container p-3.5 rounded-xl border border-outline-variant/20">
                    {Object.entries(queryParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-1/3 font-code-sm text-on-surface font-medium truncate" title={key}>
                          {key}
                        </span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                          placeholder={`Giá trị ${key}`}
                          className="flex-1 bg-surface-container-high px-2.5 py-1.5 rounded-lg text-body-sm font-code-sm text-on-surface outline-none border border-outline-variant/30 focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Headers */}
            {requestTab === 'headers' && (
              <div className="space-y-3">
                <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/20 space-y-3">
                  <div>
                    <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">
                      X-API-Key (Sandbox Authorization)
                    </label>
                    <div className="flex items-center bg-surface-container-high rounded-lg border border-outline-variant/30 px-3 py-1.5">
                      <span className="material-symbols-outlined text-on-surface-variant text-[16px] mr-2">key</span>
                      <input
                        type="text"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={t('Enter API Key')}
                        className="w-full bg-transparent font-code-md text-code-sm text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>

                  {Object.entries(headerParams).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setHeaderParams({ ...headerParams, [key]: e.target.value })}
                        className="w-full bg-surface-container-high px-3 py-1.5 rounded-lg text-code-sm font-code-sm text-on-surface outline-none border border-outline-variant/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Request Body */}
            {requestTab === 'body' && (
              <div className="space-y-2">
                {selectedEndpoint && (selectedEndpoint.method.toUpperCase() === 'GET' || selectedEndpoint.method.toUpperCase() === 'DELETE') ? (
                  <div className="p-6 text-center text-body-xs text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant/20">
                    {t('Phương thức HTTP')} {selectedEndpoint.method} {t('không sử dụng Request Body.')}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-body-xs font-semibold text-on-surface-variant">
                        {t('Payload JSON Body')}
                      </label>
                      <div className="flex items-center gap-2">
                        {jsonValidStatus && (
                          <span className={`text-[11px] font-medium ${jsonValidStatus.startsWith('Lỗi') ? 'text-error' : 'text-emerald-600'}`}>
                            {jsonValidStatus}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleFormatJson}
                          className="text-label-md text-primary hover:underline font-medium cursor-pointer"
                        >
                          {t('Format JSON')}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full p-3 font-code-md text-code-sm bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="pt-4 mt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-body-xs text-on-surface-variant">
              {t('Yêu cầu định tuyến an toàn qua Gateway')}
            </span>
            <Button
              variant="primary"
              size="md"
              icon="send"
              disabled={true}
              title={t('Tính năng gửi request trực tiếp yêu cầu Gateway Proxy trong Sprint 4 để bảo vệ chống SSRF')}
              onClick={() => setProxyModalOpen(true)}
            >
              {t('Send Request')}
            </Button>
          </div>
        </div>

        {/* Right Column: Code Generator & Response Preview */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <AnimatedTabs
                tabs={[
                  { id: 'snippets', label: t('Code Snippets'), icon: 'code' },
                  { id: 'response', label: t('Response Schema'), icon: 'data_object' },
                ]}
                activeTab={rightPanelTab}
                onChange={(tabId) => setRightPanelTab(tabId as typeof rightPanelTab)}
                layoutId="playground-right-panel-tabs"
              />
              {rightPanelTab === 'snippets' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedSnippet ? 'check' : 'content_copy'}
                  onClick={copyToClipboard}
                >
                  {copiedSnippet ? t('Copied!') : t('Copy Snippet')}
                </Button>
              )}
            </div>

            {rightPanelTab === 'snippets' && (
              <>
                <div className="flex items-center gap-2">
                  {(['curl', 'javascript', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLang(lang)}
                      className={`px-3 py-1 rounded-lg text-body-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        codeLang === lang
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript (fetch)' : 'Python'}
                    </button>
                  ))}
                </div>

                <CodeBlock
                  code={activeSnippet}
                  language={codeLang === 'curl' ? 'bash' : codeLang}
                />
              </>
            )}

            {rightPanelTab === 'response' && (
              <div>
                <div className="text-body-xs text-on-surface-variant mb-2 flex items-center justify-between">
                  <span>{t('Dự kiến kết quả phản hồi (Expected 200 OK):')}</span>
                  {Boolean(selectedEndpoint?.responseExample) && <span className="text-emerald-600 font-bold text-xs">200 OK</span>}
                </div>
                <CodeBlock
                  code={
                    selectedEndpoint?.responseExample
                      ? (typeof selectedEndpoint.responseExample === 'string'
                          ? selectedEndpoint.responseExample
                          : JSON.stringify(selectedEndpoint.responseExample, null, 2))
                      : JSON.stringify({
                          status: 'success',
                          code: 200,
                          message: 'Gateway proxy returns sanitized upstream response payload.',
                          endpoint: selectedEndpoint?.path,
                          method: selectedEndpoint?.method,
                          timestamp: '2026-10-24T22:00:00.000Z',
                          sample: true,
                        }, null, 2)
                  }
                  language="json"
                />
              </div>
            )}

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <h4 className="text-body-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                {t('Hướng dẫn kiểm thử:')}
              </h4>
              <ol className="text-body-xs text-on-surface-variant list-decimal pl-4 space-y-1">
                <li>{t('Sao chép lệnh cURL ở trên vào Terminal hoặc ứng dụng Postman.')}</li>
                <li>{t('Thay thế YOUR_API_KEY bằng API Key thật hoặc khóa Sandbox được cấp.')}</li>
                <li>{t('Tất cả lưu lượng được kiểm soát an toàn và tính vào hạn mức người dùng.')}</li>
              </ol>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-outline-variant/30 text-body-xs text-on-surface-variant">
            {t('Gateway SSRF Guard đảm bảo các địa chỉ loopback (127.0.0.1) và mạng nội bộ không thể bị xâm nhập.')}
          </div>
        </div>

      </div>

      {/* Proxy Advisory Modal */}
      <Modal
        isOpen={proxyModalOpen}
        onClose={() => setProxyModalOpen(false)}
        title={t('Gateway SSRF Proxy Notice')}
        description={t('Thông báo kết nối qua API Gateway')}
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]">shield</span>
              <span>{t('Gateway Proxy đang phát triển')}</span>
            </div>
            <p className="text-body-xs leading-relaxed">
              {t('Để tuân thủ tiêu chuẩn an toàn bảo mật SSRF (ngăn chặn trình duyệt quét cổng hoặc gọi trái phép các subnet nội bộ), lệnh gọi API trong môi trường trực tiếp yêu cầu Gateway Proxy server-side.')}
            </p>
          </div>

          <p className="text-body-sm text-on-surface">
            {t('Vui lòng sao chép lệnh cURL đã tạo để thực thi trực tiếp từ terminal của bạn:')}
          </p>

          <CodeBlock
            code={generatedCurl}
            language="bash"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setProxyModalOpen(false)}
            >
              {t('Đóng')}
            </Button>
            <Button
              variant="primary"
              icon={copiedSnippet ? 'check' : 'content_copy'}
              onClick={copyToClipboard}
            >
              {copiedSnippet ? t('Copied!') : t('Copy cURL')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
