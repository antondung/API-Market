import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';

interface DisplayApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  fullKeySecret?: string;
  environment: 'Sandbox' | 'Production';
  apiScope: string;
  rateLimitPerSec: number;
  monthlyQuota: number;
  createdAt: string;
  lastUsedAt: string | null;
  isRevoked: boolean;
}

export const ApiKeysPage: React.FC = () => {
  const { t } = useLanguage();

  const [keys] = useState<DisplayApiKey[]>([
    {
      id: 'key_sand_demo_01',
      name: 'Sandbox Development Key',
      keyPrefix: 'ak_sand_9f8a...3b21',
      fullKeySecret: 'ak_sand_9f8a42c18d993b210fec17',
      environment: 'Sandbox',
      apiScope: 'Universal / All Marketplace APIs',
      rateLimitPerSec: 10,
      monthlyQuota: 1000,
      createdAt: '2026-10-21T08:00:00.000Z',
      lastUsedAt: '2026-10-24T10:30:00.000Z',
      isRevoked: false,
    },
    {
      id: 'key_prod_demo_02',
      name: 'Production Primary Gateway Key',
      keyPrefix: 'ak_live_7c1d...e842',
      fullKeySecret: 'ak_live_7c1d88203fbb45e842aa19',
      environment: 'Production',
      apiScope: 'Weather & Financial Datasets',
      rateLimitPerSec: 50,
      monthlyQuota: 500000,
      createdAt: '2026-10-22T14:15:00.000Z',
      lastUsedAt: '2026-10-24T21:40:00.000Z',
      isRevoked: false,
    },
  ]);

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedEnv, setSelectedEnv] = useState<'Sandbox' | 'Production'>('Sandbox');
  const [selectedScope, setSelectedScope] = useState('Universal / All APIs');

  // Confirmation modals
  const [revokeModalKey, setRevokeModalKey] = useState<DisplayApiKey | null>(null);
  const [rotateModalKey, setRotateModalKey] = useState<DisplayApiKey | null>(null);

  const toggleReveal = (keyId: string) => {
    setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCopyKey = (key: DisplayApiKey) => {
    const textToCopy = key.fullKeySecret || key.keyPrefix;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
      setCopiedKeyId(key.id);
      setTimeout(() => setCopiedKeyId(null), 2000);
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
            onClick={() => setCreateModalOpen(true)}
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
          {t('Tính năng quản lý khóa qua Backend API Keys Service đang được hoàn thiện trong Sprint 4. Khóa sẽ được sinh bằng thuật toán mật mã an toàn từ máy chủ và chỉ hiển thị chuỗi secret 1 lần duy nhất (không sinh bằng Math.random() tại trình duyệt để đảm bảo an toàn).')}
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keys.map(k => {
            const isRevealed = Boolean(revealedKeys[k.id]);
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
                      <h3 className="text-body-lg font-bold text-on-surface">{k.name}</h3>
                      <span className="text-[12px] text-on-surface-variant block mt-0.5">{k.apiScope}</span>
                    </div>
                    <span title={k.environment === 'Production' ? 'Production Key: Thanh toán thực tế' : 'Sandbox Key: Môi trường kiểm thử'}>
                      <Badge
                        variant={k.environment === 'Production' ? 'primary' : 'neutral'}
                        size="sm"
                      >
                        {k.environment}
                      </Badge>
                    </span>
                  </div>

                  {/* Secret Key Display Box with Blur/Reveal */}
                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 my-4 flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[11px] uppercase font-bold text-on-surface-variant block mb-0.5">
                        {isRevealed ? 'Secret Key (Revealed)' : 'Key Prefix (Masked)'}
                      </span>
                      <code
                        className={`font-code-md text-code-sm text-primary font-bold block truncate transition-all duration-200 ${
                          !isRevealed ? 'tracking-wider' : ''
                        }`}
                      >
                        {isRevealed ? (k.fullKeySecret || k.keyPrefix) : `${k.keyPrefix.slice(0, 10)}••••••••${k.keyPrefix.slice(-4)}`}
                      </code>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReveal(k.id)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                        title={isRevealed ? t('Ẩn khóa') : t('Hiện khóa')}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isRevealed ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(k)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                        title={isCopied ? t('Đã sao chép') : t('Sao chép')}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-body-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Giới hạn')}</span>
                      <span className="font-semibold text-on-surface font-code-sm">{k.rateLimitPerSec} req/giây</span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Hạn mức tháng')}</span>
                      <span className="font-semibold text-on-surface font-code-sm">{k.monthlyQuota.toLocaleString()} req</span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Ngày tạo')}</span>
                      <span className="font-code-sm">{new Date(k.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <span className="text-[11px] block text-on-surface-variant/70">{t('Lần dùng cuối')}</span>
                      <span className="font-code-sm">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('vi-VN') : t('Chưa dùng')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <Badge variant={k.isRevoked ? 'danger' : 'success'} size="sm">
                    {k.isRevoked ? t('Revoked') : t('Active')}
                  </Badge>
                  {!k.isRevoked && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="sync"
                        onClick={() => setRotateModalKey(k)}
                      >
                        {t('Rotate')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon="delete"
                        onClick={() => setRevokeModalKey(k)}
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
                  <th className="px-5 py-3.5">{t('Tên khóa & Phạm vi')}</th>
                  <th className="px-5 py-3.5">{t('Môi trường')}</th>
                  <th className="px-5 py-3.5">{t('Tiền tố khóa (Prefix)')}</th>
                  <th className="px-5 py-3.5">{t('Giới hạn / Hạn mức')}</th>
                  <th className="px-5 py-3.5">{t('Trạng thái')}</th>
                  <th className="px-5 py-3.5">{t('Ngày tạo')}</th>
                  <th className="px-5 py-3.5">{t('Lần dùng cuối')}</th>
                  <th className="px-5 py-3.5 text-right">{t('Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                {keys.map(k => {
                  const isCopied = copiedKeyId === k.id;
                  return (
                    <tr key={k.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-on-surface block">{k.name}</span>
                        <span className="text-[12px] text-on-surface-variant">{k.apiScope}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={k.environment === 'Production' ? 'primary' : 'neutral'} size="sm">
                          {k.environment}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-code-md text-code-sm text-primary font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span>{k.keyPrefix}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(k)}
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title={isCopied ? t('Đã sao chép') : t('Sao chép')}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isCopied ? 'check' : 'content_copy'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant text-body-xs font-code-sm">
                        {k.rateLimitPerSec} req/s • {k.monthlyQuota.toLocaleString()} req/tháng
                      </td>
                      <td className="px-5 py-4">
                        {k.isRevoked ? (
                          <Badge variant="danger" size="sm">{t('Revoked')}</Badge>
                        ) : (
                          <Badge variant="success" size="sm">{t('Active')}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                        {new Date(k.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('vi-VN') : t('Chưa dùng')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!k.isRevoked && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon="sync"
                              onClick={() => setRotateModalKey(k)}
                            >
                              {t('Rotate')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon="delete"
                              onClick={() => setRevokeModalKey(k)}
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

      {/* Create Key Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('Tạo API Key Mới')}
        description={t('Cấp mã định danh xác thực cho các ứng dụng gửi qua Gateway')}
      >
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-body-xs text-on-surface">
            <span className="font-semibold text-primary block mb-0.5">{t('Thông báo kỹ thuật (Sprint 4):')}</span>
            {t('Dịch vụ cấp khóa an toàn của Backend sẽ ra mắt trong Sprint 4. Trình duyệt không tự tạo secret ngẫu nhiên để tuân thủ tiêu chuẩn mật mã.')}
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1">
              {t('Tên khóa / Nhãn môi trường')}
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production Backend Cluster, Staging Runner"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1">
              {t('Môi trường')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedEnv('Sandbox')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEnv === 'Sandbox'
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="text-body-sm font-semibold">Sandbox</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Kiểm thử với dữ liệu mẫu</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnv('Production')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedEnv === 'Production'
                    ? 'border-primary bg-primary/5 text-primary font-bold'
                    : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                }`}
              >
                <div className="text-body-sm font-semibold">Production</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Môi trường chạy thực tế</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-on-surface block mb-1">
              {t('Phạm vi cấp quyền (API Scope)')}
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface text-body-sm outline-none"
            >
              <option value="Universal / All APIs">Universal / Tất cả API trên sàn</option>
              <option value="Single API">Chỉ định từng API riêng biệt</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              {t('Hủy')}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={true}
              title={t('Tính năng sẽ kích hoạt cùng Backend API Keys Service trong Sprint 4')}
            >
              {t('Tạo Khóa (Chờ Sprint 4)')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rotate Key Confirmation Modal */}
      <Modal
        isOpen={!!rotateModalKey}
        onClose={() => setRotateModalKey(null)}
        title={t('Xác nhận Đổi Khóa (Rotate API Key)')}
        description={rotateModalKey ? `Khóa đang chọn: ${rotateModalKey.name}` : ''}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Cảnh báo thời gian chuyển tiếp (Grace Period)</span>
            </div>
            {t('Khi kích hoạt trên backend, đổi khóa sẽ cấp secret mới và vô hiệu hóa secret cũ sau khoảng thời gian đệm (grace period). Các ứng dụng cần cập nhật secret mới để tránh lỗi 401 Unauthorized.')}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setRotateModalKey(null)}
            >
              {t('Đóng')}
            </Button>
            <Button
              variant="primary"
              disabled={true}
              title={t('Tính năng sẽ kích hoạt cùng Backend API Keys Service trong Sprint 4')}
            >
              {t('Xác nhận Đổi Khóa (Chờ Sprint 4)')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Key Confirmation Modal */}
      <Modal
        isOpen={!!revokeModalKey}
        onClose={() => setRevokeModalKey(null)}
        title={t('Thu hồi API Key')}
        description={revokeModalKey ? `Khóa đang chọn: ${revokeModalKey.name}` : ''}
      >
        <div className="space-y-4">
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-body-xs text-error">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <span className="material-symbols-outlined text-[18px]">dangerous</span>
              <span>Hành động nguy hiểm không thể đảo ngược</span>
            </div>
            {t('Khi thu hồi, tất cả yêu cầu sử dụng khóa này sẽ bị Gateway từ chối ngay lập tức với mã lỗi HTTP 401 Unauthorized.')}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setRevokeModalKey(null)}
            >
              {t('Hủy')}
            </Button>
            <Button
              variant="danger"
              disabled={true}
              title={t('Tính năng sẽ kích hoạt cùng Backend API Keys Service trong Sprint 4')}
            >
              {t('Thu hồi Vĩnh viễn (Chờ Sprint 4)')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
