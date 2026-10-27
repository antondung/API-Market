import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import {
  listConsumerApiKeys,
  createConsumerApiKey,
  rotateConsumerApiKey,
  revokeConsumerApiKey,
  type ConsumerApiKey,
  type CreateApiKeyResult,
} from '../../services/consumerApi';
import { ApiError } from '../../services/authApi';

export const ApiKeysPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, isAuthenticated } = useAuth();

  const [keys, setKeys] = useState<ConsumerApiKey[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Create Key Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyApiId, setNewKeyApiId] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // One-time Plaintext Secret Reveal Modal (strictly in-memory, wiped immediately)
  const [revealedSecretData, setRevealedSecretData] = useState<{
    secret: string;
    keyPrefix: string;
    apiId: string;
    label: string | null;
    isRotated?: boolean;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Confirmation Modals for Destructive Operations
  const [revokeModalKey, setRevokeModalKey] = useState<ConsumerApiKey | null>(null);
  const [rotateModalKey, setRotateModalKey] = useState<ConsumerApiKey | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load keys from backend
  const fetchKeys = useCallback(async (currentPage: number, signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setKeys([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await listConsumerApiKeys(currentPage, pageSize, signal);
      setKeys(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      if (signal?.aborted) return;
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(t('Phiên đăng nhập hết hạn hoặc chưa xác thực Consumer.'));
        } else if (err.status === 403) {
          setError(t('Chỉ tài khoản Consumer mới có quyền truy cập kho API Keys.'));
        } else {
          setError(err.message || t('Lỗi khi tải danh sách API Keys.'));
        }
      } else {
        setError(t('Không thể kết nối đến máy chủ.'));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, pageSize, t]);

  useEffect(() => {
    const controller = new AbortController();
    fetchKeys(page, controller.signal);
    return () => controller.abort();
  }, [fetchKeys, page]);

  // Security lifecycle: Wipe sensitive secret state on modal close, unmount, auth switch, or logout
  const handleCloseSecretModal = () => {
    setRevealedSecretData(null);
    setCopiedSecret(false);
  };

  useEffect(() => {
    const handleLogout = () => {
      setRevealedSecretData(null);
      setCopiedSecret(false);
      setNewKeyApiId('');
      setNewKeyLabel('');
      setKeys([]);
    };

    window.addEventListener('apihub:session-invalidated', handleLogout);
    return () => {
      setRevealedSecretData(null);
      setCopiedSecret(false);
      window.removeEventListener('apihub:session-invalidated', handleLogout);
    };
  }, [currentUser?.id]);

  const handleCopyPrefix = async (key: ConsumerApiKey) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(key.keyPrefix);
        setCopiedKeyId(key.id);
        setTimeout(() => setCopiedKeyId(null), 2000);
      } catch {
        // clipboard access denied - do not show false positive copy success
      }
    }
  };

  const handleCopySecret = async () => {
    if (!revealedSecretData?.secret) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(revealedSecretData.secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2500);
      } catch {
        // clipboard access denied
      }
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedApiId = newKeyApiId.trim();
    if (!trimmedApiId || !/^[1-9][0-9]{0,9}$/.test(trimmedApiId)) {
      setCreateError(t('Vui lòng nhập API ID hợp lệ (số nguyên dương, ví dụ: 1).'));
      return;
    }

    let createdResult: CreateApiKeyResult | null = null;
    try {
      setIsSubmitting(true);
      setCreateError(null);
      createdResult = await createConsumerApiKey(trimmedApiId, newKeyLabel.trim() || undefined);
      setCreateModalOpen(false);
      setNewKeyApiId('');
      setNewKeyLabel('');
      // Reveal one-time secret
      setRevealedSecretData({
        secret: createdResult.key,
        keyPrefix: createdResult.keyPrefix,
        apiId: createdResult.apiId,
        label: createdResult.label,
        isRotated: false,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setCreateError(t('Một khóa đang hoạt động đã tồn tại cho API này. Vui lòng rotate hoặc thu hồi khóa hiện tại trước.'));
        } else if (err.status === 404) {
          setCreateError(t('API không tồn tại hoặc chưa được công khai.'));
        } else if (err.status === 403) {
          setCreateError(t('Chỉ Consumer mới có quyền tạo API Key.'));
        } else {
          setCreateError(err.message || t('Lỗi tạo khóa.'));
        }
      } else {
        setCreateError(t('Không thể tạo API Key.'));
      }
      return;
    } finally {
      setIsSubmitting(false);
    }

    // Refresh list independently after successful creation to prevent masking successful secret generation
    try {
      await fetchKeys(page);
    } catch {
      // List refresh failure does not invalidate the created key
    }
  };

  const handleRotateKey = async () => {
    if (!rotateModalKey) return;
    let rotatedResult: CreateApiKeyResult | null = null;
    try {
      setIsSubmitting(true);
      setActionError(null);
      rotatedResult = await rotateConsumerApiKey(rotateModalKey.id);
      setRotateModalKey(null);
      setRevealedSecretData({
        secret: rotatedResult.key,
        keyPrefix: rotatedResult.keyPrefix,
        apiId: rotatedResult.apiId,
        label: rotatedResult.label,
        isRotated: true,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setActionError(t('Khóa này đã bị thu hồi trước đó, không thể rotate.'));
        } else {
          setActionError(err.message || t('Lỗi khi xoay vòng khóa.'));
        }
      } else {
        setActionError(t('Không thể xoay vòng khóa.'));
      }
      return;
    } finally {
      setIsSubmitting(false);
    }

    // Refresh list independently
    try {
      await fetchKeys(page);
    } catch {
      // List refresh failure does not invalidate the rotated key
    }
  };

  const handleRevokeKey = async () => {
    if (!revokeModalKey) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await revokeConsumerApiKey(revokeModalKey.id);
      setRevokeModalKey(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message || t('Lỗi khi thu hồi khóa.'));
      } else {
        setActionError(t('Không thể thu hồi khóa.'));
      }
      return;
    } finally {
      setIsSubmitting(false);
    }

    // Refresh list independently
    try {
      await fetchKeys(page);
    } catch {
      // List refresh failure
    }
  };

  return (
    <PageReveal className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('API Keys & Credentials Vault')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Quản lý mã truy cập định danh người dùng qua Gateway. Khóa bảo mật theo nguyên tắc Zero Plaintext.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'card' ? 'bg-surface-container-highest text-primary font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title={t('Xem dạng thẻ')}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-surface-container-highest text-primary font-bold shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title={t('Xem dạng bảng')}
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
          </div>
          <Button
            variant="primary"
            icon="add"
            shine={true}
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
          >
            {t('Create New API Key')}
          </Button>
        </div>
      </div>

      {/* Backend Integration Advisory */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] mt-0.5 flex-shrink-0">
          security
        </span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">{t('Zero Plaintext Policy & Cryptographic Generation:')} </strong>
          {t('Khóa được sinh bằng 256-bit random mật mã từ máy chủ. Chuỗi secret chỉ hiển thị đúng một lần duy nhất tại thời điểm cấp phát/rotate. Máy chủ chỉ lưu bản băm SHA-256.')}
          <span className="block mt-1 text-[12px] text-on-surface-variant/80">
            {t('Lưu ý: API Key dùng để định danh và xác thực phạm vi API qua Gateway; quyền sử dụng gói cước nâng cao sẽ được quản lý qua Subscription Entitlement.')}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchKeys(page)}>
            {t('Thử lại')}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center text-on-surface-variant">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p>{t('Đang tải danh sách API Keys...')}</p>
        </div>
      ) : keys.length === 0 ? (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-surface-container text-on-surface-variant/60 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">key_off</span>
          </div>
          <h3 className="text-body-lg font-bold text-on-surface mb-1">
            {t('Chưa có API key nào được cấp phát')}
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
            {t('Tạo API Key đầu tiên để bắt đầu gọi API của nhà cung cấp qua Gateway một cách an toàn.')}
          </p>
          <Button
            variant="primary"
            icon="add"
            onClick={() => setCreateModalOpen(true)}
          >
            {t('Create New API Key')}
          </Button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keys.map(k => {
            const isCopied = copiedKeyId === k.id;
            return (
              <AnimatedCard
                key={k.id}
                hoverLift={true}
                className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-body-lg font-bold text-on-surface">
                        {k.label || t('Unnamed Key')}
                      </h3>
                      <span className="text-[12px] text-on-surface-variant block mt-0.5">
                        API ID: <code className="text-primary font-bold">{k.apiId}</code>
                      </span>
                    </div>
                    <Badge
                      variant={k.isActive && !k.revokedAt ? 'success' : 'danger'}
                      size="sm"
                    >
                      {k.isActive && !k.revokedAt ? t('Active') : t('Revoked')}
                    </Badge>
                  </div>

                  {/* Masked Prefix Display */}
                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 my-4 flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[11px] uppercase font-bold text-on-surface-variant block mb-0.5">
                        {t('Key Prefix (Định danh)')}
                      </span>
                      <code className="font-code-md text-code-sm text-primary font-bold block truncate tracking-wider">
                        {k.keyPrefix}••••••••
                      </code>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyPrefix(k)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                        title={isCopied ? t('Đã sao chép prefix') : t('Sao chép prefix')}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Attributes */}
                  <div className="grid grid-cols-2 gap-3 text-body-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Ngày tạo')}</span>
                      <span className="font-code-sm">{new Date(k.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Lần dùng cuối')}</span>
                      <span className="font-code-sm">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('vi-VN') : t('Chưa dùng')}</span>
                    </div>
                    {k.revokedAt && (
                      <div className="col-span-2 text-error">
                        <span className="text-[11px] block text-error/70">{t('Thời điểm thu hồi')}</span>
                        <span className="font-code-sm">{new Date(k.revokedAt).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-[12px] text-on-surface-variant">
                    {k.isActive && !k.revokedAt ? t('Sẵn sàng cho Gateway') : t('Không thể sử dụng')}
                  </span>
                  {k.isActive && !k.revokedAt && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="sync"
                        onClick={() => {
                          setActionError(null);
                          setRotateModalKey(k);
                        }}
                      >
                        {t('Rotate')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon="delete"
                        onClick={() => {
                          setActionError(null);
                          setRevokeModalKey(k);
                        }}
                      >
                        {t('Revoke')}
                      </Button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                <tr>
                  <th className="px-5 py-3.5">{t('Tên khóa (Label)')}</th>
                  <th className="px-5 py-3.5">{t('Phạm vi (API ID)')}</th>
                  <th className="px-5 py-3.5">{t('Tiền tố khóa (Prefix)')}</th>
                  <th className="px-5 py-3.5">{t('Trạng thái')}</th>
                  <th className="px-5 py-3.5">{t('Ngày tạo')}</th>
                  <th className="px-5 py-3.5">{t('Lần dùng cuối')}</th>
                  <th className="px-5 py-3.5 text-right">{t('Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                {keys.map(k => {
                  const isCopied = copiedKeyId === k.id;
                  const isActive = k.isActive && !k.revokedAt;
                  return (
                    <tr key={k.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-on-surface block">
                          {k.label || t('Unnamed Key')}
                        </span>
                        <span className="text-[12px] text-on-surface-variant font-code-sm">ID: {k.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="primary" size="sm">
                          API #{k.apiId}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-code-md text-code-sm text-primary font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>{k.keyPrefix}••••</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPrefix(k)}
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title={isCopied ? t('Đã sao chép') : t('Sao chép')}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isCopied ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isActive ? (
                          <Badge variant="success" size="sm">{t('Active')}</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">{t('Revoked')}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                        {new Date(k.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('vi-VN') : t('Chưa dùng')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isActive && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="sync"
                              onClick={() => {
                                setActionError(null);
                                setRotateModalKey(k);
                              }}
                            >
                              {t('Rotate')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon="delete"
                              onClick={() => {
                                setActionError(null);
                                setRevokeModalKey(k);
                              }}
                            >
                              {t('Revoke')}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {total > pageSize && (
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
          <span className="text-body-sm text-on-surface-variant">
            {t('Trang')} {page} / {Math.ceil(total / pageSize)} ({total} {t('khóa tổng cộng')})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('Trước')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage(p => p + 1)}
            >
              {t('Sau')}
            </Button>
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setNewKeyApiId('');
          setNewKeyLabel('');
          setCreateError(null);
        }}
        title={t('Tạo API Key Mới')}
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-body-xs text-on-surface-variant">
            {t('Mỗi Consumer chỉ được cấp 1 API Key đang hoạt động cho mỗi API. Secret key sẽ chỉ được hiển thị một lần duy nhất sau khi tạo.')}
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1.5">
              {t('API ID (Bắt buộc)')} *
            </label>
            <input
              type="text"
              required
              value={newKeyApiId}
              onChange={(e) => setNewKeyApiId(e.target.value)}
              placeholder="e.g. 1"
              pattern="^[1-9][0-9]{0,9}$"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none font-code-sm"
            />
            <span className="text-[12px] text-on-surface-variant/70 block mt-1">
              {t('ID của API đã công khai trên Marketplace')}
            </span>
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1.5">
              {t('Tên gợi nhớ (Label - Tùy chọn)')}
            </label>
            <input
              type="text"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder={t('e.g. Production Backend Cluster')}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
            />
          </div>

          {createError && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-body-xs">
              {createError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                setNewKeyApiId('');
                setNewKeyLabel('');
                setCreateError(null);
              }}
              disabled={isSubmitting}
            >
              {t('Hủy')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !newKeyApiId.trim()}
            >
              {isSubmitting ? t('Đang tạo...') : t('Tạo Khóa')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ONE-TIME SECRET REVEAL MODAL */}
      <Modal
        isOpen={Boolean(revealedSecretData)}
        onClose={handleCloseSecretModal}
        title={revealedSecretData?.isRotated ? t('Đã Xoay Vòng API Key Mới') : t('Khóa API Của Bạn Đã Sẵn Sàng')}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div className="text-body-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-bold">{t('Lưu ý bảo mật quan trọng:')} </strong>
              {t('Đây là lần duy nhất bạn thấy toàn bộ chuỗi Secret Key này. Hệ thống không lưu trữ chuỗi này ở dạng plaintext. Vui lòng sao chép và lưu trữ an toàn ngay bây giờ.')}
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1.5">
              {t('Full Secret Key (Dùng làm header X-API-Key trên Gateway)')}
            </label>
            <div className="p-3 bg-surface-container-highest rounded-xl border border-primary/30 flex items-center justify-between gap-3">
              <code className="font-code-md text-code-sm text-primary font-bold break-all select-all">
                {revealedSecretData?.secret}
              </code>
              <Button
                variant="primary"
                size="sm"
                icon={copiedSecret ? 'check' : 'content_copy'}
                onClick={handleCopySecret}
                className="flex-shrink-0"
              >
                {copiedSecret ? t('Đã chép!') : t('Sao chép')}
              </Button>
            </div>
          </div>

          <div className="text-[12px] text-on-surface-variant space-y-1 bg-surface-container p-3 rounded-xl">
            <div><strong>API ID:</strong> {revealedSecretData?.apiId}</div>
            <div><strong>Prefix:</strong> {revealedSecretData?.keyPrefix}</div>
            {revealedSecretData?.label && <div><strong>Label:</strong> {revealedSecretData.label}</div>}
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
            <Button variant="primary" onClick={handleCloseSecretModal}>
              {t('Tôi đã lưu khóa an toàn')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rotate Key Confirmation Modal */}
      <Modal
        isOpen={Boolean(rotateModalKey)}
        onClose={() => {
          setRotateModalKey(null);
          setActionError(null);
        }}
        title={t('Xác nhận Xoay Vòng (Rotate) API Key')}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-body-xs leading-relaxed">
            <strong>{t('Cảnh báo:')} </strong>
            {t('Khóa cũ sẽ bị vô hiệu hóa (revoked) ngay lập tức. Mọi ứng dụng đang dùng khóa cũ sẽ bị từ chối kết nối tức thì (không có thời gian ân hạn).')}
          </div>

          <p className="text-body-sm text-on-surface-variant">
            {t('Bạn có chắc chắn muốn xoay vòng khóa')} <strong>{rotateModalKey?.label || rotateModalKey?.keyPrefix}</strong> {t('cho API ID')} #{rotateModalKey?.apiId}?
          </p>

          {actionError && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-body-xs">
              {actionError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => {
                setRotateModalKey(null);
                setActionError(null);
              }}
              disabled={isSubmitting}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="danger"
              icon="sync"
              onClick={handleRotateKey}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('Đang xoay vòng...') : t('Xác nhận Rotate')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Key Confirmation Modal */}
      <Modal
        isOpen={Boolean(revokeModalKey)}
        onClose={() => {
          setRevokeModalKey(null);
          setActionError(null);
        }}
        title={t('Xác nhận Thu Hồi (Revoke) API Key')}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-body-xs leading-relaxed">
            <strong>{t('Cảnh báo không thể hoàn tác:')} </strong>
            {t('Khóa này sẽ bị thu hồi vĩnh viễn và không thể kích hoạt lại.')}
          </div>

          <p className="text-body-sm text-on-surface-variant">
            {t('Bạn có chắc chắn muốn thu hồi khóa')} <strong>{revokeModalKey?.label || revokeModalKey?.keyPrefix}</strong> (API #{revokeModalKey?.apiId})?
          </p>

          {actionError && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-body-xs">
              {actionError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => {
                setRevokeModalKey(null);
                setActionError(null);
              }}
              disabled={isSubmitting}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="danger"
              icon="delete"
              onClick={handleRevokeKey}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('Đang thu hồi...') : t('Xác nhận Thu Hồi')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
