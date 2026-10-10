import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const ApiReviewsPage: React.FC = () => {
  const { apis, updateApiStatus } = useApp();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('API Review & Publishing Approval Console')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Administer the publication lifecycle: Approve, Publish, Suspend, or Restore APIs on the global Marketplace.')}
        </p>
      </div>

      <div className="space-y-4">
        {apis.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">rate_review</span>
            <h3 className="text-headline-sm font-bold text-on-surface">{t('No APIs in Submission Queue')}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('There are currently no APIs submitted by providers pending SecOps review or approval.')}
            </p>
          </div>
        ) : (
          apis.map(api => (
            <div
              key={api.id}
            className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">{api.icon}</span>
                </div>
                <h3 className="text-headline-sm font-bold text-on-surface">{api.name}</h3>
                <span className="font-code-sm text-on-surface-variant">v{api.version}</span>
                <StatusBadge status={api.status} />
              </div>

              <p className="text-body-sm text-on-surface-variant mb-3 max-w-2xl">
                {api.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                <span>{t('Provider:')} <strong className="text-on-surface">{api.providerName}</strong></span>
                <span>•</span>
                <span>{t('Category:')} <Badge variant="primary" size="sm">{t(api.category)}</Badge></span>
                <span>•</span>
                <span>{t('Endpoints:')} <strong className="font-code-md text-on-surface">{api.endpoints.length}</strong></span>
                <span>•</span>
                <span>{t('Base URL:')} <code className="text-primary font-code-sm">{api.baseUrl}</code></span>
              </div>
            </div>

            {/* Admin State Mutation Controls */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {api.status === 'Submitted' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon="check"
                  onClick={() => updateApiStatus(api.id, 'Approved', 'Approved by SecOps audit')}
                >
                  {t('Approve API')}
                </Button>
              )}

              {api.status === 'Approved' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon="public"
                  onClick={() => updateApiStatus(api.id, 'Published', 'Published to Marketplace')}
                >
                  {t('Publish Live')}
                </Button>
              )}

              {api.status === 'Published' && (
                <Button
                  size="sm"
                  variant="danger"
                  icon="block"
                  onClick={() => {
                    if (confirm(`Emergency suspend API "${api.name}"? Upstream traffic will immediately return 403.`)) {
                      updateApiStatus(api.id, 'Suspended', 'Suspended due to administrative security audit');
                    }
                  }}
                >
                  {t('Suspend API')}
                </Button>
              )}

              {api.status === 'Suspended' && (
                <Button
                  size="sm"
                  variant="primary"
                  icon="restore"
                  onClick={() => updateApiStatus(api.id, 'Published', 'Restored to marketplace')}
                >
                  {t('Restore to Published')}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`/api/${api.id}`, '_blank')}
              >
                {t('Inspect Specs')}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
};
