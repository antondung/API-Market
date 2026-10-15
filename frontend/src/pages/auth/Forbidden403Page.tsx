import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';

export const Forbidden403Page: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; requiredRoles?: string[]; requestId?: string } | null;

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="relative w-full max-w-xl">
        {/* Ambient glow background */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-surface-container-highest/20 rounded-2xl blur-xl pointer-events-none" />

        {/* Main Card */}
        <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 flex flex-col items-center text-center">
          {/* Top Security Badge */}
          <div className="self-end mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-error" />
            <span>HTTP 403: FORBIDDEN</span>
          </div>

          {/* Shield Icon */}
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6 text-primary shadow-inner">
            <span className="material-symbols-outlined text-4xl text-primary">security</span>
          </div>

          {/* Heading */}
          <h1 className="font-headline font-semibold text-2xl text-on-surface mb-2">
            {t('Access Denied')}
          </h1>

          {/* Description */}
          <p className="font-body text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
            {t('Your current account credentials')} (<span className="text-primary font-mono bg-surface-container px-2 py-0.5 rounded text-xs font-semibold">{user?.role || 'GUEST'} Role</span>) {t('do not possess the required RBAC clearance level to access this workspace console.')}
          </p>

          {/* Diagnostic info box */}
          <div className="w-full bg-surface-container-low rounded-xl p-4 mb-6 text-left flex flex-col gap-1.5 font-mono text-xs text-on-surface-variant border border-outline-variant/20">
            {state?.requestId && (
              <div className="flex justify-between items-center">
                <span className="text-outline">REQUEST_ID:</span>
                <span className="text-on-surface">{state.requestId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-outline">TARGET_PATH:</span>
              <span className="text-on-surface">{state?.from || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">IDENTITY:</span>
              <span className="text-on-surface">{user?.email || 'unauthenticated@guest.internal'}</span>
            </div>
            {state?.requiredRoles && state.requiredRoles.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-outline">REQUIRED_ROLES:</span>
                <span className="text-error font-medium">{state.requiredRoles.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              icon={<span className="material-symbols-outlined text-lg">dashboard</span>}
              onClick={() => {
                if (user?.role === 'ADMIN') navigate('/admin');
                else if (user?.role === 'API_PROVIDER') navigate('/provider');
                else navigate('/dashboard');
              }}
            >
              {t('Go to My Permitted Workspace')}
            </Button>

          </div>

          {/* Return */}
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {t('Return to Previous Page')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
