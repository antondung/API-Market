import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MethodBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import type { HttpMethod } from '../../types';

export const EndpointManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { apis, updateApi } = useApp();
  const { t } = useLanguage();

  const apiId = searchParams.get('api') || apis[0]?.id;
  const api = apis.find(a => a.id === apiId) || apis[0];

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [path, setPath] = useState('');
  const [summary, setSummary] = useState('');
  const [rateLimit, setRateLimit] = useState('25');
  const [sampleResponse, setSampleResponse] = useState('{\n  "status": "success"\n}');

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim()) return;

    const newEndpoint = {
      id: `ep_${Date.now()}`,
      path: path.startsWith('/') ? path : `/${path}`,
      method,
      summary,
      description: summary,
      rateLimitPerSec: parseInt(rateLimit) || 25,
      parameters: [],
      sampleResponse
    };

    updateApi(api.id, {
      endpoints: [...api.endpoints, newEndpoint]
    });

    setAddModalOpen(false);
    setPath('');
    setSummary('');
  };

  const handleDeleteEndpoint = (epId: string) => {
    if (confirm(t('Delete this endpoint from the routing registry?'))) {
      updateApi(api.id, {
        endpoints: api.endpoints.filter(e => e.id !== epId)
      });
    }
  };

  if (!api) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3">alt_route</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để quản lý Endpoint')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể thiết lập các tuyến đường Endpoint và phản hồi Mock.')}
        </p>
        <Link to="/provider/create-api" className="inline-block mt-6">
          <Button variant="primary" icon="add_circle">
            {t('Tạo API Mới')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{api.name}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Endpoint Route Management')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Define HTTP methods, route paths, parameter schemas, and specific Redis rate limit burst ceilings.')}
          </p>
        </div>
        <Button
          variant="primary"
          icon="add"
          onClick={() => setAddModalOpen(true)}
        >
          {t('Add Endpoint Route')}
        </Button>
      </div>

      {/* Endpoints Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Method')}</th>
              <th className="px-5 py-3.5">{t('Path Route')}</th>
              <th className="px-5 py-3.5">{t('Summary')}</th>
              <th className="px-5 py-3.5">{t('Velocity Limit')}</th>
              <th className="px-5 py-3.5">{t('Parameters')}</th>
              <th className="px-5 py-3.5 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {api.endpoints.map(ep => (
              <tr key={ep.id} className="hover:bg-surface-container/40 transition-colors">
                <td className="px-5 py-4">
                  <MethodBadge method={ep.method} />
                </td>
                <td className="px-5 py-4 font-code-md font-bold text-primary">
                  {ep.path}
                </td>
                <td className="px-5 py-4 text-on-surface-variant font-medium">
                  {ep.summary}
                </td>
                <td className="px-5 py-4 font-code-md font-semibold text-emerald-600">
                  {ep.rateLimitPerSec} req/sec
                </td>
                <td className="px-5 py-4 text-on-surface-variant">
                  {ep.parameters.length} params
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDeleteEndpoint(ep.id)}
                    className="p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"
                    title={t('Delete')}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Endpoint Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t('Add Upstream Endpoint Route')}
        description={`${t('Register a new HTTP endpoint for')} ${api.name}`}
      >
        <form onSubmit={handleAddEndpoint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('HTTP Method')}</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-semibold text-body-sm outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Endpoint Path')}</label>
              <input
                type="text"
                required
                placeholder="/v1/my-resource"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-code-md text-body-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Summary / Title')}</label>
            <input
              type="text"
              required
              placeholder={t('e.g. Query vectorized document chunks')}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Rate Limit Burst (req/sec)')}</label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-code-md text-body-sm outline-none"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Sample 200 OK Response (JSON)')}</label>
            <textarea
              rows={4}
              value={sampleResponse}
              onChange={(e) => setSampleResponse(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-[#111625] text-slate-200 font-code-md text-code-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('Register Route')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
