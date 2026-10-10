import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const MyApisInventoryPage: React.FC = () => {
  const { apis, submitApiForReview } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const myApis = apis.filter(a => a.providerId === currentUser.id);

  const handleSubmitForReview = (apiId: string) => {
    const res = submitApiForReview(apiId);
    if (!res.success) {
      alert(`${t('Submission Blocked:')} ${res.error}`);
    } else {
      alert(t('API submitted successfully! It is now pending review in the Admin Console.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('My APIs & Endpoints Inventory')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Manage your service definitions, review states, pricing plans, and version releases.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="auto_stories"
            onClick={() => navigate('/provider/openapi-import')}
          >
            {t('Import OpenAPI')}
          </Button>
          <Button
            variant="primary"
            icon="add"
            onClick={() => navigate('/provider/create-api')}
          >
            {t('Create New API')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {myApis.length === 0 ? (
          <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-[44px] text-outline mb-3 block">api</span>
            <h3 className="text-body-lg font-bold text-on-surface mb-1">{t('Chưa có API nào')}</h3>
            <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
              {t('Bạn chưa tạo hoặc nhập sản phẩm API nào vào danh mục của mình. Bắt đầu ngay với trình tạo API từng bước hoặc nhập từ tài liệu OpenAPI.')}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                icon="auto_stories"
                onClick={() => navigate('/provider/import-openapi')}
              >
                {t('Import OpenAPI')}
              </Button>
              <Button
                variant="primary"
                icon="add_circle"
                onClick={() => navigate('/provider/create-api')}
              >
                {t('Create New API')}
              </Button>
            </div>
          </div>
        ) : (
          myApis.map(api => (
          <div
            key={api.id}
            className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[32px]">{api.icon}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-headline-sm font-bold text-on-surface">{api.name}</h3>
                  <span className="font-code-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                    v{api.version}
                  </span>
                  <StatusBadge status={api.status} />
                  <Badge variant="primary">{t(api.category)}</Badge>
                </div>

                <p className="text-body-sm text-on-surface-variant line-clamp-2 max-w-2xl mb-3">
                  {api.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
                  <span>{t('Endpoints:')} <strong className="text-on-surface font-code-md">{api.endpoints.length}</strong></span>
                  <span>•</span>
                  <span>{t('Plans:')} <strong className="text-on-surface font-code-md">{api.plans.length}</strong></span>
                  <span>•</span>
                  <span>{t('Subscribers:')} <strong className="text-on-surface font-code-md">{api.subscribersCount}</strong></span>
                  <span>•</span>
                  <span>{t('Base URL:')} <code className="text-primary font-code-sm">{api.baseUrl}</code></span>
                </div>
              </div>
            </div>

            {/* Quick Actions Matrix */}
            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon="alt_route"
                  onClick={() => navigate(`/provider/endpoints?api=${api.id}`)}
                >
                  {t('Endpoints')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="payments"
                  onClick={() => navigate(`/provider/pricing?api=${api.id}`)}
                >
                  {t('Plans')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="terminal"
                  onClick={() => navigate(`/api/${api.id}/playground`)}
                >
                  {t('Test')}
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  icon="fact_check"
                  onClick={() => navigate(`/provider/workflow?api=${api.id}`)}
                >
                  {t('Status Tracker')}
                </Button>
                {api.status === 'Draft' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon="publish"
                    onClick={() => handleSubmitForReview(api.id)}
                  >
                    {t('Submit for Review')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
};
