import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MethodBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useLanguage } from '../../i18n';
import type { RequestLog } from '../../types';

export const RequestHistoryPage: React.FC = () => {
  const { requestLogs } = useApp();
  const { t } = useLanguage();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchEndpoint, setSearchEndpoint] = useState<string>('');
  const [activeLog, setActiveLog] = useState<RequestLog | null>(null);

  const filteredLogs = requestLogs.filter(log => {
    if (selectedStatus !== 'all' && log.statusCode.toString() !== selectedStatus) return false;
    if (searchEndpoint.trim() && !log.endpoint.toLowerCase().includes(searchEndpoint.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('API Request History & Logs')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Audit trail of Gateway requests. Sensitive tokens, credentials, and bodies are automatically redacted (US-24).')}
        </p>
      </div>

      {/* Honest Status Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
        <div>
          <strong className="text-on-surface font-semibold">Hiện trạng chức năng Sprint 3: </strong>
          <span>
            Hệ thống Gateway Data Plane thực thi an toàn qua SafeProxy với DNS pinning và chống SSRF. Dịch vụ lưu trữ nhật ký truy vấn cá nhân (Consumer Telemetry Stream) đang được hoàn thiện. Bạn có thể kiểm tra chi tiết phản hồi và độ trễ tức thời trực tiếp tại <strong>API Playground</strong>.
          </span>
        </div>
      </div>

      {/* Redaction Notice */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">visibility_off</span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">{t('Sensitive Data Redaction Active:')} </strong>
          Theo quy định bảo mật US-24, các header <code className="text-primary font-code-md">Authorization</code>, cookie và token payload được tự động che thành <code className="bg-surface-container-high px-1.5 py-0.5 rounded font-code-sm text-on-surface">[REDACTED]</code> trước khi lưu vào nhật ký lưu trữ.
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-semibold text-on-surface-variant">{t('Status:')}</span>
          {['all', '200', '401', '403', '429'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-body-sm transition-colors uppercase font-medium ${
                selectedStatus === st
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {st === 'all' ? t('All') : st}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-1.5 w-full sm:w-64">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder={t('Filter endpoint...')}
            value={searchEndpoint}
            onChange={(e) => setSearchEndpoint(e.target.value)}
            className="w-full bg-transparent text-body-sm text-on-surface outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Timestamp')}</th>
              <th className="px-5 py-3.5">{t('Method')}</th>
              <th className="px-5 py-3.5">{t('Endpoint')}</th>
              <th className="px-5 py-3.5">{t('API Product')}</th>
              <th className="px-5 py-3.5">{t('Status')}</th>
              <th className="px-5 py-3.5">{t('Latency')}</th>
              <th className="px-5 py-3.5">{t('IP Address')}</th>
              <th className="px-5 py-3.5 text-right">{t('Inspect')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">history</span>
                    <p className="font-semibold text-on-surface">{t('No telemetry logs captured')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('Execute calls via the API Playground or production endpoints to populate real-time Gateway telemetry.')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setActiveLog(log)}
                  className="hover:bg-surface-container/60 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-code-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <MethodBadge method={log.method} />
                  </td>
                  <td className="px-5 py-3.5 font-code-md font-semibold text-primary">
                    {log.endpoint}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface font-medium">
                    {log.apiName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-code-sm font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-600' :
                      log.statusCode === 429 ? 'bg-amber-500/10 text-amber-700' : 'bg-error-container text-on-error-container'
                    }`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-code-md text-emerald-600 font-semibold">
                    {log.latencyMs} ms
                  </td>
                  <td className="px-5 py-3.5 font-code-sm text-on-surface-variant">
                    {log.ipAddress}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveLog(log); }}
                      className="text-primary hover:underline font-code-sm text-xs"
                    >
                      {t('Details')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {activeLog && (
        <Modal
          isOpen={true}
          onClose={() => setActiveLog(null)}
          title={`Chi tiết Telemetry: ${activeLog.endpoint}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div>
                <span className="text-on-surface-variant block text-xs">Mã yêu cầu (Request ID):</span>
                <span className="font-code-sm font-bold text-on-surface">{activeLog.id}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-xs">Thời gian:</span>
                <span className="font-code-sm text-on-surface">{new Date(activeLog.timestamp).toISOString()}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-xs">Trạng thái HTTP:</span>
                <span className="font-code-sm font-bold text-emerald-600">{activeLog.statusCode}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-xs">Độ trễ Gateway:</span>
                <span className="font-code-sm font-bold text-emerald-600">{activeLog.latencyMs} ms</span>
              </div>
            </div>

            <div>
              <span className="text-body-sm font-semibold text-on-surface block mb-1">Headers đã Redacted:</span>
              <CodeBlock
                code={JSON.stringify(activeLog.redactedHeaders, null, 2)}
                language="json"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
