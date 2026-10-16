import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../i18n';
import {
  getProviderVerification,
  submitProviderVerification,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type { ProviderVerification } from '../../services/providerTypes';

export const ProviderVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Form fields
  const [organizationName, setOrganizationName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [evidenceUrlInputs, setEvidenceUrlInputs] = useState<string[]>(['']);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch current verification status from server
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProviderVerification(controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          setVerification(res);
          if (res) {
            setOrganizationName(res.organizationName || '');
            setContactEmail(res.contactEmail || '');
            if (res.evidenceUrls && res.evidenceUrls.length > 0) {
              setEvidenceUrlInputs(res.evidenceUrls);
            }
          } else if (currentUser) {
            setContactEmail(currentUser.email || '');
          }
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [currentUser, retryKey]);

  const handleAddUrl = () => {
    if (evidenceUrlInputs.length < 10) {
      setEvidenceUrlInputs(prev => [...prev, '']);
    }
  };

  const handleRemoveUrl = (index: number) => {
    if (evidenceUrlInputs.length > 1) {
      setEvidenceUrlInputs(prev => prev.filter((_, i) => i !== index));
    } else {
      setEvidenceUrlInputs(['']);
    }
  };

  const handleUrlChange = (index: number, val: string) => {
    setEvidenceUrlInputs(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFormError(null);
    setSuccessMessage(null);

    const orgTrimmed = organizationName.trim();
    if (!orgTrimmed) {
      setFormError('Vui lòng nhập tên công ty / tổ chức.');
      return;
    }

    const emailTrimmed = contactEmail.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setFormError('Vui lòng nhập email liên hệ pháp lý hợp lệ.');
      return;
    }

    const validUrls = evidenceUrlInputs.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      setFormError('Vui lòng cung cấp ít nhất 1 liên kết tài liệu minh chứng (định dạng http:// hoặc https://).');
      return;
    }

    for (const u of validUrls) {
      try {
        const parsed = new URL(u);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setFormError(`Liên kết ${u} không hợp lệ. Phải bắt đầu bằng http:// hoặc https://`);
          return;
        }
      } catch {
        setFormError(`Liên kết ${u} không đúng định dạng URL hợp lệ.`);
        return;
      }
    }

    if (!agreementChecked) {
      setFormError('Bạn phải tích đồng ý với Thỏa thuận Nhà cung cấp trước khi nộp hồ sơ.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitProviderVerification({
        organizationName: orgTrimmed,
        contactEmail: emailTrimmed,
        evidenceUrls: validUrls,
      });
      setVerification(res);
      setSuccessMessage('Hồ sơ xác minh đã được nộp lên máy chủ thành công và đang chờ Admin xét duyệt.');
      setAgreementChecked(false);
    } catch (err) {
      setFormError(formatProviderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = verification?.status === 'Verified' || verification?.status === 'Pending';

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('API Provider Compliance & Identity Verification')}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Pursuant to Platform Legal Policy (PDF section 8), providers must be verified prior to publishing commercial APIs.')}
        </p>
      </div>

      {/* Global connection/load error */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 animate-pulse" aria-label="Loading verification status">
          <div className="h-28 rounded-2xl bg-surface-container-high" />
          <div className="h-96 rounded-2xl bg-surface-container-low" />
        </div>
      ) : (
        <>
          {/* Status Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              verification?.status === 'Verified'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : verification?.status === 'Pending'
                ? 'bg-amber-500/10 border-amber-500/30'
                : verification?.status === 'Rejected'
                ? 'bg-error-container/20 border-error/30'
                : 'bg-surface-container-low border-outline-variant/30'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  verification?.status === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : verification?.status === 'Pending'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : verification?.status === 'Rejected'
                    ? 'bg-error-container text-error'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">
                  {verification?.status === 'Verified'
                    ? 'verified'
                    : verification?.status === 'Pending'
                    ? 'pending_actions'
                    : verification?.status === 'Rejected'
                    ? 'gpp_bad'
                    : 'verified_user'}
                </span>
              </div>
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  {t('Verification Status:')}{' '}
                  {verification?.status === 'Verified'
                    ? 'Đã xác minh (Verified)'
                    : verification?.status === 'Pending'
                    ? 'Đang chờ duyệt (Pending)'
                    : verification?.status === 'Rejected'
                    ? 'Bị từ chối (Rejected)'
                    : 'Chưa nộp hồ sơ'}
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  {verification?.status === 'Verified'
                    ? t('Your credentials have been validated by Admin SecOps. You have full publishing privileges.')
                    : verification?.status === 'Pending'
                    ? 'Hồ sơ xác minh của bạn đã được ghi nhận và đang chờ đội ngũ Admin phê duyệt. Bạn chưa thể tạo hoặc nộp duyệt API cho đến khi được xác minh.'
                    : verification?.status === 'Rejected'
                    ? 'Hồ sơ xác minh trước đây của bạn đã bị từ chối. Bạn có thể kiểm tra lý do bên dưới, cập nhật thông tin minh chứng và gửi lại hồ sơ.'
                    : 'Vui lòng cung cấp thông tin pháp nhân và liên kết minh chứng để được mở quyền tạo và xuất bản API.'}
                </p>
                {verification?.submittedAt && (
                  <p className="text-[12px] text-on-surface-variant mt-1 font-code-sm">
                    Thời điểm nộp: {new Date(verification.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant={
                verification?.status === 'Verified'
                  ? 'success'
                  : verification?.status === 'Pending'
                  ? 'warning'
                  : verification?.status === 'Rejected'
                  ? 'danger'
                  : 'neutral'
              }
            >
              {verification?.status || 'Unverified'}
            </Badge>
          </div>

          {/* Rejection notice with reason */}
          {verification?.status === 'Rejected' && (
            <div role="alert" className="p-5 rounded-2xl border border-error/40 bg-error-container/20 space-y-2">
              <div className="flex items-center gap-2 text-error font-bold text-body-md">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>Lý do từ chối từ Ban Quản trị:</span>
              </div>
              <p className="text-body-sm text-on-surface pl-7 font-medium">
                {verification.rejectReason || 'Không có lý do chi tiết từ người duyệt.'}
              </p>
              <p className="text-body-xs text-on-surface-variant pl-7">
                Vui lòng khắc phục các điểm nêu trên và gửi lại hồ sơ xác minh bên dưới.
              </p>
            </div>
          )}

          {/* Verification Form */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-sm font-bold text-on-surface">
                {t('Business Entity Credentials')}
              </h2>
              {isLocked && (
                <span className="text-body-xs bg-surface-container px-3 py-1 rounded-full text-on-surface-variant font-medium">
                  {verification?.status === 'Verified' ? 'Hồ sơ đã khóa (Đã duyệt)' : 'Hồ sơ đã khóa (Đang duyệt)'}
                </span>
              )}
            </div>

            {formError && (
              <div role="alert" className="mb-6 p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
                {formError}
              </div>
            )}

            {successMessage && (
              <div role="status" className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-body-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                    {t('Official Company / Organization Name')} <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLocked || submitting}
                    maxLength={200}
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    placeholder="Công ty TNHH Công nghệ..."
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1 block">Tối đa 200 ký tự</span>
                </div>

                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                    {t('Compliance & Legal Contact Email')} <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isLocked || submitting}
                    maxLength={254}
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="legal@company.com"
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1 block">Dùng để nhận thông báo pháp lý và kiểm duyệt</span>
                </div>
              </div>

              {/* Evidence URLs list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-body-sm font-semibold text-on-surface block">
                    Liên kết tài liệu minh chứng pháp nhân (1-10 URL) <span className="text-error">*</span>
                  </label>
                  {!isLocked && evidenceUrlInputs.length < 10 && (
                    <Button type="button" size="sm" variant="secondary" icon="add" onClick={handleAddUrl}>
                      Thêm liên kết
                    </Button>
                  )}
                </div>
                <p className="text-body-xs text-on-surface-variant">
                  Cung cấp các đường dẫn HTTP/HTTPS công khai trỏ tới giấy chứng nhận ĐKKD, giấy phép hoạt động, hoặc hồ sơ năng lực.
                </p>

                {evidenceUrlInputs.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      required={idx === 0}
                      disabled={isLocked || submitting}
                      value={val}
                      onChange={e => handleUrlChange(idx, e.target.value)}
                      placeholder="https://example.com/license.pdf"
                      className="flex-1 p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-md outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />
                    {!isLocked && evidenceUrlInputs.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        icon="delete"
                        onClick={() => handleRemoveUrl(idx)}
                        title="Xóa liên kết này"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Legal Agreement Checkbox */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
                <h4 className="text-body-md font-bold text-on-surface">{t('Provider Agreement Declaration')}</h4>
                <label className="flex items-start gap-2.5 text-body-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isLocked || submitting}
                    checked={agreementChecked}
                    onChange={e => setAgreementChecked(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 mt-0.5 cursor-pointer disabled:opacity-60"
                  />
                  <span className="text-on-surface-variant leading-relaxed">
                    {t(
                      'I hereby attest that our organization legally owns or possesses legitimate distribution licenses for all APIs deployed on this platform. We accept liability for data privacy adherence (GDPR/CCPA) and agree that deceptive, scraping, or unverified upstream services are subject to immediate suspension by platform administration.'
                    )}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                <span className="text-body-xs text-on-surface-variant">
                  {isLocked
                    ? 'Hồ sơ đang ở trạng thái không thể nộp lại.'
                    : 'Kiểm tra kỹ thông tin trước khi nộp.'}
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLocked || submitting || !agreementChecked}
                  icon={submitting ? undefined : 'send'}
                >
                  {submitting
                    ? 'Đang gửi...'
                    : verification?.status === 'Rejected'
                    ? 'Gửi lại hồ sơ xác minh'
                    : 'Nộp hồ sơ xác minh'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
