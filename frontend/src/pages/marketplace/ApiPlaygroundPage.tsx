import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MethodBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useLanguage } from '../../i18n';

export const ApiPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { apis, executeGatewayCall, apiKeys } = useApp();
  const { t } = useLanguage();

  const api = apis.find(a => a.id === id) || apis[0];
  const queryEp = searchParams.get('endpoint');

  const [selectedEndpointPath, setSelectedEndpointPath] = useState(
    queryEp || api.endpoints[0]?.path || '/v4/chat/completions'
  );

  const selectedEndpoint = api.endpoints.find(e => e.path === selectedEndpointPath) || api.endpoints[0];

  const [apiKeyInput, setApiKeyInput] = useState(
    apiKeys.find(k => k.apiId === api.id && !k.isRevoked)?.keyPrefix || 'ak_sand_ephemeral_demo_8f9a'
  );

  const [requestBody, setRequestBody] = useState(
    selectedEndpoint?.sampleRequest || '{\n  "model": "neural-v4-turbo",\n  "messages": [\n    {\n      "role": "user",\n      "content": "Explain API Gateway architecture."\n    }\n  ]\n}'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    statusCode: number;
    latencyMs: number;
    data: any;
    headers: Record<string, string>;
  } | null>(null);

  // Update request body when endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      setRequestBody(selectedEndpoint.sampleRequest || '{\n  "prompt": "Hello world"\n}');
    }
  }, [selectedEndpointPath]);

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      const result = await executeGatewayCall(
        api.id,
        selectedEndpointPath,
        selectedEndpoint?.method || 'POST',
        apiKeyInput,
        requestBody
      );
      setResponseResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/marketplace" className="hover:text-primary">{t('Marketplace')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to={`/api/${api.id}`} className="hover:text-primary">{api.name}</Link>
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
            <span>{t('Try Before Subscribe')}</span>
          </Link>
          <Link
            to={`/api/${api.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high text-body-sm text-on-surface font-medium hover:bg-surface-container-highest transition-colors"
          >
            {t('API Overview')}
          </Link>
        </div>
      </div>

      {/* SSRF Safeguard Warning Banner (US-18 requirement) */}
      <div className="mb-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">{t('SSRF Protection Active (US-18):')} </strong>
          {t('Gateway proxy strictly enforces route allowlists and blocks loopback, AWS metadata (169.254.169.254), and private subnet addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).')}
        </div>
      </div>

      {/* Playground Workbench Layout: 2-column request / response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Request Configuration */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
              {t('Request Builder')}
            </h3>

            {/* Endpoint Selector Bar */}
            <div className="mb-4">
              <label className="text-body-sm font-medium text-on-surface block mb-1.5">{t('Select Endpoint')}</label>
              <div className="flex items-center gap-2 p-2 bg-surface-container rounded-xl border border-outline-variant/30">
                <MethodBadge method={selectedEndpoint?.method || 'POST'} />
                <select
                  value={selectedEndpointPath}
                  onChange={(e) => setSelectedEndpointPath(e.target.value)}
                  className="bg-transparent flex-1 text-on-surface font-code-md text-body-sm outline-none cursor-pointer"
                >
                  {api.endpoints.map(ep => (
                    <option key={ep.id} value={ep.path}>
                      {ep.method} {ep.path} — {ep.summary}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* API Key Header */}
            <div className="mb-4">
              <label className="text-body-sm font-medium text-on-surface block mb-1.5">
                {t('X-API-Key Header (Simulated Sandbox Credentials)')}
              </label>
              <div className="flex items-center bg-surface-container rounded-xl border border-outline-variant/30 px-3 py-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">key</span>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={t('Enter or select API Key')}
                  className="w-full bg-transparent font-code-md text-code-sm text-on-surface focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1 block">
                {t('Hash verification and rate limit counters run against Redis emulation.')}
              </span>
            </div>

            {/* Request Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-body-sm font-medium text-on-surface">{t('Request Body (JSON)')}</label>
                <button
                  onClick={() => {
                    try {
                      setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2));
                    } catch {
                      // ignore parse errors
                    }
                  }}
                  className="text-label-md text-primary hover:underline font-medium"
                >
                  {t('Format JSON')}
                </button>
              </div>
              <textarea
                rows={9}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full p-3 font-code-md text-code-sm bg-[#121724] text-slate-200 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant font-code-sm">
              {t('Target:')} <code className="text-primary">{api.baseUrl}{selectedEndpointPath}</code>
            </span>
            <Button
              variant="primary"
              size="lg"
              icon="send"
              loading={isLoading}
              onClick={handleSendRequest}
            >
              {t('Send Request')}
            </Button>
          </div>
        </div>

        {/* Right Column: Response Inspector */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">data_object</span>
                {t('Gateway Response')}
              </h3>

              {responseResult && (
                <div className="flex items-center gap-2">
                  <Badge variant={responseResult.statusCode === 200 ? 'success' : 'danger'}>
                    HTTP {responseResult.statusCode}
                  </Badge>
                  <span className="text-code-sm font-code-md text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                    {responseResult.latencyMs} ms
                  </span>
                </div>
              )}
            </div>

            {responseResult ? (
              <div className="space-y-4">
                {/* Headers bar */}
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20 text-body-sm">
                  <span className="text-label-md font-semibold text-on-surface uppercase block mb-1.5">
                    {t('Gateway Injected Headers')}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-code-sm font-code-md text-on-surface-variant">
                    {Object.entries(responseResult.headers).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-on-surface font-medium">{k}:</span> {v}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Payload */}
                <div>
                  <span className="text-label-md font-semibold text-on-surface uppercase block mb-1.5">
                    {t('Response Body')}
                  </span>
                  <CodeBlock
                    code={JSON.stringify(responseResult.data, null, 2)}
                    language="json"
                    title={`Response - ${responseResult.statusCode}`}
                  />
                </div>
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-highest/20">
                <span className="material-symbols-outlined text-[44px] text-outline mb-2">http</span>
                <p className="text-body-md font-medium text-on-surface">{t('No Request Sent Yet')}</p>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {t('Click "Send Request" to trigger an authentic API Gateway proxy execution.')}
                </p>
              </div>
            )}
          </div>

          {/* Quick cURL generator footer */}
          <div className="pt-4 mt-4 border-t border-outline-variant/30 text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{t('Auto-logged:')}</span> {t('All test calls appear in your')}{' '}
            <Link to="/dashboard/history" className="text-primary hover:underline">{t('Request History')}</Link>{' '}
            {t('with sensitive header redaction applied.')}
          </div>
        </div>

      </div>
    </div>
  );
};
