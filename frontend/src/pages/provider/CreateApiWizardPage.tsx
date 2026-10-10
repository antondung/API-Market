import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useLanguage } from '../../i18n';
import type { ApiCategory } from '../../types';

export const CreateApiWizardPage: React.FC = () => {
  const { createApi } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1: Info
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApiCategory>('Machine Learning & AI');
  const [version, setVersion] = useState('1.0.0');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [icon, setIcon] = useState('neurology');

  // Step 2: Routing
  const [baseUrl, setBaseUrl] = useState('https://api.mycompany.io/v1');

  // Step 3: Initial Plan
  const [freeQuota, setFreeQuota] = useState('2000');
  const [freeRps, setFreeRps] = useState('10');

  // Step 4: Ownership, Legal & Data Classification (Section 8 & 9)
  const [ownershipType, setOwnershipType] = useState<'OWN' | 'THIRD_PARTY'>('OWN');
  const [usesThirdPartyData, setUsesThirdPartyData] = useState(false);
  const [domainVerified, setDomainVerified] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [verificationToken] = useState(`platform-verification=apihub_sec_${Math.random().toString(36).substring(2, 10)}`);
  
  const [processesPersonalData, setProcessesPersonalData] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [legalConfirmed, setLegalConfirmed] = useState(false);

  const categories: ApiCategory[] = [
    'Machine Learning & AI',
    'Finance & Banking',
    'Data & Web Scraping',
    'DevOps & Cloud',
    'Translation & NLP',
    'Weather & Geo',
    'Security & Auth'
  ];

  const personalDataOptions = [
    'Họ tên (Full Name)',
    'Email Address',
    'Số điện thoại (Phone)',
    'Vị trí địa lý (Geolocation)',
    'Thông tin tài chính (Financial & Payment)',
    'Thông tin xác thực (Credentials & Auth)',
    'Dữ liệu sức khỏe (Health & Biometrics)',
    'Dữ liệu khác (Other PII)'
  ];

  const handleToggleDataType = (type: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleVerifyDomain = () => {
    setVerifyingDomain(true);
    setTimeout(() => {
      setVerifyingDomain(false);
      setDomainVerified(true);
    }, 1200);
  };

  const handleFinish = () => {
    if (!name.trim()) return;

    createApi({
      name,
      category,
      version,
      shortDescription,
      longDescription,
      icon,
      baseUrl,
      legalDeclarationCompleted: legalConfirmed,
      complianceNotes: processesPersonalData
        ? `Processes personal data: ${selectedDataTypes.join(', ')}. Ownership: ${ownershipType}.`
        : `Non-personal public data. Ownership: ${ownershipType}.`,
      plans: [
        {
          id: `plan_free_${Date.now()}`,
          apiId: '',
          name: 'Free Community Sandbox',
          tier: 'Free',
          priceMonthly: 0,
          monthlyQuota: parseInt(freeQuota) || 2000,
          rateLimitPerSec: parseInt(freeRps) || 10,
          features: [`${parseInt(freeQuota).toLocaleString()} requests / month`, `${freeRps} req/sec rate limit`]
        }
      ],
      endpoints: [
        {
          id: `ep_init_${Date.now()}`,
          path: '/v1/predict',
          method: 'POST',
          summary: 'Primary prediction endpoint',
          description: 'Primary inference execution endpoint',
          rateLimitPerSec: parseInt(freeRps) || 10,
          parameters: [
            { name: 'model', type: 'string', in: 'query', required: true, description: 'Target model identifier' }
          ],
          sampleRequest: JSON.stringify({ input: 'sample data payload' }, null, 2),
          sampleResponse: JSON.stringify({ status: 'success', confidence: 0.99 }, null, 2)
        }
      ]
    });

    navigate('/provider/apis');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
          <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">{t('New API Wizard')}</span>
        </div>
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Register & Package API Product')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Complete metadata, gateway routing, sandbox pricing, and legal/data classification declarations.')}
        </p>
      </div>

      {/* 4-Step Indicator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 border-b border-outline-variant/30 pb-4">
        {[
          { num: 1, label: t('Metadata') },
          { num: 2, label: t('Gateway Route') },
          { num: 3, label: t('Initial Plan') },
          { num: 4, label: t('Legal & Compliance') }
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all cursor-default ${
              step === s.num
                ? 'border-primary text-primary font-bold'
                : step > s.num
                ? 'border-emerald-600 text-emerald-600 font-medium'
                : 'border-transparent text-on-surface-variant'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s.num
                ? 'bg-primary text-on-primary'
                : step > s.num
                ? 'bg-emerald-600 text-white'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {step > s.num ? '✓' : s.num}
            </span>
            <span className="text-body-sm hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Step 1: General API Metadata')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('API Product Name')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('e.g. Real-time NLP Reasoning Engine')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Industry Category')}</label>
                <CustomSelect<ApiCategory>
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={categories.map(c => ({
                    value: c,
                    label: t(c),
                    icon: 'category'
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Initial Semantic Version')}</label>
                <input
                  type="text"
                  placeholder="1.0.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Material Icon Name')}</label>
                <input
                  type="text"
                  placeholder={t('e.g. neurology, credit_card, cloud')}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Short Summary (Marketplace Card)')}</label>
              <input
                type="text"
                placeholder={t('One sentence describing value proposition...')}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none"
              />
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Extended Documentation')}</label>
              <textarea
                rows={4}
                placeholder={t('Comprehensive technical overview, parameters, and SLAs...')}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                size="md"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
              >
                {t('Proceed to Upstream Routing →')}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Step 2: Upstream Gateway Routing (Data Plane)')}</h2>
            <p className="text-body-sm text-on-surface-variant">
              {t('The API Gateway will forward authenticated traffic to your upstream base URL while verifying cryptographic header signatures.')}
            </p>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Upstream Base URL')}</label>
              <input
                type="url"
                required
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/v1"
                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none font-mono"
              />
              <span className="text-[12px] text-on-surface-variant mt-1 block">
                {t('Must be an HTTPS endpoint accessible to API HUB Gateway proxies (RFC1918 private loopback prohibited).')}
              </span>
            </div>

            <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface-variant space-y-2">
              <h4 className="font-bold text-on-surface">{t('Gateway Shared Secret Signing (US-23):')}</h4>
              <p>
                {t('API HUB will inject the X-Gateway-Signature header into all proxied requests. Your backend service must verify this HMAC signature to reject unauthenticated direct calls.')}
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="md" onClick={() => setStep(1)}>
                {t('← Back')}
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(3)}>
                {t('Proceed to Pricing Tier →')}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Step 3: Initial Free Community Plan')}</h2>
            <p className="text-body-sm text-on-surface-variant">
              {t('Establish default quotas for developer evaluations. You can configure multi-tier plans later in Pricing Management.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Free Monthly Quota (Calls / Mo)')}</label>
                <input
                  type="number"
                  value={freeQuota}
                  onChange={(e) => setFreeQuota(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Burst Rate Limit (Req / Sec)')}</label>
                <input
                  type="number"
                  value={freeRps}
                  onChange={(e) => setFreeRps(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="md" onClick={() => setStep(2)}>
                {t('← Back')}
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep(4)}>
                {t('Proceed to Legal & Compliance →')}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">{t('Step 4: Ownership, Domain Verification & Data Classification')}</h2>
              <p className="text-body-sm text-on-surface-variant">
                {t('Mandatory governance affirmations pursuant to Section 8 & 9 of project specifications.')}
              </p>
            </div>

            {/* Subsection 1: Ownership Declaration */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment_ind</span>
                {t('1. Khai báo quyền cung cấp API (API Ownership Model)')}
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    checked={ownershipType === 'OWN'}
                    onChange={() => setOwnershipType('OWN')}
                    className="accent-primary"
                  />
                  <span>{t('API do chính Provider phát triển và sở hữu (First-Party Owner)')}</span>
                </label>
                <label className="flex items-center gap-3 text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    checked={ownershipType === 'THIRD_PARTY'}
                    onChange={() => setOwnershipType('THIRD_PARTY')}
                    className="accent-primary"
                  />
                  <span>{t('API của bên thứ ba nhưng Provider được phép phân phối / thương mại hóa (Authorized Distributor)')}</span>
                </label>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usesThirdPartyData}
                    onChange={(e) => setUsesThirdPartyData(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span className="text-on-surface-variant">{t('API có sử dụng dữ liệu hoặc dịch vụ của bên thứ ba')}</span>
                </label>
              </div>
            </div>

            {/* Subsection 2: Domain Verification */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">domain_verification</span>
                  {t('2. Xác minh quyền kiểm soát Domain (Domain Verification)')}
                </h4>
                {domainVerified ? (
                  <Badge variant="success">{t('Domain Verified ✓')}</Badge>
                ) : (
                  <Badge variant="warning">{t('Verification Pending')}</Badge>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">
                {t('Thêm mã xác minh sau vào bản ghi TXT của domain hoặc endpoint')} <code className="font-mono text-primary">/.well-known/apihub-verification</code>:
              </p>
              <div className="flex items-center justify-between bg-surface-container-highest/60 p-2.5 rounded-lg border border-outline-variant/30 font-mono text-xs">
                <span>{verificationToken}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(verificationToken)}
                  className="text-primary hover:underline font-semibold"
                >
                  {t('Copy')}
                </button>
              </div>
              <Button
                size="sm"
                variant={domainVerified ? 'secondary' : 'primary'}
                loading={verifyingDomain}
                disabled={domainVerified}
                onClick={handleVerifyDomain}
                icon="verified"
              >
                {domainVerified ? t('Domain Kiểm tra Thành công ✓') : t('Xác minh Domain ngay')}
              </Button>
            </div>

            {/* Subsection 3: Data Classification */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">policy</span>
                {t('3. Phân loại dữ liệu API (Data Classification)')}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {t('Does this API process personal or sensitive customer data?')}
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="personalData"
                    checked={!processesPersonalData}
                    onChange={() => setProcessesPersonalData(false)}
                    className="accent-primary"
                  />
                  <span>{t('No (Không xử lý dữ liệu cá nhân)')}</span>
                </label>
                <label className="flex items-center gap-2 text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="personalData"
                    checked={processesPersonalData}
                    onChange={() => setProcessesPersonalData(true)}
                    className="accent-primary"
                  />
                  <span>{t('Yes (Có xử lý dữ liệu cá nhân)')}</span>
                </label>
              </div>

              {processesPersonalData && (
                <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {personalDataOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDataTypes.includes(opt)}
                        onChange={() => handleToggleDataType(opt)}
                        className="rounded accent-primary"
                      />
                      <span>{t(opt)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Subsection 4: Provider Agreement */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <label className="flex items-start gap-3 text-body-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={legalConfirmed}
                  onChange={(e) => setLegalConfirmed(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer"
                />
                <span className="text-on-surface leading-relaxed text-xs sm:text-body-sm">
                  <strong>{t('Chấp nhận Provider Agreement v1.4:')} </strong>
                  {t('Tôi cam kết có quyền hợp pháp để cung cấp API này, thông tin và pricing được khai báo chính xác, không cung cấp dữ liệu trái phép, không xâm phạm quyền của bên thứ ba, và chịu trách nhiệm toàn bộ đối với nội dung/dữ liệu mà API cung cấp.')}
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="md" onClick={() => setStep(3)}>
                {t('← Back')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!legalConfirmed}
                onClick={handleFinish}
              >
                {t('Complete & Register API')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
