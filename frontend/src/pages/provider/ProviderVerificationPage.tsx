import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';

export const ProviderVerificationPage: React.FC = () => {
  const { verifications, submitProviderVerification } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const currentVer = verifications.find(v => v.providerId === currentUser.id);

  const [companyName, setCompanyName] = useState(currentVer?.companyName || currentUser.company || '');
  const [businessLicense, setBusinessLicense] = useState(currentVer?.businessLicense || '');
  const [taxCode, setTaxCode] = useState(currentVer?.taxCode || '');
  const [contactEmail, setContactEmail] = useState(currentVer?.contactEmail || currentUser.email || '');
  const [website, setWebsite] = useState(currentVer?.website || '');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitProviderVerification({
      companyName,
      businessLicense,
      taxCode,
      contactEmail,
      website
    });
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('API Provider Compliance & Identity Verification')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Pursuant to Platform Legal Policy (PDF section 8), providers must be verified prior to publishing commercial APIs.')}
        </p>
      </div>

      {/* Current Status Banner */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between ${
        currentVer?.status === 'Verified'
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : currentVer?.status === 'Pending'
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-surface-container-low border-outline-variant/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentVer?.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-700' : currentVer?.status === 'Pending' ? 'bg-amber-500/20 text-amber-700' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            <span className="material-symbols-outlined text-[28px]">
              {currentVer?.status === 'Verified' ? 'verified' : currentVer?.status === 'Pending' ? 'pending_actions' : 'verified_user'}
            </span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-on-surface">
              {t('Verification Status:')} {t(currentVer?.status ? currentVer.status : 'Chưa nộp hồ sơ')}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {currentVer?.status === 'Verified'
                ? t('Your credentials have been validated by Admin SecOps. You have full publishing privileges.')
                : currentVer?.status === 'Pending'
                ? t('Your submission is queued for compliance audit in the Admin Console.')
                : t('Vui lòng điền thông tin và nộp hồ sơ pháp lý doanh nghiệp để mở quyền xuất bản API thương mại.')}
            </p>
          </div>
        </div>
        <Badge variant={currentVer?.status === 'Verified' ? 'success' : currentVer?.status === 'Pending' ? 'warning' : 'neutral'}>
          {t(currentVer?.status ? currentVer.status : 'Chưa xác minh')}
        </Badge>
      </div>

      {/* Verification Form */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-headline-sm font-bold text-on-surface mb-6">{t('Business Entity Credentials')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Official Company / Organization Name')}</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Business Registration / Certificate ID')}</label>
              <input
                type="text"
                required
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Tax Identification Code (TIN / EIN / VAT)')}</label>
              <input
                type="text"
                required
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Compliance & Legal Contact Email')}</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Organization Technical Website')}</label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Legal Agreement */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
            <h4 className="text-body-md font-bold text-on-surface">{t('Provider Agreement Declaration')}</h4>
            <label className="flex items-start gap-2.5 text-body-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
              />
              <span className="text-on-surface-variant leading-relaxed">
                {t('I hereby attest that our organization legally owns or possesses legitimate distribution licenses for all APIs deployed on this platform. We accept liability for data privacy adherence (GDPR/CCPA) and agree that deceptive, scraping, or unverified upstream services are subject to immediate suspension by platform administration.')}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
            <span className="text-body-sm text-emerald-600 font-medium">
              {submittedMessage && t('Application submitted for compliance review!')}
            </span>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!agreementChecked}
            >
              {t('Update Verification Application')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
