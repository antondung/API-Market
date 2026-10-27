import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { listConsumerApiKeys, type ConsumerApiKey } from '../../services/consumerApi';

export const ConsumerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  // ProtectedRoute ensures currentUser exists.
  const user = currentUser!;
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [keys, setKeys] = useState<ConsumerApiKey[]>([]);
  const [totalKeys, setTotalKeys] = useState<number | null>(null);
  const [isKeysLoading, setIsKeysLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    listConsumerApiKeys(1, 100)
      .then(res => {
        if (isMounted) {
          setKeys(res.items);
          setTotalKeys(res.total);
        }
      })
      .catch(() => {
        if (isMounted) {
          setKeys([]);
          setTotalKeys(0);
        }
      })
      .finally(() => {
        if (isMounted) setIsKeysLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeKeys = keys.filter(k => k.isActive);
  const hasMoreKeysThanFetched = totalKeys !== null && totalKeys > keys.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold font-code-md uppercase">
              {t('Consumer Workspace')}
            </span>
            <span className="text-body-sm text-on-surface-variant font-code-md">
              ID: {user.id}
            </span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Welcome back,')} {user.name}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Monitor active subscriptions, credential consumption, and real-time Gateway telemetry.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon="explore"
            onClick={() => navigate('/marketplace')}
          >
            {t('Explore Catalog')}
          </Button>
          <Button
            variant="primary"
            icon="key"
            onClick={() => navigate('/dashboard/api-keys')}
          >
            {t('Generate Key')}
          </Button>
        </div>
      </div>

      {/* Feature & Architecture Alignment Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-body-sm text-on-surface flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">info</span>
        <div>
          <strong className="text-on-surface font-semibold">Hiện trạng chức năng Sprint 3: </strong>
          <span>
            Kho khóa <strong>API Keys</strong> và <strong>Gói dùng thử Sandbox (5 lượt gọi/API/24h)</strong> đã tích hợp trực tiếp với backend. Gói thuê bao thương mại trả phí (Paid Subscriptions) và bộ hạn chế ngân sách tự động (Cost Guard) dự kiến kích hoạt trong Sprint 4.
          </span>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Paid Subscriptions vs Sandbox */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Subscribed APIs')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">subscriptions</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              0
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Gói thuê bao thương mại theo tháng (Sprint 4). Trải nghiệm API qua Sandbox.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/subscriptions" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('View APIs')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              Sprint 4
            </span>
          </div>
        </div>

        {/* Metric 2: Active API Keys (Real Backend Data) */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Active Credentials')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">vpn_key</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface font-code-md">
              {isKeysLoading ? '...' : (hasMoreKeysThanFetched ? `${activeKeys.length}+ ${t('Keys')}` : `${activeKeys.length} ${t('Keys')}`)}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {hasMoreKeysThanFetched
                ? `${t('Trang 1 hiển thị')} ${activeKeys.length} ${t('khóa hoạt động trong tổng số')} ${totalKeys} ${t('khóa')}.`
                : t('Secured with SHA-256 hash in Control Plane DB.')}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/api-keys" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Manage Keys')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              {t('Zero plaintext')}
            </span>
          </div>
        </div>

        {/* Metric 3: Sandbox Grants */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">Sandbox Grants</span>
              <span className="material-symbols-outlined text-primary text-[22px]">science</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-on-surface font-code-md">
                5 req / API
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Hạn mức dùng thử an toàn cho mỗi API đã công khai, hiệu lực 24 giờ.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/usage" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Usage Details')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              24h Quota
            </span>
          </div>
        </div>

        {/* Metric 4: Cost Guard */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <span className="text-label-md uppercase font-semibold tracking-wider">{t('Cost Guard Budget')}</span>
              <span className="material-symbols-outlined text-primary text-[22px]">savings</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-on-surface font-code-md">
                $0.00
              </span>
              <span className="text-code-sm text-on-surface-variant font-code-sm">
                Sandbox Free
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Hạn mức chi tiêu và ngắt tự động (Hard Cutoff) theo dõi tại Sprint 4.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
            <Link to="/dashboard/cost-guard" className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
              {t('Notification Center')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <span className="text-[11px] font-code-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              Sprint 4
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch Tools */}
      <div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-4">{t('Quick Actions & Workspaces')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/marketplace"
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('Explore APIs')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Browse verified microservices, financial settlement, and AI models.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Browse Catalog')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            to="/marketplace"
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">terminal</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Playground')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Send test payloads, inspect latency, and test SSRF guard policies.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Launch Playground')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            to="/dashboard/api-keys"
            className="group bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant hover:shadow-md p-6 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">key</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">{t('API Keys Vault')}</h3>
              <p className="text-body-sm text-on-surface-variant">{t('Generate secret tokens, rotate credentials, and inspect last-used timestamps.')}</p>
            </div>
            <span className="text-primary text-body-sm font-semibold flex items-center gap-1 mt-6">
              {t('Manage Credentials')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Telemetry Stream (Honest State) */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Recent Activity & Gateway Telemetry')}</h2>
            <p className="text-body-sm text-on-surface-variant">
              {t('Live asynchronous usage stream with sensitive data redaction applied (US-24).')}
            </p>
          </div>
          <Link
            to="/dashboard/history"
            className="px-3.5 py-1.5 rounded-xl border border-outline-variant text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {t('View Full Logs')}
          </Link>
        </div>

        <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest/50 rounded-xl border border-dashed border-outline-variant/30">
          <span className="material-symbols-outlined text-[40px] text-outline mb-2 block">history</span>
          <p className="font-semibold text-body-md text-on-surface">{t('Chưa có lịch sử gọi API')}</p>
          <p className="text-body-sm text-on-surface-variant/80 mt-1 max-w-md mx-auto">
            {t('Khi bạn thực hiện lệnh gọi qua Gateway hoặc dùng thử trên Sandbox, các bản ghi telemetry sẽ tự động xuất hiện tại đây.')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon="terminal"
            className="mt-4"
            onClick={() => navigate('/marketplace')}
          >
            Khám phá API để thử nghiệm
          </Button>
        </div>
      </div>
    </div>
  );
};
