import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n';

export const PublicFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 py-12 px-6 lg:px-12 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
            <span className="text-headline-sm font-bold text-primary">API HUB</span>
          </div>
          <p className="text-body-sm text-on-surface-variant max-w-sm mb-4 leading-relaxed">
            {t('Developer-first API marketplace, gateway, and management suite. Full lifecycle governance from exploration and testing to subscription and cost optimization.')}
          </p>
          <div className="flex items-center gap-2 text-emerald-600 font-code-sm text-[12px] bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('Gateway & Control Plane: All Systems Operational (99.99%)')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-body-sm">
          <div>
            <h4 className="font-headline-sm text-[14px] font-semibold text-on-surface mb-3 uppercase tracking-wider">{t('Discovery')}</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">{t('Explore Marketplace')}</Link></li>
              <li><Link to="/api/api_neural_llm_v4" className="hover:text-primary transition-colors">{t('Featured API (Neural v4)')}</Link></li>
              <li><Link to="/compare" className="hover:text-primary transition-colors">{t('API Comparison Tool')}</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">{t('Pricing Plans')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-[14px] font-semibold text-on-surface mb-3 uppercase tracking-wider">{t('Workspaces')}</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">{t('Consumer Dashboard')}</Link></li>
              <li><Link to="/provider" className="hover:text-primary transition-colors">{t('Provider Dashboard')}</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors">{t('Admin Governance')}</Link></li>
              <li><Link to="/dashboard/api-keys" className="hover:text-primary transition-colors">{t('API Key Vault')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-[14px] font-semibold text-on-surface mb-3 uppercase tracking-wider">{t('Developer Resources')}</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li><Link to="/api/api_neural_llm_v4/playground" className="hover:text-primary transition-colors">{t('API Playground')}</Link></li>
              <li><Link to="/provider/openapi-import" className="hover:text-primary transition-colors">{t('OpenAPI Import')}</Link></li>
              <li><Link to="/auth/session-simulator" className="hover:text-primary transition-colors">{t('Session & RBAC Simulator')}</Link></li>
              <li><Link to="/admin/gateway" className="hover:text-primary transition-colors">{t('Gateway Telemetry')}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-4">
        <p>{t('© 2026 API HUB Platform. Architectural compliance based on Control Plane – Data Plane specs.')}</p>
        <div className="flex gap-4">
          <Link to="/401" className="hover:text-on-surface">401 Preview</Link>
          <Link to="/403" className="hover:text-on-surface">403 Preview</Link>
          <span className="text-outline-variant">|</span>
          <span className="font-code-sm">v4.2-release</span>
        </div>
      </div>
    </footer>
  );
};
