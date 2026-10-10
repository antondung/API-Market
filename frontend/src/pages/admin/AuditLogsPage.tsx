import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filterType !== 'all' && log.targetType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Enterprise Audit Logs & Administrative Activity')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Immutable historical trail of administrative mutations, policy changes, and security events.')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-body-sm font-semibold text-on-surface-variant">{t('Scope Filter:')}</span>
        {['all', 'USER', 'API', 'PROVIDER', 'SUBSCRIPTION', 'SECURITY'].map(f => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1 rounded-lg text-body-sm transition-colors uppercase font-medium ${
              filterType === f
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f === 'all' ? t('All Scopes') : f}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('Timestamp')}</th>
              <th className="px-5 py-3.5">{t('Actor')}</th>
              <th className="px-5 py-3.5">{t('Action Code')}</th>
              <th className="px-5 py-3.5">{t('Target Scope')}</th>
              <th className="px-5 py-3.5">{t('Target ID')}</th>
              <th className="px-5 py-3.5">{t('Details')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">receipt_long</span>
                    <p className="font-semibold text-on-surface">{t('No audit log entries')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('Administrative operations, policy adjustments, and access reviews will appear here in chronological order.')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-3.5 font-code-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-on-surface block">{log.actorEmail}</span>
                    <span className="text-[11px] font-code-sm text-on-surface-variant uppercase">{log.actorRole}</span>
                  </td>
                  <td className="px-5 py-3.5 font-code-md text-primary font-bold">
                    {log.action}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="neutral" size="sm">{log.targetType}</Badge>
                  </td>
                  <td className="px-5 py-3.5 font-code-sm text-on-surface-variant">
                    {log.targetId}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
