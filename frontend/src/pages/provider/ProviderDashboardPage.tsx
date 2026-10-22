import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { getProviderVerification, listProviderApis, formatProviderErrorMessage } from '../../services/providerApi';
import type { ProviderApisPage, ProviderVerification } from '../../services/providerTypes';

type Snapshot = { userId: string; revision: number; verification: ProviderVerification | null; apis: ProviderApisPage };

export const ProviderDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [requestError, setRequestError] = useState<{ userId: string; revision: number; message: string } | null>(null);
  const [revision, setRevision] = useState(0);
  const userId = currentUser?.id;

  useEffect(() => {
    const controller = new AbortController();
    if (!userId) return () => controller.abort();
    Promise.all([getProviderVerification(controller.signal), listProviderApis(1, 5, controller.signal)])
      .then(([verification, apis]) => {
        if (!controller.signal.aborted) setSnapshot({ userId, revision, verification, apis });
      })
      .catch(err => {
        if (!controller.signal.aborted) setRequestError({ userId, revision, message: formatProviderErrorMessage(err) });
      });
    return () => controller.abort();
  }, [userId, revision]);

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Never expose a previous account's data while its replacement request is pending.
  const data = snapshot && snapshot.userId === userId && snapshot.revision === revision ? snapshot : null;
  const error = requestError && requestError.userId === userId && requestError.revision === revision ? requestError.message : null;
  const verified = data?.verification?.status === 'Verified';
  const status = data ? data.verification?.status ?? 'Chưa xác minh' : error ? 'Không tải được trạng thái' : 'Đang tải trạng thái…';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold">{t('Provider Dashboard')}</h1>
          <p className="text-body-md text-on-surface-variant">{currentUser?.name}</p>
          <div className="mt-3"><StatusBadge status={status} /></div>
          {data?.verification?.organizationName && <p className="mt-2">{data.verification.organizationName}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setRevision(value => value + 1)}>{t('Làm mới')}</Button>
          <Button variant="secondary" icon="auto_stories" disabled={!verified || !data?.apis.total}
            onClick={() => navigate('/provider/import-openapi')}>{t('Import OpenAPI')}</Button>
          <Button icon="add_circle" disabled={!verified}
            onClick={() => navigate('/provider/create-api')}>{t('Create API Product')}</Button>
        </div>
      </div>
      {error && <div role="alert" className="p-4 rounded-xl bg-error-container text-on-error-container">{error}</div>}
      {!data && !error && <p role="status">{t('Đang tải dữ liệu Provider…')}</p>}
      {data && !verified && <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <p>{data.verification?.status === 'Rejected' ? t('Hồ sơ đã bị từ chối. Vui lòng cập nhật hồ sơ xác minh.')
          : data.verification?.status === 'Pending' ? t('Hồ sơ đang được xét duyệt.') : t('Xác minh Provider để tạo API.')}</p>
        <Link className="text-primary hover:underline" to="/provider/verification">{t('Xem hồ sơ xác minh')}</Link>
      </div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low">
          <p>{t('APIs in catalog')}</p><strong className="text-3xl">{data ? data.apis.total.toLocaleString() : '—'}</strong>
        </div>
        {['Usage & Gateway', 'Subscribers & Revenue'].map(label => <div key={label} className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low">
          <p>{t(label)}</p><strong className="text-3xl">—</strong><p className="text-body-sm text-on-surface-variant">{t('Chưa có dữ liệu backend')}</p>
        </div>)}
      </div>
      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-low overflow-hidden">
        <div className="p-5 flex items-center justify-between"><h2 className="text-title-lg font-bold">{t('API gần đây')}</h2>
          <Link className="text-primary hover:underline" to="/provider/apis">{t('Xem tất cả API')}</Link></div>
        {data && data.apis.items.length === 0 && <p className="p-5">{t('Bạn chưa có API nào.')}</p>}
        {data && data.apis.items.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-body-sm">
          <thead><tr className="border-y border-outline-variant/30"><th className="p-4">API</th><th>{t('Category')}</th><th>{t('Status')}</th><th className="p-4">{t('Actions')}</th></tr></thead>
          <tbody>{data.apis.items.map(api => <tr key={api.id} className="border-b border-outline-variant/20">
            <td className="p-4 font-semibold">{api.name}</td><td>{api.category}</td><td><StatusBadge status={api.status} /></td>
            <td className="p-4"><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => navigate(`/provider/endpoints?api=${api.id}`)}>Endpoints</Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/provider/workflow?api=${api.id}`)}>Workflow</Button></div></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </div>
  );
};
