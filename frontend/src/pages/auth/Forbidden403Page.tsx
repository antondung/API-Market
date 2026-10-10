import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';

export const Forbidden403Page: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    if (user?.role === 'USER') {
      if (login('provider', 'API_PROVIDER').success) navigate('/provider');
    } else if (user?.role === 'API_PROVIDER') {
      if (login('admin', 'ADMIN').success) navigate('/admin');
    } else {
      if (login('consumer', 'USER').success) navigate('/dashboard');
    }
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="relative w-full max-w-xl">
        {/* Ambient glow background */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-surface-container-highest/20 rounded-2xl blur-xl pointer-events-none" />

        {/* Main Card */}
        <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 flex flex-col items-center text-center">
          {/* Top Security Badge */}
          <div className="self-end mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span>ERROR 403: SECURE_SHELL_BREACH</span>
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
            <div className="flex justify-between items-center">
              <span className="text-outline">REQUEST_ID:</span>
              <span className="text-on-surface">req_{Math.random().toString(36).substring(2, 12)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">TARGET_SCOPE:</span>
              <span className="text-on-surface">admin:console:write / provider:api:write</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">IDENTITY:</span>
              <span className="text-on-surface">{user?.email || 'unauthenticated@guest.internal'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">POLICY_RULE:</span>
              <span className="text-error font-medium">RBAC_STRICT_PARTITIONING_US23</span>
            </div>
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

            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              icon={<span className="material-symbols-outlined text-lg">swap_horiz</span>}
              onClick={handleSwitchRole}
            >
              {t('Switch Elevated Role')}
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
