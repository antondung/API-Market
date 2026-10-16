import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import {
  listAdminAuditLogs,
  getAdminAuditActions,
  type AdminAuditLog,
} from '../../services/adminReviewApi';
import { formatBackendErrorMessage } from '../../services/authApi';

export const AuditLogsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterScope, setFilterScope] = useState<string>('all');
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('all');

  // Session-bound request isolation refs
  const requestIdRef = useRef(0);
  const actionsRequestIdRef = useRef(0);
  const activeUserRef = useRef(currentUser?.id);

  // Reset and abort when admin user identity changes (e.g., Admin A -> Admin B or logout)
  useEffect(() => {
    const prevUserId = activeUserRef.current;
    activeUserRef.current = currentUser?.id;
    if (prevUserId !== currentUser?.id) {
      requestIdRef.current++;
      actionsRequestIdRef.current++;
      setLogs([]);
      setTotal(0);
      setError(null);
      setActionOptions([]);
      if (!currentUser) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  // Load distinct actions
  useEffect(() => {
    if (!currentUser) return;
    const controller = new AbortController();
    const actionsRequestId = ++actionsRequestIdRef.current;
    const requestUserId = currentUser?.id;

    getAdminAuditActions(controller.signal)
      .then(actions => {
        if (actionsRequestId === actionsRequestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setActionOptions(actions || []);
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => controller.abort();
  }, [currentUser?.id]);

  const fetchLogs = (currentPage = page, scope = filterScope, action = selectedAction) => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const requestUserId = currentUser?.id;

    if (!currentUser) {
      return () => controller.abort();
    }

    setLoading(true);
    setError(null);

    const query: Parameters<typeof listAdminAuditLogs>[0] = {
      page: currentPage,
      pageSize,
    };
    if (scope !== 'all') {
      query.targetType = scope;
    }
    if (action !== 'all') {
      query.action = action;
    }

    listAdminAuditLogs(query, controller.signal)
      .then(res => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setLogs(res.items || []);
          setTotal(res.total || 0);
        }
      })
      .catch(err => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setError(formatBackendErrorMessage(err));
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  };

  useEffect(() => {
    return fetchLogs(page, filterScope, selectedAction);
  }, [page, filterScope, selectedAction, currentUser?.id]);

  const handleScopeFilterChange = (scope: string) => {
    setFilterScope(scope);
    setPage(1);
  };

  const handleActionFilterChange = (act: string) => {
    setSelectedAction(act);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('Enterprise Audit Logs & Administrative Activity')}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Immutable historical trail of administrative mutations, policy changes, and security events (US-14).')}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-sm font-semibold text-on-surface-variant">{t('Scope Filter:')}</span>
          {['all', 'USER', 'API', 'PROVIDER', 'PROVIDER_VERIFICATION', 'API_REVIEW'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => handleScopeFilterChange(f)}
              className={`px-3 py-1 rounded-lg text-body-sm transition-colors uppercase font-medium ${
                filterScope === f
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f === 'all' ? t('All Scopes') : f}
            </button>
          ))}
        </div>

        {actionOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="audit-action-select" className="text-body-sm font-semibold text-on-surface-variant">Hành động:</label>
            <select
              id="audit-action-select"
              value={selectedAction}
              onChange={e => handleActionFilterChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none"
            >
              <option value="all">Tất cả hành động</option>
              {actionOptions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3 text-body-sm">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => fetchLogs()}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant animate-pulse">
                    Đang truy vấn nhật ký kiểm toán từ máy chủ...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">receipt_long</span>
                      <p className="font-semibold text-on-surface">{t('No audit log entries')}</p>
                      <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">
                        Chưa có bản ghi hoạt động nào phù hợp với bộ lọc đã chọn.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-on-surface block font-mono text-xs">
                        {log.actorId ? `User #${log.actorId}` : 'Hệ thống'}
                      </span>
                      <span className="text-[11px] font-mono text-on-surface-variant uppercase">
                        {log.actorRole || 'System'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-primary font-bold">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="neutral" size="sm">{log.targetType || 'N/A'}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant">
                      {log.targetId || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant leading-relaxed text-xs">
                      {log.detail ? (
                        <code className="font-mono bg-surface-container px-2 py-1 rounded block max-w-md truncate">
                          {JSON.stringify(log.detail)}
                        </code>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>
              Hiển thị {logs.length} / {total} bản ghi (Trang {page} / {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
