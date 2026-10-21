import React from 'react';
import { useLanguage } from '../../i18n';

export const GatewayOperationsPage: React.FC = () => {
  const { t } = useLanguage();
  return <div className="space-y-8">
    <div className="pb-6 border-b border-outline-variant/30">
      <h1 className="text-headline-lg font-bold">{t('System Monitoring & API Gateway Operations')}</h1>
      <p className="text-body-md text-on-surface-variant">{t('Chưa có kết nối giám sát cho các dịch vụ bên dưới.')}</p>
    </div>
    <div role="status" className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
      {t('Trạng thái chưa được xác minh. Trang này chưa có dữ liệu health, latency hoặc lịch chạy worker từ backend.')}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['Control Plane', 'PostgreSQL', 'Data Plane Gateway', 'Redis', 'Background Workers'].map(name => <section key={name}
        className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30">
        <h2 className="text-title-md font-bold">{name}</h2>
        <p className="mt-3 text-on-surface-variant">{t('Chưa có dữ liệu giám sát')}</p>
      </section>)}
    </div>
  </div>;
};
