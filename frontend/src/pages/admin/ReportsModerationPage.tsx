import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { listReportsForAdmin, reviewReport, type AdminReport, type ModerationAction, type ReportStatus } from '../../services/reportApi';
import { formatBackendErrorMessage } from '../../services/authApi';

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Đang mở' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Under Investigation', label: 'Đang điều tra' },
  { value: 'Resolved', label: 'Đã xử lý' },
  { value: 'Dismissed', label: 'Đã bác' },
];

export const ReportsModerationPage: React.FC = () => {
  const { t } = useLanguage();

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const page = await listReportsForAdmin(1, 50, statusFilter === 'all' ? undefined : statusFilter);
      if (signal?.aborted) return;
      setReports(page.items);
      setTotal(page.total);
    } catch (err) {
      if (signal?.aborted) return;
      // A failed read must be visible: an empty queue would wrongly suggest there is nothing
      // to moderate when the backend simply could not be reached.
      setReports([]);
      setTotal(0);
      setError(formatBackendErrorMessage(err));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const decide = async (report: AdminReport, action: ModerationAction) => {
    const note = typeof window !== 'undefined' && typeof window.prompt === 'function'
      ? window.prompt(`Lý do cho quyết định ${action}:`, action === 'Restore' ? 'Nội dung đã khắc phục' : 'Vi phạm đã xác nhận')
      : null;
    if (note === null) return;
    if (note.trim().length === 0) {
      setError('Cần nhập lý do cho quyết định.');
      return;
    }
    setBusyId(report.id);
    setError(null);
    setNotice(null);
    try {
      await reviewReport(report.id, { action, note: note.trim() });
      setNotice(`Đã ${action.toLowerCase()} báo cáo của API "${report.apiName ?? report.apiId}".`);
      await load();
    } catch (err) {
      setError(formatBackendErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Reports & Content Moderation Console')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Investigate reported APIs, security anomalies, copyright notices, and excessive upstream failure rates pursuant to Section 5.n.')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.value}
            size="sm"
            variant={statusFilter === tab.value ? 'primary' : 'outline'}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
        <span className="text-body-sm text-on-surface-variant ml-auto">Tổng: {total}</span>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>Thử lại</Button>
        </div>
      )}
      {notice && <p role="status" className="text-body-sm text-primary">{notice}</p>}

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-body-sm text-on-surface-variant">Đang tải báo cáo...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">gavel</span>
            <h3 className="text-headline-sm font-bold text-on-surface">{t('No Reports Filed')}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('There are currently no active abuse, infringement, or vulnerability reports.')}
            </p>
          </div>
        ) : (
          reports.map(rep => (
            <div
              key={rep.id}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-headline-sm text-on-surface">{rep.apiName ?? rep.apiId}</span>
                  <Badge variant={rep.status === 'Resolved' ? 'success' : rep.status === 'Dismissed' ? 'neutral' : 'danger'}>
                    {rep.status}
                  </Badge>
                  <Badge variant="warning">{rep.category}</Badge>
                  {rep.apiStatus && <Badge variant="neutral">{rep.apiStatus}</Badge>}
                </div>

                <p className="text-body-sm text-on-surface mb-3 leading-relaxed">"{rep.description}"</p>

                <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                  <span>{t('Filed:')} <span className="font-mono text-xs">{new Date(rep.createdAt).toLocaleDateString()}</span></span>
                  {rep.actionTaken && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">{t('Action:')} {rep.actionTaken}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {rep.apiStatus === 'Published' && (
                  <Button size="sm" variant="danger" icon="block" disabled={busyId === rep.id}
                    onClick={() => void decide(rep, 'Suspend')}>
                    {busyId === rep.id ? 'Đang xử lý...' : t('Suspend API & Resolve')}
                  </Button>
                )}
                {rep.apiStatus === 'Suspended' && (
                  <Button size="sm" variant="primary" icon="restart_alt" disabled={busyId === rep.id}
                    onClick={() => void decide(rep, 'Restore')}>
                    {busyId === rep.id ? 'Đang xử lý...' : 'Khôi phục API'}
                  </Button>
                )}
                {rep.status !== 'Resolved' && rep.status !== 'Dismissed' && (
                  <Button size="sm" variant="outline" disabled={busyId === rep.id}
                    onClick={() => void decide(rep, 'Dismiss')}>
                    {t('Dismiss')}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};