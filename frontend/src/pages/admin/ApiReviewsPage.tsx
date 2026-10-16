import React, { useEffect, useState } from 'react';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import {
  listAdminApis,
  getAdminApiDossier,
  reviewAdminApi,
  type AdminApiItem,
  type AdminApiStatus,
  type AdminApiReviewNext,
  type AdminApiDossier,
} from '../../services/adminReviewApi';
import { formatBackendErrorMessage } from '../../services/authApi';

const STATUS_TABS: AdminApiStatus[] = [
  'Submitted',
  'Under Review',
  'Approved',
  'Published',
  'Rejected',
  'Draft',
];

export const ApiReviewsPage: React.FC = () => {
  const { t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<AdminApiStatus>('Submitted');
  const [page, setPage] = useState(1);
  const [apis, setApis] = useState<AdminApiItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Review action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApiForReject, setSelectedApiForReject] = useState<AdminApiItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Dossier inspection modal
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [selectedApiForDossier, setSelectedApiForDossier] = useState<AdminApiItem | null>(null);
  const [dossier, setDossier] = useState<AdminApiDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);

  const fetchApis = (status = statusFilter, currentPage = page) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    listAdminApis(status, currentPage, 20, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          setApis(res.items || []);
          setTotal(res.total || 0);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatBackendErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  };

  useEffect(() => {
    return fetchApis(statusFilter, page);
  }, [statusFilter, page]);

  const handleStatusTabChange = (newStatus: AdminApiStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    setActionSuccess(null);
  };

  const handleTransition = async (api: AdminApiItem, next: AdminApiReviewNext, reason?: string) => {
    if (actionLoadingId) return;
    setActionLoadingId(api.id);
    setError(null);
    setActionSuccess(null);

    try {
      await reviewAdminApi(api.id, next, reason);
      setActionSuccess(`Chuyển trạng thái API "${api.name}" sang ${next} thành công.`);
      fetchApis(statusFilter, page);
    } catch (err) {
      setError(formatBackendErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReject = (api: AdminApiItem) => {
    setSelectedApiForReject(api);
    setRejectReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiForReject) return;

    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError('Vui lòng nêu rõ lý do từ chối hồ sơ API.');
      return;
    }

    setActionLoadingId(selectedApiForReject.id);
    setRejectError(null);

    try {
      await reviewAdminApi(selectedApiForReject.id, 'Rejected', trimmed);
      setRejectModalOpen(false);
      setSelectedApiForReject(null);
      setActionSuccess(`Đã từ chối xuất bản API "${selectedApiForReject.name}".`);
      fetchApis(statusFilter, page);
    } catch (err) {
      setRejectError(formatBackendErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDossier = (api: AdminApiItem) => {
    setSelectedApiForDossier(api);
    setDossier(null);
    setDossierError(null);
    setLoadingDossier(true);
    setDossierModalOpen(true);

    const controller = new AbortController();
    getAdminApiDossier(api.id, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setDossier(data);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setDossierError(formatBackendErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDossier(false);
        }
      });
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('API Review & Publishing Approval Console')}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Kiểm duyệt, thẩm định hồ sơ kỹ thuật và phê duyệt xuất bản API theo quy trình US-07, US-12, US-13.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map(st => (
          <button
            key={st}
            type="button"
            onClick={() => handleStatusTabChange(st)}
            className={`px-4 py-2 rounded-xl text-body-sm font-semibold transition-colors flex items-center gap-2 ${
              statusFilter === st
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>{st}</span>
            {statusFilter === st && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{total}</span>
            )}
          </button>
        ))}
      </div>

      {/* Global Alerts */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3 text-body-sm">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => fetchApis()}>
            Thử lại
          </Button>
        </div>
      )}

      {actionSuccess && (
        <div role="status" className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-3 text-body-sm">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* API Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-surface-container-low rounded-2xl border border-outline-variant/20" />
            ))}
          </div>
        ) : apis.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">rate_review</span>
            <h3 className="text-headline-sm font-bold text-on-surface">Không có API ở trạng thái {statusFilter}</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Hàng đợi kiểm duyệt hiện tại không có sản phẩm API nào cần xử lý.
            </p>
          </div>
        ) : (
          apis.map(api => (
            <div
              key={api.id}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-headline-sm font-bold text-on-surface">{api.name}</h3>
                  <StatusBadge status={api.status} />
                  <Badge variant="primary" size="sm">{api.category}</Badge>
                </div>

                <p className="text-body-sm text-on-surface-variant max-w-2xl line-clamp-2">
                  {api.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
                  <span>Nhà cung cấp: <strong className="text-on-surface">{api.providerName || api.accountName || api.providerId}</strong></span>
                  {api.providerEmail && <span>({api.providerEmail})</span>}
                  <span>•</span>
                  <span>Base URL: <code className="text-primary font-mono text-xs">{api.baseUrl}</code></span>
                  <span>•</span>
                  <span>Ngày nộp: <span className="font-mono text-xs">{api.submittedAt ? new Date(api.submittedAt).toLocaleDateString() : 'N/A'}</span></span>
                </div>

                {api.status === 'Rejected' && api.rejectionReason && (
                  <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-xs">
                    <strong>Lý do từ chối:</strong> {api.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon="article"
                  onClick={() => handleOpenDossier(api)}
                >
                  Hồ sơ Dossier
                </Button>

                {api.status === 'Submitted' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon="search"
                    disabled={actionLoadingId === api.id}
                    onClick={() => handleTransition(api, 'Under Review')}
                  >
                    Bắt đầu thẩm định
                  </Button>
                )}

                {api.status === 'Under Review' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      icon="check"
                      disabled={actionLoadingId === api.id}
                      onClick={() => handleTransition(api, 'Approved')}
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon="close"
                      disabled={actionLoadingId === api.id}
                      onClick={() => handleOpenReject(api)}
                    >
                      Từ chối
                    </Button>
                  </>
                )}

                {api.status === 'Approved' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon="public"
                    disabled={actionLoadingId === api.id}
                    onClick={() => handleTransition(api, 'Published')}
                  >
                    Xuất bản Live
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dossier Modal */}
      <Modal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        title={`Hồ sơ kiểm duyệt (Dossier): ${selectedApiForDossier?.name}`}
        description="Toàn bộ thông tin kỹ thuật, endpoint, pricing, pháp lý và xác minh domain của API."
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1">
          {loadingDossier ? (
            <div className="p-8 text-center text-body-sm text-on-surface-variant animate-pulse">
              Đang tải dữ liệu hồ sơ API...
            </div>
          ) : dossierError ? (
            <div role="alert" className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm">
              {dossierError}
            </div>
          ) : dossier ? (
            <div className="space-y-5 text-body-sm">
              {/* Provider Info */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  Thông tin Nhà cung cấp
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Tổ chức / Tên: <strong>{dossier.provider.providerName || dossier.provider.accountName}</strong></div>
                  <div>Email: <strong>{dossier.provider.email}</strong></div>
                  <div>Trạng thái xác minh KYC: <strong>{dossier.provider.verification?.status || 'Chưa xác minh'}</strong></div>
                </div>
              </div>

              {/* Domain Verification */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">domain_verification</span>
                  Xác minh quyền kiểm soát Domain (US-08)
                </h4>
                <div className="text-xs space-y-1">
                  <div>Hostname: <code className="font-mono text-primary">{dossier.domainVerification?.hostname || 'Chưa có'}</code></div>
                  <div>
                    Trạng thái DNS: {dossier.domainVerification?.verifiedAt ? (
                      <span className="text-emerald-600 font-semibold">Đã xác minh (Hợp lệ đến: {new Date(dossier.domainVerification.verificationExpiresAt || '').toLocaleDateString()})</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Chưa hoàn tất xác minh DNS</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Endpoints & Versions */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">route</span>
                  Phiên bản & Endpoints ({dossier.endpoints.length})
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {dossier.endpoints.map(ep => (
                    <div key={ep.id} className="flex items-center gap-2 text-xs font-mono p-1.5 rounded bg-surface-container-high">
                      <span className="font-bold text-primary">{ep.method}</span>
                      <span className="text-on-surface">{ep.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                  Bảng giá Gói cước ({dossier.plans.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {dossier.plans.map(p => (
                    <div key={p.id} className="p-2 rounded bg-surface-container-high space-y-0.5">
                      <div className="font-bold text-on-surface">{p.name} - ${p.priceMonthly}/tháng</div>
                      <div className="text-on-surface-variant">Quota: {p.quota.toLocaleString()} calls • Limit: {p.rateLimit} rps</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal & Personal Data */}
              <div className="p-4 rounded-xl bg-surface-container space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">gavel</span>
                  Pháp lý & Cam kết bảo mật dữ liệu (US-08)
                </h4>
                {dossier.legal ? (
                  <div className="text-xs space-y-1">
                    <div>Phân loại dữ liệu: <strong>{dossier.legal.dataClassification}</strong></div>
                    <div>Thỏa thuận: <strong>{dossier.legal.agreementVersion}</strong> (Đã chấp thuận)</div>
                    <div>
                      Xử lý Dữ liệu Cá nhân: {dossier.legal.processesPersonalData ? (
                        <span className="text-amber-600 font-semibold">CÓ ({dossier.legal.personalDataTypes?.join(', ')})</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">KHÔNG</span>
                      )}
                    </div>
                    {dossier.legal.dataProcessingPurpose && (
                      <div>Mục đích: {dossier.legal.dataProcessingPurpose}</div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600">Chưa khai báo pháp lý.</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end pt-3">
            <Button variant="outline" onClick={() => setDossierModalOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Từ chối phê duyệt API: ${selectedApiForReject?.name}`}
        description="Nêu rõ lý do từ chối kỹ thuật hoặc chính sách để Provider có căn cứ chỉnh sửa."
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          {rejectError && (
            <div role="alert" className="p-3 rounded-xl bg-error-container/20 text-error text-body-xs">
              {rejectError}
            </div>
          )}

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Lý do từ chối <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Tài liệu OpenAPI không khớp với các route đã khai báo, hoặc tên miền chưa được xác minh..."
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-error"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              icon="block"
              disabled={!rejectReason.trim()}
            >
              Xác nhận Từ chối
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
