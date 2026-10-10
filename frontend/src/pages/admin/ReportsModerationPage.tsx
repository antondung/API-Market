import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const ReportsModerationPage: React.FC = () => {
  const { reports, resolveReport, updateApiStatus } = useApp();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Reports & Content Moderation Console')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Investigate reported APIs, security anomalies, copyright notices, and excessive upstream failure rates pursuant to Section 5.n.')}
        </p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
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
                  <span className="font-bold text-headline-sm text-on-surface">{rep.apiName}</span>
                  <Badge variant={rep.status === 'Resolved' ? 'success' : 'danger'}>{rep.status}</Badge>
                  <Badge variant="warning">{rep.category}</Badge>
                </div>

                <p className="text-body-sm text-on-surface mb-3 leading-relaxed">
                  "{rep.description}"
                </p>

                <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                  <span>{t('Reporter:')} <strong className="text-on-surface">{rep.reportedBy}</strong> ({rep.reporterEmail})</span>
                  <span>•</span>
                  <span>{t('Filed:')} <span className="font-mono text-xs">{new Date(rep.createdAt).toLocaleDateString()}</span></span>
                  {rep.actionTaken && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">{t('Action:')} {rep.actionTaken}</span>
                    </>
                  )}
                </div>
              </div>

              {rep.status !== 'Resolved' && (
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="danger"
                    icon="block"
                    onClick={() => {
                      updateApiStatus(rep.apiId, 'Suspended', `Suspended due to report ${rep.id}: ${rep.description}`);
                      resolveReport(rep.id, 'API immediately suspended from public gateway and report resolved.');
                    }}
                  >
                    {t('Suspend API & Resolve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon="task_alt"
                    onClick={() => resolveReport(rep.id, 'Investigated and marked resolved by Admin.')}
                  >
                    {t('Resolve Only')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveReport(rep.id, 'Dismissed as false positive.')}
                  >
                    {t('Dismiss')}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
