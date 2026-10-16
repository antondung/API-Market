import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import {
  listProviderApis,
  createProviderApi,
  updateProviderApi,
  deleteProviderApi,
  getProviderVerification,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type { ProviderApi, ProviderVerification } from '../../services/providerTypes';

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

export const MyApisInventoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Data states
  const [apis, setApis] = useState<ProviderApi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Verification state
  const [verification, setVerification] = useState<ProviderVerification | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Create / Edit modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ProviderApi | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProviderApi | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Unverified block modal
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);

  // Load APIs and Verification
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      listProviderApis(page, pageSize, controller.signal),
      getProviderVerification(controller.signal).catch(() => null),
    ])
      .then(([apisRes, verRes]) => {
        if (!controller.signal.aborted) {
          setApis(apisRes.items || []);
          setTotal(apisRes.total || 0);
          setVerification(verRes);
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
  }, [currentUser, page, retryKey]);

  const isVerified = verification?.status === 'Verified';

  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (!isVerified) {
      setShowUnverifiedModal(true);
      return;
    }
    setEditingApi(null);
    setFormName('');
    setFormDescription('');
    setFormCategory(CATEGORIES[0]);
    setFormBaseUrl('');
    setFormTags('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (api: ProviderApi) => {
    if (api.status !== 'Draft') {
      alert(t('Chỉ có thể chỉnh sửa thông tin API khi ở trạng thái Draft.'));
      return;
    }
    setEditingApi(api);
    setFormName(api.name);
    setFormDescription(api.description);
    setFormCategory(api.category || CATEGORIES[0]);
    setFormBaseUrl(api.baseUrl);
    setFormTags(api.tags ? api.tags.join(', ') : '');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save API (Create or Update)
  const handleSaveApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formSubmitting) return;

    setFormError(null);
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError('Vui lòng nhập tên API.');
      return;
    }

    const trimmedUrl = formBaseUrl.trim();
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setFormError('Base URL phải bắt đầu bằng http:// hoặc https://');
        return;
      }
    } catch {
      setFormError('Base URL không đúng định dạng URL hợp lệ.');
      return;
    }

    const tagList = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setFormSubmitting(true);
    try {
      if (editingApi) {
        const updated = await updateProviderApi(editingApi.id, {
          name: trimmedName,
          description: formDescription.trim(),
          category: formCategory,
          baseUrl: trimmedUrl,
          tags: tagList,
        });
        setApis(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      } else {
        const created = await createProviderApi({
          name: trimmedName,
          description: formDescription.trim(),
          category: formCategory,
          baseUrl: trimmedUrl,
          tags: tagList,
        });
        setApis(prev => [created, ...prev]);
        setTotal(t => t + 1);
      }
      setIsFormModalOpen(false);
    } catch (err) {
      setFormError(formatProviderErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete API
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProviderApi(deleteTarget.id);
      setApis(prev => prev.filter(a => a.id !== deleteTarget.id));
      setTotal(t => Math.max(0, t - 1));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(formatProviderErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Filtered APIs client-side for rapid search
  const filteredApis = apis.filter(api => {
    const matchesSearch =
      !searchQuery.trim() ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || api.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('My APIs & Endpoints Inventory')}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Manage your service definitions, review states, pricing plans, and version releases.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="auto_stories"
            onClick={() => navigate('/provider/import-openapi')}
          >
            {t('Import OpenAPI')}
          </Button>
          <Button
            variant="primary"
            icon="add"
            onClick={handleOpenCreateModal}
          >
            {t('Create New API')}
          </Button>
        </div>
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

      {/* Verification Warning Banner if not Verified */}
      {!loading && !isVerified && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-amber-600 dark:text-amber-400">
              warning
            </span>
            <div>
              <h3 className="text-body-lg font-bold text-on-surface">
                Yêu cầu Xác minh Danh tính Nhà cung cấp (US-06)
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Trạng thái hiện tại:{' '}
                <strong className="text-amber-700 dark:text-amber-300">
                  {verification?.status || 'Chưa nộp hồ sơ'}
                </strong>
                . Theo chính sách nền tảng (PDF phần 8), bạn cần hoàn tất xác minh trước khi có thể tạo hoặc xuất bản API thương mại.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon="verified_user"
            onClick={() => navigate('/provider/verification')}
          >
            Xác minh ngay
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, mô tả hoặc nhãn..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-body-xs font-semibold text-on-surface-variant whitespace-nowrap">
            Danh mục:
          </label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Tất cả danh mục</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-4 animate-pulse" aria-label="Loading APIs">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-surface-container-high" />
          ))}
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">
            api
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface mb-1">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Không tìm thấy API phù hợp'
              : t('Chưa có API nào')}
          </h3>
          <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc danh mục.'
              : t('Bạn chưa tạo hoặc nhập sản phẩm API nào vào danh mục của mình. Bắt đầu ngay với trình tạo API từng bước hoặc nhập từ tài liệu OpenAPI.')}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              icon="auto_stories"
              onClick={() => navigate('/provider/import-openapi')}
            >
              {t('Import OpenAPI')}
            </Button>
            <Button
              variant="primary"
              icon="add_circle"
              onClick={handleOpenCreateModal}
            >
              {t('Create New API')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApis.map(api => (
            <div
              key={api.id}
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[32px]">webhook</span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-headline-sm font-bold text-on-surface">{api.name}</h3>
                    <StatusBadge status={api.status} />
                    <Badge variant="primary">{api.category}</Badge>
                  </div>

                  <p className="text-body-sm text-on-surface-variant line-clamp-2 max-w-2xl">
                    {api.description || 'Chưa có mô tả cho API này.'}
                  </p>

                  {/* Rejection Reason notice if rejected */}
                  {api.status === 'Rejected' && api.rejectionReason && (
                    <div className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-xs flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                      <div>
                        <strong>Lý do từ chối:</strong> {api.rejectionReason}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
                    <span>
                      Base URL:{' '}
                      <code className="text-primary font-code-sm bg-surface-container px-2 py-0.5 rounded">
                        {api.baseUrl}
                      </code>
                    </span>
                    {api.tags && api.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {api.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[12px] text-on-surface-variant font-code-sm">
                      Tạo lúc: {new Date(api.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Matrix */}
              <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="alt_route"
                    onClick={() => navigate(`/provider/endpoints?api=${api.id}`)}
                  >
                    Endpoints & Versions
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="payments"
                    onClick={() => navigate(`/provider/pricing?api=${api.id}`)}
                  >
                    Gói cước
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="auto_stories"
                    onClick={() => navigate(`/provider/import-openapi?api=${api.id}`)}
                  >
                    OpenAPI
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    icon="fact_check"
                    onClick={() => navigate(`/provider/workflow?api=${api.id}`)}
                  >
                    Quy trình nộp duyệt
                  </Button>

                  {api.status === 'Draft' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="edit"
                      onClick={() => handleOpenEditModal(api)}
                      title="Chỉnh sửa thông tin API"
                    >
                      Sửa
                    </Button>
                  )}

                  {api.status === 'Draft' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="delete"
                      className="text-error hover:bg-error-container/20"
                      onClick={() => setDeleteTarget(api)}
                      title="Xóa API này"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <span className="text-body-sm text-on-surface-variant">
                Trang {page} / {totalPages} (Tổng cộng {total} APIs)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit API Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !formSubmitting && setIsFormModalOpen(false)}
        title={editingApi ? 'Chỉnh sửa thông tin API (Draft)' : 'Tạo sản phẩm API mới'}
        description="Định nghĩa thông số cơ bản cho API theo đặc tả Zod của hệ thống."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveApi} className="space-y-4">
          {formError && (
            <div role="alert" className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Tên API <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="VD: Realtime Currency Rates API"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Danh mục phân loại <span className="text-error">*</span>
            </label>
            <select
              value={formCategory}
              onChange={e => setFormCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Base URL máy chủ API <span className="text-error">*</span>
            </label>
            <input
              type="url"
              required
              value={formBaseUrl}
              onChange={e => setFormBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
            <span className="text-[11px] text-on-surface-variant mt-0.5 block">
              Phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)
            </span>
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Mô tả chức năng, nguồn dữ liệu và phạm vi ứng dụng của API..."
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Nhãn (Tags)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={e => setFormTags(e.target.value)}
              placeholder="VD: finance, forex, realtime (phân cách bằng dấu phẩy)"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={formSubmitting}
              onClick={() => setIsFormModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Đang lưu...' : editingApi ? 'Cập nhật API' : 'Tạo API'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Xác nhận xóa API"
        description="Hành động này sẽ xóa hoàn toàn API khỏi danh mục và không thể hoàn tác."
        maxWidth="md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div role="alert" className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
              {deleteError}
            </div>
          )}

          <p className="text-body-sm text-on-surface">
            Bạn có chắc chắn muốn xóa API <strong>{deleteTarget?.name}</strong> (ID: {deleteTarget?.id}) không?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unverified Warning Modal */}
      <Modal
        isOpen={showUnverifiedModal}
        onClose={() => setShowUnverifiedModal(false)}
        title="Chưa xác minh danh tính Nhà cung cấp"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-body-sm text-on-surface leading-relaxed">
            Theo chính sách bảo mật và tuân thủ pháp lý của nền tảng API HUB (Mục 8 & 9), tất cả nhà cung cấp phải hoàn thành <strong>Xác minh danh tính & Doanh nghiệp (US-06)</strong> trước khi có thể tạo và xuất bản các API thương mại.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowUnverifiedModal(false)}
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              icon="verified_user"
              onClick={() => {
                setShowUnverifiedModal(false);
                navigate('/provider/verification');
              }}
            >
              Đến trang xác minh
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
