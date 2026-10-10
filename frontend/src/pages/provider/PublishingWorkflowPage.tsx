import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const PublishingWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { apis, submitApiForReview } = useApp();
  const { t } = useLanguage();

  const apiId = searchParams.get('api') || apis[0]?.id;
  const api = apis.find(a => a.id === apiId) || apis[0];

  const stages = [
    { key: 'Draft', label: t('1. Local Draft'), desc: t('Endpoint definition & pricing setup') },
    { key: 'Submitted', label: t('2. Submitted'), desc: t('Enqueued for compliance review') },
    { key: 'UnderReview', label: t('3. Admin Review'), desc: t('SecOps vulnerability & legal check') },
    { key: 'Approved', label: t('4. Approved'), desc: t('Passed audit, ready for production') },
    { key: 'Published', label: t('5. Published'), desc: t('Live on public API HUB Marketplace') }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Draft': return 0;
      case 'Submitted': return 1;
      case 'UnderReview': return 2;
      case 'Approved': return 3;
      case 'Published': return 4;
      default: return 0;
    }
  };

  if (!api) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-4xl">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3">publish</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để theo dõi xuất bản')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể kiểm tra danh mục sẵn sàng và nộp duyệt lên sàn.')}
        </p>
        <Link to="/provider/create-api" className="inline-block mt-6">
          <Button variant="primary" icon="add_circle">
            {t('Tạo API Mới')}
          </Button>
        </Link>
      </div>
    );
  }

  const currentIdx = getStageIndex(api.status);

  // Validation checklist
  const hasEndpoints = api.endpoints.length > 0;
  const hasPlans = api.plans.length > 0;
  const hasLegal = api.legalDeclarationCompleted;
  const hasVerification = api.providerVerified;
  const canSubmit = hasEndpoints && hasPlans && hasLegal && hasVerification && api.status === 'Draft';

  const handleSubmit = () => {
    const res = submitApiForReview(api.id);
    if (!res.success) {
      alert(`Submission blocked: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
          <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">{api.name}</span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Publishing Workflow & Status Tracker')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Track the state progression of your API product according to the state machine defined in US-12 & US-13.')}
        </p>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Workflow Stage Pipeline')}</h2>
            <p className="text-body-sm text-on-surface-variant">{t('Current Status:')} <StatusBadge status={api.status} /></p>
          </div>
          {canSubmit && (
            <Button variant="primary" icon="publish" onClick={handleSubmit}>
              {t('Submit for Admin Review')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {stages.map((st, idx) => {
            const isCompleted = currentIdx > idx || api.status === 'Published';
            const isCurrent = currentIdx === idx && api.status !== 'Published';

            return (
              <div
                key={st.key}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : isCompleted
                    ? 'bg-surface-container border-emerald-500/30'
                    : 'bg-surface-container/50 border-outline-variant/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-body-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-body-md">{st.label}</h3>
                    <p className="text-body-sm text-on-surface-variant">{st.desc}</p>
                  </div>
                </div>

                <span className={`text-label-md font-semibold uppercase ${
                  isCompleted ? 'text-emerald-600' : isCurrent ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {isCompleted ? t('Completed') : isCurrent ? t('Active Stage') : t('Pending')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Requirements Checklist */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="text-headline-sm font-bold text-on-surface mb-4">{t('Submission Readiness Checklist')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${hasEndpoints ? 'text-emerald-600' : 'text-error'}`}>
                {hasEndpoints ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-body-sm font-semibold text-on-surface">{t('Active Endpoints Declared')} ({api.endpoints.length})</span>
            </div>
            {!hasEndpoints && <Link to={`/provider/endpoints?api=${api.id}`} className="text-body-sm text-primary hover:underline">{t('Add Endpoint →')}</Link>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${hasPlans ? 'text-emerald-600' : 'text-error'}`}>
                {hasPlans ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-body-sm font-semibold text-on-surface">{t('Pricing Plans Configured')} ({api.plans.length})</span>
            </div>
            {!hasPlans && <Link to={`/provider/pricing?api=${api.id}`} className="text-body-sm text-primary hover:underline">{t('Add Plan →')}</Link>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${hasLegal ? 'text-emerald-600' : 'text-error'}`}>
                {hasLegal ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-body-sm font-semibold text-on-surface">{t('Legal & Ownership Declaration Affirmation')}</span>
            </div>
            {!hasLegal && <span className="text-body-sm text-on-surface-variant font-code-sm">{t('Affirmed in Wizard')}</span>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${hasVerification ? 'text-emerald-600' : 'text-error'}`}>
                {hasVerification ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-body-sm font-semibold text-on-surface">{t('Provider Entity Verified')}</span>
            </div>
            {!hasVerification && <Link to="/provider/verification" className="text-body-sm text-primary hover:underline">{t('Verify Identity →')}</Link>}
          </div>
        </div>
      </div>
    </div>
  );
};
