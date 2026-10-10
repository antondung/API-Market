import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge, MethodBadge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import type { HttpMethod } from '../../types';

export const OpenApiImportPage: React.FC = () => {
  const { apis, updateApi } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedApiId, setSelectedApiId] = useState(apis[0]?.id || '');
  const [openApiSpec, setOpenApiSpec] = useState(`{
  "openapi": "3.0.0",
  "info": {
    "title": "API Service",
    "version": "1.0.0",
    "description": "Production API endpoints specification"
  },
  "servers": [
    { "url": "https://api.example.com/v1" }
  ],
  "paths": {}
}`);

  const [parsedEndpoints, setParsedEndpoints] = useState<{
    path: string;
    method: HttpMethod;
    summary: string;
  }[]>([]);

  const [parseError, setParseError] = useState<string | null>(null);

  if (apis.length === 0) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">file_upload</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('No APIs in Portfolio')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{t('Create an API first before importing OpenAPI / Swagger documentation.')}</p>
        <Button variant="primary" icon="add" onClick={() => navigate('/provider/create-api')}>
          {t('Create Your First API')}
        </Button>
      </div>
    );
  }

  const handleParseSpec = () => {
    try {
      setParseError(null);
      const parsed = JSON.parse(openApiSpec);
      if (!parsed.paths) {
        throw new Error('Missing paths object in OpenAPI document.');
      }

      const extracted: { path: string; method: HttpMethod; summary: string }[] = [];
      for (const [routePath, routeMethods] of Object.entries(parsed.paths as Record<string, any>)) {
        for (const [httpMethod, methodObj] of Object.entries(routeMethods as Record<string, any>)) {
          extracted.push({
            path: routePath,
            method: httpMethod.toUpperCase() as HttpMethod,
            summary: (methodObj as any)?.summary || 'Imported via OpenAPI spec'
          });
        }
      }

      setParsedEndpoints(extracted);
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleApplyToApi = () => {
    if (parsedEndpoints.length === 0) return;

    const newEndpoints = parsedEndpoints.map((ep, idx) => ({
      id: `ep_import_${Date.now()}_${idx}`,
      path: ep.path,
      method: ep.method,
      summary: ep.summary,
      description: ep.summary,
      rateLimitPerSec: 25,
      parameters: [],
      sampleResponse: JSON.stringify({ status: 'success', endpoint: ep.path }, null, 2)
    }));

    updateApi(selectedApiId, {
      endpoints: newEndpoints
    });

    navigate(`/provider/endpoints?api=${selectedApiId}`);
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('OpenAPI / Swagger Auto-Documentation Workspace')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Upload or paste standard OpenAPI 3.0+ JSON schemas to automatically generate endpoint routing, parameter tables, and SDK documentation.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Schema */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-body-sm font-semibold text-on-surface">{t('Target API Product')}</label>
              <select
                value={selectedApiId}
                onChange={(e) => setSelectedApiId(e.target.value)}
                className="p-2 rounded-xl border border-outline-variant/40 bg-surface-container text-body-sm font-semibold text-on-surface outline-none"
              >
                {apis.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-sm font-semibold text-on-surface">{t('OpenAPI 3.0 Specification (JSON)')}</span>
              <button
                onClick={() => handleParseSpec()}
                className="text-label-md text-primary font-bold hover:underline"
              >
                {t('Parse & Validate')}
              </button>
            </div>

            <textarea
              rows={16}
              value={openApiSpec}
              onChange={(e) => setOpenApiSpec(e.target.value)}
              className="w-full p-3 font-code-md text-code-sm bg-[#111625] text-slate-200 border border-outline-variant/40 rounded-xl outline-none resize-none"
            />

            {parseError && (
              <p className="text-body-sm text-error mt-2 font-medium">⚠️ {parseError}</p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-outline-variant/30 flex justify-end">
            <Button variant="primary" icon="search" onClick={handleParseSpec}>
              {t('Validate & Preview Endpoints')}
            </Button>
          </div>
        </div>

        {/* Right: Live Preview of Extracted Endpoints */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-sm font-bold text-on-surface">{t('Extracted Endpoints Preview')}</h3>
              <Badge variant="primary">{parsedEndpoints.length} {t('Routes Found')}</Badge>
            </div>

            {parsedEndpoints.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-[44px] text-outline mb-2">auto_stories</span>
                <p className="text-body-md font-medium text-on-surface">{t('No Endpoints Parsed Yet')}</p>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {t('Click "Validate & Preview" to parse OpenAPI schema paths.')}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {parsedEndpoints.map((ep, idx) => (
                  <div key={idx} className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={ep.method} />
                      <div>
                        <span className="font-code-md font-bold text-on-surface text-body-sm block">{ep.path}</span>
                        <span className="text-[12px] text-on-surface-variant">{ep.summary}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-outline-variant/30 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">
              {t('Replaces existing routes for selected API.')}
            </span>
            <Button
              variant="primary"
              size="md"
              disabled={parsedEndpoints.length === 0}
              icon="sync"
              onClick={handleApplyToApi}
            >
              {t('Sync to API Definition')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
