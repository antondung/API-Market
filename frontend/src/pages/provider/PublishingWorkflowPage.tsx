import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import {
  listProviderApis,
  getProviderPublishStatus,
  submitProviderApiReview,
  getProviderVerification,
  listProviderEndpoints,
  listProviderPlans,
  getProviderLegal,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type {
  ProviderApi,
  PublishStatus,
  ProviderVerification,
  ProviderEndpoint,
  ProviderPlan,
  ProviderLegal,
  ApiStatus,
} from '../../services/providerTypes';

export const PublishingWorkflowPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const queryApiId = searchParams.get('api');

  const [apis, setApis] = useState<ProviderApi[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>(queryApiId || '');
  const [loadingApis, setLoadingApis] = useState(true);

  // Status & Readiness data
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [endpoints, setEndpoints] = useState<ProviderEndpoint[]>([]);
  const [plans, setPlans] = useState<ProviderPlan[]>([]);
  const [legal, setLegal] = useState<ProviderLegal | null>(null);

  const [_loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // 1. Fetch APIs list on mount
  useEffect(() => {
    const controller = new AbortController();
    setLoadingApis(true);
    listProviderApis(1, 100, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          const items = res.items || [];
          setApis(items);
          if (items.length > 0) {
            const currentSelected = queryApiId && items.some(a => a.id === queryApiId)
              ? queryApiId
              : items[0].id;
            setSelectedApiId(currentSelected);
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
          setLoadingApis(false);
        }
      });

    return () => controller.abort();
  }, []);

  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
    setSearchParams({ api: apiId });
    setSubmitSuccess(null);
  };

  // 2. Fetch Readiness Checklist & Status for Selected API
  useEffect(() => {
    if (!selectedApiId) return;

    const controller = new AbortController();
    setLoadingDetails(true);
    setError(null);

    Promise.all([
      getProviderPublishStatus(selectedApiId, controller.signal).catch(() => null),
      getProviderVerification(controller.signal).catch(() => null),
      listProviderEndpoints(selectedApiId, controller.signal).catch(() => []),
      listProviderPlans(selectedApiId, controller.signal).catch(() => []),
      getProviderLegal(selectedApiId, controller.signal).catch(() => null),
    ])
      .then(([statusRes, verRes, epRes, plRes, legRes]) => {
        if (!controller.signal.aborted) {
          setPublishStatus(statusRes);
          setVerification(verRes);
          setEndpoints(epRes);
          setPlans(plRes);
          setLegal(legRes);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      });

    return () => controller.abort();
  }, [selectedApiId]);

  const selectedApi = apis.find(a => a.id === selectedApiId);
  const currentStatus: ApiStatus = publishStatus?.status || selectedApi?.status || 'Draft';

  const stages = [
    { key: 'Draft', label: '1. Bản nháp', desc: 'Định nghĩa endpoint và thiết lập bảng giá' },
    { key: 'Submitted', label: '2. Đã nộp duyệt', desc: 'Đã gửi vào hàng đợi kiểm duyệt tuân thủ' },
    { key: 'UnderReview', label: '3. Đang thẩm định', desc: 'SecOps kiểm tra bảo mật, sandbox và pháp lý' },
    { key: 'Approved', label: '4. Đã duyệt', desc: 'Đạt kiểm định, sẵn sàng cấp quyền production' },
    { key: 'Published', label: '5. Đã xuất bản', desc: 'Hiển thị công khai trên API HUB Marketplace' },
  ];

  const getStageIndex = (status: ApiStatus) => {
    switch (status) {
      case 'Draft': return 0;
      case 'Submitted': return 1;
      case 'UnderReview':
      case 'Under Review': return 2;
      case 'Approved': return 3;
      case 'Published': return 4;
      case 'Rejected': return 1;
      default: return 0;
    }
  };

  const currentIdx = getStageIndex(currentStatus);

  // Validation checklist
  const isVerified = verification?.status === 'Verified';
  const hasEndpoints = endpoints.length > 0;
  const hasPlans = plans.length > 0;
  const hasLegal = Boolean(legal && legal.acceptedAt);
  const canSubmit = isVerified && hasEndpoints && hasPlans && hasLegal && currentStatus === 'Draft';

  const handleSubmit = async () => {
    if (!selectedApiId || submitting) return;
    setError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      const updatedApi = await submitProviderApiReview(selectedApiId);
      setPublishStatus({
        id: updatedApi.id,
        status: updatedApi.status,
        submittedAt: new Date().toISOString(),
      });
      setApis(prev => prev.map(a => (a.id === updatedApi.id ? updatedApi : a)));
      setSubmitSuccess('Đã nộp hồ sơ API thành công! API đã chuyển sang trạng thái Submitted để quản trị viên kiểm duyệt.');
    } catch (err) {
      setError(formatProviderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingApis) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading workflow page">
        <div className="h-20 bg-surface-container-high rounded-2xl" />
        <div className="h-96 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-4xl mx-auto my-8">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">publish</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để theo dõi xuất bản')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể kiểm tra danh mục sẵn sàng và nộp duyệt lên sàn.')}
        </p>
        <Button variant="primary" icon="add_circle" onClick={() => navigate('/provider/create-api')}>
          {t('Tạo API Mới')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header & API Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{selectedApi?.name || 'API'}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Publishing Workflow & Status Tracker')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Track the state progression of your API product according to the state machine defined in US-12 & US-13.')}
          </p>
        </div>

        {/* API Selector */}
        <div className="flex items-center gap-2">
          <label className="text-body-sm font-semibold text-on-surface whitespace-nowrap">
            Chọn API:
          </label>
          <select
            value={selectedApiId}
            onChange={e => handleSelectApi(e.target.value)}
            className="p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-medium outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
          >
            {apis.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3 text-body-sm">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => handleSelectApi(selectedApiId)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Success Notification Banner */}
      {submitSuccess && (
        <div role="status" className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-body-sm">
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
          <span>{submitSuccess}</span>
        </div>
      )}

      {/* Rejected Alert Banner */}
      {currentStatus === 'Rejected' && (
        <div className="p-5 rounded-2xl border border-error/40 bg-error-container/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-[28px] mt-0.5">error</span>
          <div>
            <h3 className="text-body-lg font-bold text-error">Hồ sơ API bị Từ chối Phê duyệt (Rejected)</h3>
            <p className="text-body-sm text-on-surface mt-1">
              Quản trị viên sàn đã từ chối hồ sơ xuất bản API này. Vui lòng kiểm tra lại cấu hình endpoint, tài liệu OpenAPI hoặc cập nhật giấy tờ pháp lý trước khi nộp lại.
            </p>
          </div>
        </div>
      )}

      {/* Visual Pipeline Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Workflow Stage Pipeline')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-body-sm text-on-surface-variant">{t('Current Status:')}</span>
              <StatusBadge status={currentStatus} />
            </div>
          </div>
          {canSubmit && (
            <Button
              variant="primary"
              icon="publish"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Đang nộp hồ sơ...' : t('Submit for Admin Review')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {stages.map((st, idx) => {
            const isCompleted = currentIdx > idx || currentStatus === 'Published';
            const isCurrent = currentIdx === idx && currentStatus !== 'Published';

            return (
              <div
                key={st.key}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : isCompleted
                    ? 'bg-surface-container border-emerald-500/30'
                    : 'bg-surface-container/50 border-outline-variant/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-body-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h4 className="text-body-md font-bold text-on-surface">{st.label}</h4>
                    <p className="text-body-xs text-on-surface-variant">{st.desc}</p>
                  </div>
                </div>

                <div>
                  {isCompleted && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-body-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Hoàn thành
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-primary text-body-xs font-semibold animate-pulse flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">pending</span>
                      Đang xử lý
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Readiness Checklist (US-12) */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
          Danh mục Sẵn sàng Nộp duyệt (Readiness Checklist)
        </h2>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Tất cả 4 điều kiện kỹ thuật và pháp lý dưới đây bắt buộc phải được thỏa mãn trước khi hệ thống cho phép kích hoạt quy trình nộp duyệt.
        </p>

        <div className="divide-y divide-outline-variant/20">
          {/* Check 1: Provider Verification */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${isVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                {isVerified ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">1. Xác minh Danh tính Nhà cung cấp (US-06)</h4>
                <p className="text-body-xs text-on-surface-variant">
                  {isVerified
                    ? 'Đã hoàn tất xác minh danh tính và được phê duyệt (Verified).'
                    : 'Nhà cung cấp chưa hoàn thành xác minh danh tính (Draft / Pending / Rejected).'}
                </p>
              </div>
            </div>
            {!isVerified && (
              <Button size="sm" variant="ghost" icon="launch" onClick={() => navigate('/provider/verification')}>
                Xác minh ngay
              </Button>
            )}
          </div>

          {/* Check 2: Endpoints */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${hasEndpoints ? 'text-emerald-600' : 'text-amber-500'}`}>
                {hasEndpoints ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">2. Định tuyến Endpoint & Phiên bản (US-09)</h4>
                <p className="text-body-xs text-on-surface-variant">
                  {hasEndpoints
                    ? `Đã định cấu hình ${endpoints.length} tuyến đường endpoint khả dụng.`
                    : 'Cần có ít nhất 1 endpoint route để người dùng có thể gọi API.'}
                </p>
              </div>
            </div>
            {!hasEndpoints && (
              <Button size="sm" variant="ghost" icon="launch" onClick={() => navigate(`/provider/endpoints?api=${selectedApiId}`)}>
                Thêm Endpoint
              </Button>
            )}
          </div>

          {/* Check 3: Pricing Plans */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${hasPlans ? 'text-emerald-600' : 'text-amber-500'}`}>
                {hasPlans ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">3. Bảng giá & Gói cước (US-11)</h4>
                <p className="text-body-xs text-on-surface-variant">
                  {hasPlans
                    ? `Đã thiết lập ${plans.length} gói cước với hạn mức quota và rate limit rõ ràng.`
                    : 'Cần có ít nhất 1 gói cước (ví dụ Free) để người dùng đăng ký sử dụng.'}
                </p>
              </div>
            </div>
            {!hasPlans && (
              <Button size="sm" variant="ghost" icon="launch" onClick={() => navigate(`/provider/pricing?api=${selectedApiId}`)}>
                Thêm Gói cước
              </Button>
            )}
          </div>

          {/* Check 4: Legal Affirmation */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[24px] ${hasLegal ? 'text-emerald-600' : 'text-amber-500'}`}>
                {hasLegal ? 'check_circle' : 'cancel'}
              </span>
              <div>
                <h4 className="text-body-md font-bold text-on-surface">4. Cam kết Pháp lý & Phân loại Dữ liệu (US-08)</h4>
                <p className="text-body-xs text-on-surface-variant">
                  {hasLegal
                    ? `Đã cam kết bản quyền sở hữu (${legal?.ownershipDeclaration}) và chấp thuận Thỏa thuận Nhà cung cấp (${legal?.agreementVersion}).`
                    : 'Chưa hoàn tất tuyên bố quyền sở hữu và chấp thuận Thỏa thuận Nhà cung cấp.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-body-sm text-on-surface-variant">
            {canSubmit ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">check</span>
                Hồ sơ đã đạt 100% điều kiện sẵn sàng. Bạn có thể nộp duyệt ngay bây giờ.
              </span>
            ) : currentStatus !== 'Draft' ? (
              <span>Hồ sơ đang ở giai đoạn <strong>{currentStatus}</strong>, không cần nộp lại trừ khi bị từ chối.</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Vui lòng hoàn thành các mục đánh dấu chéo đỏ ở trên để mở khóa nút Nộp duyệt.
              </span>
            )}
          </div>

          <Button
            variant="primary"
            icon="publish"
            size="lg"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Đang gửi hồ sơ...' : 'Nộp duyệt cho Quản trị viên'}
          </Button>
        </div>
      </div>
    </div>
  );
};
