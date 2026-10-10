import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useLanguage } from '../../i18n';

export const TrySandboxPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apis, tryGrants, useTryGrant, executeGatewayCall } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const api = apis.find(a => a.id === id);

  if (!api) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">science</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('Sandbox Not Available')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{t('The requested API does not exist or has not been published yet.')}</p>
        <Link to="/marketplace">
          <Button variant="primary" icon="storefront">{t('Browse Marketplace')}</Button>
        </Link>
      </div>
    );
  }

  const remaining = tryGrants[api.id] ?? 8;
  const maxGrants = 10;

  const [testResult, setTestResult] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);
  const [exhausted, setExhausted] = useState(remaining <= 0);

  const handleTestCall = async () => {
    if (remaining <= 0) {
      setExhausted(true);
      return;
    }

    setTesting(true);
    const { remaining: newRemaining, allowed } = useTryGrant(api.id);
    if (!allowed) {
      setExhausted(true);
      setTesting(false);
      return;
    }

    try {
      const ep = api.endpoints[0];
      const res = await executeGatewayCall(
        api.id,
        ep.path,
        ep.method,
        'ak_sand_try_instant_key_7712',
        ep.sampleRequest
      );
      setTestResult(res);
      if (newRemaining <= 0) {
        setExhausted(true);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="pt-20 pb-16 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/api/${api.id}`} className="hover:text-primary">{api.name}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{t('Try Before Subscribe')}</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[32px]">{api.icon}</span>
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">{t('Try Before Subscribe')}</h1>
            <p className="text-body-md text-on-surface-variant">
              {t('Zero-friction instant sandbox testing for')} <strong className="text-on-surface">{api.name}</strong>. {t('No credit card required.')}
            </p>
          </div>
        </div>

        {/* Quota Progress Meter */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-md font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
              {t('Free Trial Sandbox Quota')}
            </span>
            <span className="text-body-sm font-code-md font-bold text-primary">
              {remaining} / {maxGrants} {t('calls remaining')}
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                remaining <= 2 ? 'bg-error' : 'bg-primary'
              }`}
              style={{ width: `${(remaining / maxGrants) * 100}%` }}
            />
          </div>
          <span className="text-[12px] text-on-surface-variant mt-2 block">
            {t('Each developer account receives')} {maxGrants} {t('free evaluation requests per API before requiring a subscription tier.')}
          </span>
        </div>

        {exhausted ? (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center mb-8">
            <span className="material-symbols-outlined text-[36px] text-amber-600 mb-2">warning</span>
            <h3 className="text-headline-sm font-bold text-on-surface">{t('Trial Quota Limit Reached (429)')}</h3>
            <p className="text-body-md text-on-surface-variant mt-1 max-w-md mx-auto mb-4">
              {t('You have used all')} {maxGrants} {t('evaluation calls. Upgrade to a Free Community tier or Pro subscription to unlock production access.')}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/checkout/${api.id}/${api.plans[0].id}`)}
              >
                {t('Choose Subscription Plan')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/marketplace')}
              >
                {t('Back to Marketplace')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-surface-container-highest/40 border border-outline-variant/20 text-body-sm text-on-surface flex items-center justify-between">
              <div>
                <span className="font-semibold block">{t('Ephemeral Sandbox Key Activated')}</span>
                <span className="font-code-md text-[12px] text-on-surface-variant">ak_sand_try_instant_key_7712</span>
              </div>
              <Button
                variant="primary"
                size="md"
                icon="bolt"
                loading={testing}
                onClick={handleTestCall}
              >
                {t('Trigger Free Test Call')}
              </Button>
            </div>

            {testResult && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-md font-bold text-on-surface">{t('Instant Test Response:')}</span>
                  <span className="text-code-sm font-code-md text-emerald-600 font-semibold">
                    Latency: {testResult.latencyMs}ms | Status 200 OK
                  </span>
                </div>
                <CodeBlock
                  code={JSON.stringify(testResult.data, null, 2)}
                  language="json"
                  title="Gateway Live Sandbox Execution"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-outline-variant/30 flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>{t('Need higher throughput or custom limits?')}</span>
          <Link to={`/api/${api.id}`} className="text-primary font-semibold hover:underline">
            {t('View All Pricing Plans →')}
          </Link>
        </div>
      </div>
    </div>
  );
};
