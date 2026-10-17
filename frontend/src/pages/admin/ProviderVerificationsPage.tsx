import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import {
  listAdminVerifications,
  reviewAdminVerification,
  type AdminProviderVerification,
  type AdminVerificationStatus,
} from '../../services/adminReviewApi';
import { formatBackendErrorMessage } from '../../services/authApi';

export const ProviderVerificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<AdminVerificationStatus>('Pending');
  const [page, setPage] = useState(1);
  const [verifications, setVerifications] = useState<AdminProviderVerification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Session-bound request isolation refs
  const requestIdRef = useRef(0);
  const mutationRequestIdRef = useRef(0);
  const activeUserRef = useRef(currentUser?.id);

  // Review states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Reset and abort when admin user identity changes (e.g., Admin A -> Admin B or logout)
  useEffect(() => {
    const prevUserId = activeUserRef.current;
    activeUserRef.current = currentUser?.id;
    if (prevUserId !== currentUser?.id) {
      requestIdRef.current++;
      mutationRequestIdRef.current++;
      setActionLoadingId(null);
      setVerifications([]);
      setTotal(0);
      setError(null);
      setActionSuccess(null);
      setRejectModalOpen(false);
      setSelectedProviderId(null);
      if (!currentUser) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  const fetchVerifications = (status = statusFilter, currentPage = page) => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const requestUserId = currentUser?.id;

    if (!currentUser) {
      return () => controller.abort();
    }

    setLoading(true);
    setError(null);

    listAdminVerifications(status, currentPage, 20, controller.signal)
      .then(res => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setVerifications(res.items || []);
          setTotal(res.total || 0);
        }
      })
      .catch(err => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setError(formatBackendErrorMessage(err));
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current && !controller.signal.aborted && activeUserRef.current === requestUserId) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  };

  useEffect(() => {
    return fetchVerifications(statusFilter, page);
  }, [statusFilter, page, currentUser?.id]);

  const handleStatusChange = (newStatus: AdminVerificationStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    setActionSuccess(null);
  };

  const handleApprove = async (v: AdminProviderVerification) => {
    if (actionLoadingId) return;
    const mutationId = ++mutationRequestIdRef.current;
    const requestUserId = currentUser?.id;

    setActionLoadingId(v.providerId);
    setError(null);
    setActionSuccess(null);

    try {
      await reviewAdminVerification(v.providerId, 'Verified');
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setActionSuccess(`Đã phê duyệt xác minh thành công cho ${v.organizationName || v.providerName}.`);
        fetchVerifications(statusFilter, page);
      }
    } catch (err) {
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setError(formatBackendErrorMessage(err));
      }
    } finally {
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setActionLoadingId(null);
      }
    }
  };

  const handleOpenReject = (v: AdminProviderVerification) => {
    setSelectedProviderId(v.providerId);
    setSelectedOrgName(v.organizationName || v.providerName);
    setRejectReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setRejectError('Vui lòng nhập lý do từ chối hồ sơ.');
      return;
    }

    const mutationId = ++mutationRequestIdRef.current;
    const requestUserId = currentUser?.id;

    setActionLoadingId(selectedProviderId);
    setRejectError(null);

    try {
      await reviewAdminVerification(selectedProviderId, 'Rejected', trimmedReason);
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setRejectModalOpen(false);
        setSelectedProviderId(null);
        setActionSuccess(`Đã từ chối hồ sơ xác minh của ${selectedOrgName}.`);
        fetchVerifications(statusFilter, page);
      }
    } catch (err) {
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setRejectError(formatBackendErrorMessage(err));
      }
    } finally {
      if (activeUserRef.current === requestUserId && mutationId === mutationRequestIdRef.current) {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('Provider Identity & Compliance Verification Queue')}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Kiểm duyệt hồ sơ định danh, giấy phép kinh doanh và bằng chứng xác minh của Nhà cung cấp (US-06, US-07).
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['Pending', 'Verified', 'Rejected'] as const).map(st => (
          <button
            key={st}
            type="button"
            onClick={() => handleStatusChange(st)}
            className={`px-4 py-2 rounded-xl text-body-sm font-semibold transition-colors flex items-center gap-2 ${
              statusFilter === st
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>{st === 'Pending' ? 'Chờ kiểm duyệt' : st === 'Verified' ? 'Đã phê duyệt' : 'Đã từ chối'}</span>
            {statusFilter === st && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{total}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alert Notices */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3 text-body-sm">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => fetchVerifications()}>
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

      {/* Verification List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-surface-container-low rounded-2xl border border-outline-variant/20" />
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">verified_user</span>
            <h3 className="text-headline-sm font-bold text-on-surface">Không có yêu cầu xác minh</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Hiện không có hồ sơ nhà cung cấp nào ở trạng thái {statusFilter === 'Pending' ? 'chờ duyệt' : statusFilter === 'Verified' ? 'đã duyệt' : 'từ chối'}.
            </p>
          </div>
        ) : (
          verifications.map(v => (
            <div
              key={v.id}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-headline-sm font-bold text-on-surface">
                    {v.organizationName || v.providerName}
                  </h3>
                  <Badge variant={v.status === 'Verified' ? 'success' : v.status === 'Pending' ? 'warning' : 'danger'}>
                    {v.status === 'Verified' ? 'Đã duyệt' : v.status === 'Pending' ? 'Chờ kiểm duyệt' : 'Bị từ chối'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
                  <span>Tài khoản: <strong className="text-on-surface">{v.userName}</strong> ({v.email})</span>
                  <span>•</span>
                  <span>Provider ID: <code className="font-mono text-primary">{v.providerId}</code></span>
                  <span>•</span>
                  <span>Email liên hệ: <strong className="text-on-surface">{v.contactEmail}</strong></span>
                </div>

                {/* Evidence URLs */}
                <div>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold block mb-1">
                    Liên kết tài liệu minh chứng ({v.evidenceUrls?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {v.evidenceUrls?.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-body-xs font-mono border border-outline-variant/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        <span className="truncate max-w-[240px]">{url}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {v.status === 'Rejected' && v.rejectReason && (
                  <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-xs">
                    <strong>Lý do từ chối:</strong> {v.rejectReason}
                  </div>
                )}
              </div>

              {/* Review Actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {v.status === 'Pending' ? (
                  <>
                    <Button
                      size="md"
                      variant="primary"
                      icon="check"
                      disabled={actionLoadingId === v.providerId}
                      onClick={() => handleApprove(v)}
                    >
                      {actionLoadingId === v.providerId ? 'Đang duyệt...' : 'Phê duyệt'}
                    </Button>
                    <Button
                      size="md"
                      variant="danger"
                      icon="close"
                      disabled={actionLoadingId === v.providerId}
                      onClick={() => handleOpenReject(v)}
                    >
                      Từ chối
                    </Button>
                  </>
                ) : (
                  <span className="text-body-xs text-on-surface-variant font-mono">
                    {v.reviewedAt ? `Kiểm toán: ${new Date(v.reviewedAt).toLocaleString()}` : 'Đã xử lý'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Từ chối hồ sơ xác minh: ${selectedOrgName}`}
        description="Lý do từ chối sẽ được lưu vào biên bản kiểm toán (Audit Log) và thông báo tới Provider."
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
              placeholder="Nêu rõ lý do (ví dụ: Giấy tờ minh chứng không hợp lệ hoặc thiếu chứng nhận pháp lý)..."
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
