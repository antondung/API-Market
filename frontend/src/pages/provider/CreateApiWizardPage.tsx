import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useLanguage } from '../../i18n';
import {
  createProviderApi,
  createProviderVersion,
  createProviderPlan,
  saveProviderLegal,
  getProviderAgreement,
  getProviderVerification,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type {
  ProviderAgreement,
  ProviderVerification,
  PersonalDataType,
  DataClassification,
} from '../../services/providerTypes';

const CATEGORIES = [
  'Machine Learning & AI',
  'Finance & Banking',
  'Data & Web Scraping',
  'DevOps & Cloud',
  'Translation & NLP',
  'Weather & Geo',
  'Security & Auth',
  'E-Commerce & Retail',
  'Communication & SMS',
];

const ALL_PERSONAL_DATA_TYPES: { type: PersonalDataType; label: string }[] = [
  { type: 'FullName', label: 'Họ và tên (FullName)' },
  { type: 'Email', label: 'Địa chỉ Email (Email)' },
  { type: 'Phone', label: 'Số điện thoại (Phone)' },
  { type: 'Geolocation', label: 'Vị trí / Tọa độ GPS (Geolocation)' },
  { type: 'Financial', label: 'Tài chính / Thẻ / Ngân hàng (Financial)' },
  { type: 'Credentials', label: 'Mật khẩu / Khóa xác thực (Credentials)' },
  { type: 'HealthBiometrics', label: 'Sức khỏe & Sinh trắc học (HealthBiometrics)' },
  { type: 'Other', label: 'Dữ liệu nhận dạng cá nhân khác (Other)' },
];

export const CreateApiWizardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Draft recovery state
  const [createdDraftApiId, setCreatedDraftApiId] = useState<string | null>(null);

  // Verification & Agreement status
  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [agreement, setAgreement] = useState<ProviderAgreement | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Step 1: Metadata
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [version, setVersion] = useState('1.0.0');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('production, api');

  // Step 2: Routing
  const [baseUrl, setBaseUrl] = useState('https://api.mycompany.io/v1');

  // Step 3: Initial Plan
  const [freeQuota, setFreeQuota] = useState('2000');
  const [freeRps, setFreeRps] = useState('10');

  // Step 4: Ownership, Legal & Data Classification (US-08)
  const [ownershipType, setOwnershipType] = useState<'OWN' | 'THIRD_PARTY'>('OWN');
  const [usesThirdPartyData, setUsesThirdPartyData] = useState(false);
  const [dataClassification, setDataClassification] = useState<DataClassification>('Public');
  const [processesPersonalData, setProcessesPersonalData] = useState(false);
  const [selectedPersonalDataTypes, setSelectedPersonalDataTypes] = useState<PersonalDataType[]>([]);
  const [dataProcessingPurpose, setDataProcessingPurpose] = useState('');
  const [legalConfirmed, setLegalConfirmed] = useState(false);
  const [acceptedAgreementVersion, setAcceptedAgreementVersion] = useState<string | null>(null);
  const [agreementError, setAgreementError] = useState<string | null>(null);
  const lastAgreementIdRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(currentUser?.id || null);

  // Reset agreement confirmation if current user changes
  useEffect(() => {
    if (lastUserIdRef.current !== currentUser?.id) {
      lastUserIdRef.current = currentUser?.id || null;
      setLegalConfirmed(false);
      setAcceptedAgreementVersion(null);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingInitial(true);
    setAgreementError(null);

    Promise.allSettled([
      getProviderVerification(controller.signal),
      getProviderAgreement(controller.signal),
    ])
      .then(([verSettled, agrSettled]) => {
        if (!controller.signal.aborted) {
          if (verSettled.status === 'fulfilled') {
            setVerification(verSettled.value);
          }
          if (agrSettled.status === 'fulfilled' && agrSettled.value) {
            const agr = agrSettled.value;
            if (!agr.version || !agr.content || !agr.content.trim()) {
              setAgreement(null);
              setAgreementError('Nội dung Thỏa thuận Nhà cung cấp từ máy chủ bị trống hoặc không hợp lệ.');
              setLegalConfirmed(false);
              setAcceptedAgreementVersion(null);
            } else {
              if (lastAgreementIdRef.current && (lastAgreementIdRef.current !== agr.id || agreement?.version !== agr.version)) {
                setLegalConfirmed(false);
                setAcceptedAgreementVersion(null);
              }
              lastAgreementIdRef.current = agr.id;
              setAgreement(agr);
              setAgreementError(null);
            }
          } else {
            setAgreement(null);
            setAgreementError('Không thể tải Điều khoản Thỏa thuận Nhà cung cấp từ máy chủ. Vui lòng thử lại kết nối.');
            setLegalConfirmed(false);
            setAcceptedAgreementVersion(null);
          }
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingInitial(false);
        }
      });

    return () => controller.abort();
  }, [currentUser]);

  // Reset legal confirmation if agreement version changes mid-session
  useEffect(() => {
    if (agreement && acceptedAgreementVersion && acceptedAgreementVersion !== agreement.version) {
      setLegalConfirmed(false);
      setAcceptedAgreementVersion(null);
    }
  }, [agreement?.version, acceptedAgreementVersion]);

  const isAgreementValid = Boolean(
    agreement &&
    agreement.version &&
    agreement.content &&
    agreement.content.trim().length > 0 &&
    !agreementError
  );

  const isVerified = verification?.status === 'Verified';

  const togglePersonalDataType = (type: PersonalDataType) => {
    setSelectedPersonalDataTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFinish = async () => {
    if (submitting) return;
    setWizardError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setWizardError('Vui lòng nhập tên API.');
      setStep(1);
      return;
    }

    const trimmedUrl = baseUrl.trim();
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setWizardError('Base URL phải bắt đầu bằng http:// hoặc https://');
        setStep(2);
        return;
      }
    } catch {
      setWizardError('Base URL không đúng định dạng URL hợp lệ.');
      setStep(2);
      return;
    }

    if (processesPersonalData) {
      if (selectedPersonalDataTypes.length === 0) {
        setWizardError('Khi API xử lý dữ liệu cá nhân, vui lòng chọn ít nhất một loại dữ liệu (Personal Data Types).');
        setStep(4);
        return;
      }
      if (!dataProcessingPurpose.trim()) {
        setWizardError('Khi API xử lý dữ liệu cá nhân, vui lòng nêu rõ mục đích xử lý dữ liệu (Data Processing Purpose).');
        setStep(4);
        return;
      }
    }

    // 4. US-08 / Finding F2: Authoritative check against current server agreement version BEFORE any resource creation
    let currentServerAgreement: ProviderAgreement | null = null;
    try {
      currentServerAgreement = await getProviderAgreement();
    } catch {
      currentServerAgreement = agreement;
    }

    if (!currentServerAgreement || !currentServerAgreement.version || !currentServerAgreement.content?.trim()) {
      setWizardError('Chưa tải được Điều khoản Thỏa thuận Nhà cung cấp hợp lệ từ máy chủ. Vui lòng kiểm tra lại kết nối.');
      setAgreement(null);
      setLegalConfirmed(false);
      setAcceptedAgreementVersion(null);
      setStep(4);
      return;
    }

    if (currentServerAgreement.version !== acceptedAgreementVersion) {
      setAgreement(currentServerAgreement);
      setLegalConfirmed(false);
      setAcceptedAgreementVersion(null);
      setWizardError(`Thỏa thuận Nhà cung cấp đã được cập nhật phiên bản mới (${currentServerAgreement.version}). Vui lòng đọc lại và xác nhận đồng ý.`);
      setStep(4);
      return;
    }

    if (!legalConfirmed || acceptedAgreementVersion !== currentServerAgreement.version) {
      setWizardError('Bạn phải đọc và tích xác nhận đồng ý với Thỏa thuận Nhà cung cấp (phiên bản hiện hành) trước khi hoàn tất.');
      setStep(4);
      return;
    }

    setSubmitting(true);
    let targetApiId = createdDraftApiId;

    try {
      const tagList = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const fullDescription = longDescription.trim() || shortDescription.trim();

      // 1. Create API if not already created as draft
      if (!targetApiId) {
        const createdApi = await createProviderApi({
          name: trimmedName,
          description: fullDescription || 'Dịch vụ API thương mại',
          category,
          baseUrl: trimmedUrl,
          tags: tagList,
        });
        targetApiId = createdApi.id;
        setCreatedDraftApiId(createdApi.id);
      }

      // 2. Create Initial Version
      const versionStr = version.trim() || '1.0.0';
      try {
        await createProviderVersion(targetApiId, {
          version: versionStr,
          changelog: 'Phiên bản khởi tạo ban đầu',
        });
      } catch (versionErr: any) {
        if (versionErr?.status !== 409 && versionErr?.code !== 'RESOURCE_EXISTS') {
          throw versionErr;
        }
      }

      // 3. Create Default Free Plan
      const quotaNum = parseInt(freeQuota, 10) || 2000;
      const rpsNum = parseInt(freeRps, 10) || 10;
      try {
        await createProviderPlan(targetApiId, {
          name: 'Free',
          priceMonthly: 0,
          currency: 'USD',
          quota: quotaNum,
          rateLimit: rpsNum,
        });
      } catch (planErr: any) {
        if (planErr?.status !== 409 && planErr?.code !== 'RESOURCE_EXISTS') {
          throw planErr;
        }
      }

      // 4. Save Legal Affirmation & Privacy Contract (US-08)
      const agreementVer = currentServerAgreement.version;
      const ownershipDecl = ownershipType === 'OWN'
        ? 'API do chính Provider phát triển và sở hữu (First-Party Owner)'
        : 'API của bên thứ ba nhưng Provider được phép phân phối hợp pháp (Authorized Distributor)';
      const distributionRights = usesThirdPartyData
        ? 'Dịch vụ có tích hợp dữ liệu hoặc hạ tầng bên thứ ba đã được cấp phép'
        : 'Sở hữu toàn diện bản quyền mã nguồn và quyền phân phối dịch vụ';

      await saveProviderLegal(targetApiId, {
        ownershipDeclaration: ownershipDecl,
        distributionRights,
        dataClassification,
        agreementVersion: agreementVer,
        accepted: true,
        processesPersonalData,
        personalDataTypes: processesPersonalData ? selectedPersonalDataTypes : [],
        dataProcessingPurpose: processesPersonalData ? dataProcessingPurpose.trim() : undefined,
      });

      navigate(`/provider/publishing-workflow?api=${targetApiId}`);
    } catch (err) {
      setWizardError(formatProviderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
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

      {/* Global Wizard Error */}
      {wizardError && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{wizardError}</span>
          {createdDraftApiId && (
            <span className="text-xs text-on-surface font-mono bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant/30">
              Bản nháp #{createdDraftApiId} đã được lưu an toàn. Nhấn lại Hoàn tất để tiếp tục.
            </span>
          )}
        </div>
      )}

      {/* Unverified Warning Banner */}
      {!loadingInitial && !isVerified && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-amber-600 dark:text-amber-400">
              warning
            </span>
            <div>
              <h3 className="text-body-lg font-bold text-on-surface">
                Chưa xác minh danh tính Nhà cung cấp (US-06)
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Bạn cần hoàn tất hồ sơ xác minh trước khi có thể nộp duyệt hoặc xuất bản API.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon="verified_user"
            onClick={() => navigate('/provider/verification')}
          >
            Đến trang xác minh
          </Button>
        </div>
      )}

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
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('API Product Name')} <span className="text-error">*</span></label>
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
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Industry Category')} <span className="text-error">*</span></label>
                <CustomSelect<string>
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={CATEGORIES.map(c => ({
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
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">Nhãn (Tags)</label>
                <input
                  type="text"
                  placeholder="ai, nlp, classification (phân cách bằng dấu phẩy)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none"
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
              <label className="text-body-sm font-semibold text-on-surface block mb-1.5">{t('Upstream Base URL')} <span className="text-error">*</span></label>
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

            {/* Subsection 2: Domain Verification Notice */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">domain_verification</span>
                  {t('2. Xác minh quyền kiểm soát Domain (Domain Verification - US-08)')}
                </h4>
                <Badge variant="neutral">Bắt buộc khi nộp duyệt</Badge>
              </div>
              <p className="text-xs text-on-surface-variant">
                Địa chỉ máy chủ API: <code className="font-mono text-primary font-bold">{baseUrl}</code>. Trước khi nộp duyệt xuất bản chính thức, hệ thống yêu cầu cấu hình bản ghi DNS TXT để xác thực quyền kiểm soát tên miền này tại màn hình Publishing Workflow.
              </p>
            </div>

            {/* Subsection 3: Data Classification */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">policy</span>
                {t('3. Phân loại dữ liệu API (Data Classification)')}
              </h4>
              <p className="text-xs text-on-surface-variant">
                Lựa chọn cấp độ nhạy cảm dữ liệu do API xử lý theo tiêu chuẩn an toàn thông tin:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Public', 'Internal', 'Confidential', 'Restricted'] as const).map(cls => (
                  <label
                    key={cls}
                    className={`p-3 rounded-xl border cursor-pointer text-center text-body-xs font-semibold transition-colors ${
                      dataClassification === cls
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface-container text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="classification"
                      value={cls}
                      checked={dataClassification === cls}
                      onChange={() => setDataClassification(cls)}
                      className="sr-only"
                    />
                    {cls}
                  </label>
                ))}
              </div>
            </div>

            {/* Subsection 3.1: Personal Data & Privacy Declaration (US-08 / Migration 005) */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <h4 className="font-bold text-on-surface text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                Khai báo Xử lý Dữ liệu Cá nhân & Quyền riêng tư (Privacy Contract)
              </h4>
              <p className="text-xs text-on-surface-variant">
                Tuân thủ quy định bảo vệ dữ liệu cá nhân (GDPR / Nghị định 13/2023/NĐ-CP):
              </p>

              <label className="flex items-center gap-3 text-body-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={processesPersonalData}
                  onChange={e => {
                    const checked = e.target.checked;
                    setProcessesPersonalData(checked);
                    if (!checked) {
                      setSelectedPersonalDataTypes([]);
                      setDataProcessingPurpose('');
                    }
                  }}
                  className="rounded accent-primary w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-on-surface">
                  API này có tiếp nhận, xử lý hoặc truyền tải Dữ liệu Cá nhân của người dùng.
                </span>
              </label>

              {processesPersonalData && (
                <div className="space-y-4 pt-3 border-t border-outline-variant/20 pl-2">
                  <div>
                    <label className="text-body-xs font-bold text-on-surface block mb-1.5">
                      Các loại dữ liệu cá nhân API xử lý <span className="text-error">*</span>:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALL_PERSONAL_DATA_TYPES.map(item => (
                        <label key={item.type} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedPersonalDataTypes.includes(item.type)}
                            onChange={() => togglePersonalDataType(item.type)}
                            className="rounded accent-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-body-xs font-bold text-on-surface block mb-1.5">
                      Mục đích xử lý dữ liệu (Data Processing Purpose) <span className="text-error">*</span>:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={dataProcessingPurpose}
                      onChange={e => setDataProcessingPurpose(e.target.value)}
                      placeholder="Nêu rõ mục đích hợp pháp, ví dụ: Xác thực danh tính người dùng và thực hiện thanh toán giao dịch..."
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-high text-on-surface text-body-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Subsection 4: Provider Agreement */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-body-xs font-bold uppercase tracking-wider text-primary">
                  Thỏa thuận Nhà cung cấp ({agreement ? `Phiên bản: ${agreement.version}` : 'Đang tải...'})
                </span>
                {agreement?.effectiveAt && (
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    Hiệu lực từ: {new Date(agreement.effectiveAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {agreementError ? (
                <div role="alert" className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-body-xs flex items-center justify-between">
                  <span>{agreementError}</span>
                  <Button size="sm" variant="secondary" onClick={() => {
                    setAgreementError(null);
                    getProviderAgreement().then(res => {
                      if (!res || !res.version || !res.content || !res.content.trim()) {
                        setAgreement(null);
                        setAgreementError('Nội dung Thỏa thuận Nhà cung cấp từ máy chủ bị trống hoặc không hợp lệ.');
                        setLegalConfirmed(false);
                        setAcceptedAgreementVersion(null);
                      } else {
                        if (lastAgreementIdRef.current && (lastAgreementIdRef.current !== res.id || agreement?.version !== res.version)) {
                          setLegalConfirmed(false);
                          setAcceptedAgreementVersion(null);
                        }
                        lastAgreementIdRef.current = res.id;
                        setAgreement(res);
                        setAgreementError(null);
                      }
                    }).catch(err => {
                      setAgreement(null);
                      setAgreementError(formatProviderErrorMessage(err));
                      setLegalConfirmed(false);
                      setAcceptedAgreementVersion(null);
                    });
                  }}>
                    Thử lại
                  </Button>
                </div>
              ) : agreement?.content && agreement.content.trim() ? (
                <div className="p-3 rounded-lg bg-surface-container-high border border-outline-variant/20 max-h-36 overflow-y-auto text-body-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap font-sans">
                  {agreement.content}
                </div>
              ) : (
                <div className="text-body-xs text-on-surface-variant italic">
                  Đang đồng bộ điều khoản thỏa thuận từ hệ thống...
                </div>
              )}

              <label className="flex items-start gap-3 text-body-sm cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  disabled={!isAgreementValid}
                  checked={legalConfirmed && acceptedAgreementVersion === agreement?.version}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setLegalConfirmed(checked);
                    setAcceptedAgreementVersion(checked && agreement?.version ? agreement.version : null);
                  }}
                  className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer disabled:opacity-50"
                />
                <span className="text-on-surface leading-relaxed text-xs sm:text-body-sm">
                  <strong>Tôi đã đọc, hiểu rõ và đồng ý với Thỏa thuận Nhà cung cấp ({agreement?.version || 'N/A'}): </strong>
                  Tôi cam kết có quyền hợp pháp để cung cấp API này, thông tin và bảng giá được khai báo chính xác, không cung cấp dữ liệu trái phép, không xâm phạm quyền của bên thứ ba, và chịu trách nhiệm toàn bộ đối với nội dung/dữ liệu mà API cung cấp.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="md" onClick={() => setStep(3)}>
                {t('← Back')}
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={submitting || !legalConfirmed || !isAgreementValid || acceptedAgreementVersion !== agreement?.version}
                onClick={handleFinish}
                icon="check_circle"
              >
                {submitting ? 'Đang tạo API...' : 'Hoàn tất & Đăng ký API'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
