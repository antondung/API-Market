import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';

export const ProviderVerificationsPage: React.FC = () => {
  const { verifications, approveVerification, rejectVerification } = useApp();
  const { t } = useLanguage();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient legal corporate documentation provided.');

  const handleOpenReject = (id: string) => {
    setSelectedVerificationId(id);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVerificationId) {
      rejectVerification(selectedVerificationId, rejectReason);
      setRejectModalOpen(false);
      setSelectedVerificationId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Provider Identity & Compliance Verification Queue')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Audit provider corporate identities, business licenses, and tax codes pursuant to PDF section 8 & Backlog US-10.')}
        </p>
      </div>

      <div className="space-y-4">
        {verifications.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">verified_user</span>
            <h3 className="text-headline-sm font-bold text-on-surface">{t('No Verification Requests')}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('There are currently no provider corporate compliance or KYC verification requests pending audit.')}
            </p>
          </div>
        ) : (
          verifications.map(v => (
            <div
              key={v.id}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-headline-sm font-bold text-on-surface">{v.companyName}</h3>
                  <Badge variant={v.status === 'Verified' ? 'success' : v.status === 'Pending' ? 'warning' : 'danger'}>
                    {v.status}
                  </Badge>
                </div>

                <p className="text-body-sm text-on-surface-variant mb-3">
                  {t('Provider Admin:')} <strong className="text-on-surface">{v.providerName}</strong> ({v.providerId})
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-surface-container rounded-xl text-body-sm">
                  <div>
                    <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">{t('Business License')}</span>
                    <span className="font-code-md text-on-surface font-semibold">{v.businessLicense}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">{t('Tax Identification')}</span>
                    <span className="font-code-md text-on-surface font-semibold">{v.taxCode}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">{t('Official Contact')}</span>
                    <span className="text-on-surface font-code-sm">{v.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">{t('Website')}</span>
                    <a href={v.website} target="_blank" rel="noreferrer" className="text-primary hover:underline font-code-sm truncate block">
                      {v.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {v.status === 'Pending' ? (
                  <>
                    <Button
                      size="md"
                      variant="primary"
                      icon="check"
                      onClick={() => approveVerification(v.id)}
                    >
                      {t('Approve Provider')}
                    </Button>
                    <Button
                      size="md"
                      variant="danger"
                      icon="close"
                      onClick={() => handleOpenReject(v.id)}
                    >
                      {t('Reject')}
                    </Button>
                  </>
                ) : (
                  <span className="text-body-sm text-on-surface-variant font-code-sm">
                    {t('Audit Completed')} {v.reviewedAt ? new Date(v.reviewedAt).toLocaleDateString() : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={t('Reject Verification Application')}
        description={t('Provide justification notes for compliance audit logs')}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">{t('Rejection Reason')}</label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-body-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="danger">
              {t('Confirm Rejection')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
