import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import {
  listProviderApis,
  listProviderPlans,
  createProviderPlan,
  updateProviderPlan,
  deleteProviderPlan,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type {
  ProviderApi,
  ProviderPlan,
  PlanTierName,
} from '../../services/providerTypes';

const PLAN_TIERS: PlanTierName[] = ['Free', 'Basic', 'Pro'];

export const PricingManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const queryApiId = searchParams.get('api');

  // APIs data
  const [apis, setApis] = useState<ProviderApi[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>(queryApiId || '');
  const [loadingApis, setLoadingApis] = useState(true);

  // Plans data
  const [plans, setPlans] = useState<ProviderPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(Boolean(queryApiId));
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProviderPlan | null>(null);
  const [planTier, setPlanTier] = useState<PlanTierName>('Basic');
  const [priceMonthly, setPriceMonthly] = useState<string>('49');
  const [currency, setCurrency] = useState<string>('USD');
  const [quota, setQuota] = useState<string>('10000');
  const [rateLimit, setRateLimit] = useState<string>('25');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ProviderPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch APIs list on mount
  useEffect(() => {
    const controller = new AbortController();

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
  }, [queryApiId, retryKey]);

  // Sync searchParam when selectedApiId changes
  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
    setLoadingPlans(true);
    setSearchParams({ api: apiId });
  };

  // 2. Fetch Plans when selectedApiId changes
  useEffect(() => {
    if (!selectedApiId) return;

    const controller = new AbortController();

    listProviderPlans(selectedApiId, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          setPlans(res || []);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingPlans(false);
        }
      });

    return () => controller.abort();
  }, [selectedApiId, retryKey]);

  const selectedApi = apis.find(a => a.id === selectedApiId);

  // Handlers for Modal
  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setPlanTier('Basic');
    setPriceMonthly('49');
    setCurrency('USD');
    setQuota('25000');
    setRateLimit('25');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProviderPlan) => {
    setEditingPlan(p);
    setPlanTier(p.name);
    setPriceMonthly(String(p.priceMonthly));
    setCurrency(p.currency || 'USD');
    setQuota(String(p.quota));
    setRateLimit(String(p.rateLimit));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTierChange = (newTier: PlanTierName) => {
    setPlanTier(newTier);
    if (newTier === 'Free') {
      setPriceMonthly('0');
      setQuota('5000');
      setRateLimit('5');
    } else if (newTier === 'Pro') {
      if (priceMonthly === '0' || !priceMonthly) setPriceMonthly('199');
      setQuota('100000');
      setRateLimit('100');
    } else {
      if (priceMonthly === '0' || !priceMonthly) setPriceMonthly('49');
      setQuota('25000');
      setRateLimit('25');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiId || submitting) return;

    setFormError(null);

    const priceNum = planTier === 'Free' ? 0 : Number(priceMonthly);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Giá cước hàng tháng phải là số không âm (>= 0).');
      return;
    }
    if (planTier === 'Free' && priceNum !== 0) {
      setFormError('Gói Free bắt buộc phải có giá cước bằng 0.');
      return;
    }

    const quotaNum = parseInt(quota, 10);
    if (isNaN(quotaNum) || quotaNum < 1) {
      setFormError('Hạn mức Quota hàng tháng phải là số nguyên dương (>= 1).');
      return;
    }

    const rateLimitNum = parseInt(rateLimit, 10);
    if (isNaN(rateLimitNum) || rateLimitNum < 1) {
      setFormError('Giới hạn Rate Limit (RPS) phải là số nguyên dương (>= 1).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: planTier,
        priceMonthly: priceNum,
        currency: currency.toUpperCase(),
        quota: quotaNum,
        rateLimit: rateLimitNum,
      };

      if (editingPlan) {
        const updated = await updateProviderPlan(selectedApiId, editingPlan.id, payload);
        setPlans(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProviderPlan(selectedApiId, payload);
        setPlans(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(formatProviderErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedApiId || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProviderPlan(selectedApiId, deleteTarget.id);
      setPlans(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(formatProviderErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loadingApis) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading pricing page">
        <div className="h-20 bg-surface-container-high rounded-2xl" />
        <div className="h-96 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-xl mx-auto my-12">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">payments</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để thiết lập bảng giá')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể thiết lập các gói cước và hạn mức.')}
        </p>
        <Button variant="primary" icon="add_circle" onClick={() => navigate('/provider/create-api')}>
          {t('Tạo API Mới')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & API Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{selectedApi?.name || 'API'}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Pricing Plan Management')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Configure developer tiers, monthly quota ceilings, and burst velocity rules.')}
          </p>
        </div>

        {/* API Selector & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
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

          <Button
            variant="primary"
            icon="add"
            onClick={handleOpenCreateModal}
          >
            {t('Add Pricing Tier')}
          </Button>
        </div>
      </div>

      {/* Global Connection / Load Error */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Pricing Plans Grid */}
      {loadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse" aria-label="Loading plans">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-surface-container rounded-2xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-xl mx-auto my-8">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">
            monetization_on
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface">Chưa có gói cước nào</h3>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
            Thiết lập gói cước Free, Basic hoặc Pro để người dùng có thể đăng ký sử dụng API của bạn qua Gateway.
          </p>
          <Button variant="primary" icon="add" onClick={handleOpenCreateModal}>
            Thêm gói cước đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => {
            const isFree = p.name === 'Free';
            return (
              <div
                key={p.id}
                className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-title-lg font-bold text-on-surface">Gói {p.name}</span>
                    <Badge
                      variant={
                        p.name === 'Pro'
                          ? 'warning'
                          : p.name === 'Basic'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {p.name}
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <span className="text-headline-lg font-extrabold text-on-surface">
                      {isFree ? 'Miễn phí' : `${p.currency || 'USD'} ${p.priceMonthly.toLocaleString()}`}
                    </span>
                    {!isFree && <span className="text-body-sm text-on-surface-variant"> / tháng</span>}
                  </div>

                  <div className="space-y-3 py-4 border-y border-outline-variant/20 text-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">data_usage</span>
                        Hạn mức (Quota):
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        {p.quota.toLocaleString()} lượt/tháng
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">speed</span>
                        Giới hạn tốc độ:
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        {p.rateLimit} RPS
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                        Bảo hành SLA:
                      </span>
                      <span className="font-mono text-on-surface text-body-xs">
                        {p.name === 'Pro' ? '99.9% Uptime SLA' : p.name === 'Basic' ? '99.5% Uptime' : 'Cộng đồng'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-outline-variant/20">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="edit"
                    onClick={() => handleOpenEditModal(p)}
                  >
                    Sửa gói
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    className="text-error hover:bg-error-container/20"
                    onClick={() => setDeleteTarget(p)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT PLAN MODAL                                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title={editingPlan ? `Chỉnh sửa Gói ${editingPlan.name}` : 'Thêm Gói Cước Mới'}
        description="Định cấu hình gói giá, hạn mức quota hàng tháng và rate limit RPS cho API."
        maxWidth="md"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          {formError && (
            <div role="alert" className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Phân hạng gói (Tier Name) <span className="text-error">*</span>
            </label>
            <select
              value={planTier}
              onChange={e => handleTierChange(e.target.value as PlanTierName)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-bold outline-none focus:ring-2 focus:ring-primary"
            >
              {PLAN_TIERS.map(t => (
                <option key={t} value={t}>
                  {t} {t === 'Free' ? '(Miễn phí $0)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Giá cước hàng tháng <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="any"
                required
                disabled={planTier === 'Free'}
                value={priceMonthly}
                onChange={e => setPriceMonthly(e.target.value)}
                placeholder="49"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-mono outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              {planTier === 'Free' && (
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Gói Free bắt buộc có giá $0
                </span>
              )}
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Loại tiền tệ (Currency) <span className="text-error">*</span>
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Hạn mức Quota (lượt/tháng) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={quota}
                onChange={e => setQuota(e.target.value)}
                placeholder="25000"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-mono outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Rate Limit (RPS) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={rateLimit}
                onChange={e => setRateLimit(e.target.value)}
                placeholder="25"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-mono outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : editingPlan ? 'Cập nhật gói' : 'Tạo gói cước'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Xác nhận xóa gói cước"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-body-sm text-on-surface">
            Bạn có chắc chắn muốn xóa gói <strong>{deleteTarget?.name}</strong> (${deleteTarget?.priceMonthly}/tháng) không? Người dùng hiện tại có thể bị ảnh hưởng khi gia hạn.
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
    </div>
  );
};
