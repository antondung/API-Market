import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export const PublicApiUnavailable: React.FC = () => {
  const { t } = useLanguage();
  return <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center">
    <h1 className="text-title-lg font-bold mb-3">{t('API hoặc gói dịch vụ không khả dụng')}</h1>
    <p className="text-body-md text-on-surface-variant mb-6">{t('Không tìm thấy API đã xuất bản hoặc gói dịch vụ được yêu cầu.')}</p>
    <Link className="text-primary hover:underline" to="/marketplace">{t('Browse Marketplace')}</Link>
  </div>;
};
