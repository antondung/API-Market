import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge, MethodBadge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import { getMarketplaceApiDetail, formatPrice } from '../../services/marketplaceApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';
import {
  getSandboxGrant,
  claimSandboxGrant,
  type SandboxGrant,
} from '../../services/consumerApi';
import { generateCurlSnippet } from '../../utils/apiSnippetGenerator';

export const TrySandboxPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const isConsumer = isAuthenticated && (currentUser?.role === 'USER' || (currentUser?.role as string) === 'Consumer');

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Authoritative Sandbox Grant State
  const [grant, setGrant] = useState<SandboxGrant | null>(null);
  const [isGrantLoading, setIsGrantLoading] = useState(false);
  const [isGrantClaiming, setIsGrantClaiming] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [includeRealKeyInSnippet, setIncludeRealKeyInSnippet] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activePreset, setActivePreset] = useState<'standard' | 'minimal' | 'custom'>('standard');

  const activeUserIdRef = useRef<string | null>(currentUser?.id ?? null);
  activeUserIdRef.current = currentUser?.id ?? null;

  // Security lifecycle: Wipe sensitive credentials on unmount, API switch, or logout
  useEffect(() => {
    const handleLogout = () => {
      setCustomApiKey('');
      setShowApiKey(false);
      setIncludeRealKeyInSnippet(false);
      setGrant(null);
      setGrantError(null);
    };

    window.addEventListener('apihub:session-invalidated', handleLogout);
    return () => {
      setCustomApiKey('');
      setShowApiKey(false);
      setIncludeRealKeyInSnippet(false);
      window.removeEventListener('apihub:session-invalidated', handleLogout);
    };
  }, [id]);

  // Load API details
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMarketplaceApiDetail(id, controller.signal);
        setApi(data);
        if (data.endpoints && data.endpoints.length > 0) {
          setSelectedEndpointId(data.endpoints[0].id);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', 'Lỗi tải API'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Read existing sandbox grant (authoritative GET, never auto-creates on page view)
  useEffect(() => {
    if (!id || !isConsumer) {
      setGrant(null);
      setGrantError(null);
      return;
    }

    const controller = new AbortController();
    const requestingUserId = currentUser?.id;

    const fetchGrant = async () => {
      try {
        setIsGrantLoading(true);
        setGrantError(null);
        const data = await getSandboxGrant(id, controller.signal);
        if (!controller.signal.aborted && activeUserIdRef.current === requestingUserId) {
          setGrant(data);
        }
      } catch (err) {
        if (controller.signal.aborted || activeUserIdRef.current !== requestingUserId) return;
        if (err instanceof ApiError) {
          if (err.status === 404) {
            // Grant does not exist yet - normal initial state
            setGrant(null);
          } else if (err.status === 403) {
            setGrantError(t('Tài khoản Consumer không có quyền truy cập API này hoặc tài khoản bị khóa.'));
          } else if (err.status === 429) {
            setGrantError(t('Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.'));
          } else {
            setGrantError(err.message || t('Lỗi kiểm tra trạng thái Sandbox grant.'));
          }
        } else {
          setGrantError(t('Lỗi mạng khi kiểm tra Sandbox grant.'));
        }
      } finally {
        if (!controller.signal.aborted && activeUserIdRef.current === requestingUserId) {
          setIsGrantLoading(false);
        }
      }
    };

    fetchGrant();

    return () => {
      controller.abort();
    };
  }, [id, isConsumer, currentUser?.id, t]);

  // Explicit claim handler (POST /api/consumer/apis/:id/sandbox)
  const handleClaimGrant = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/api/${id}/sandbox` } });
      return;
    }
    if (!isConsumer) {
      setGrantError(t('Chỉ tài khoản Consumer mới có quyền nhận Sandbox grant.'));
      return;
    }

    try {
      setIsGrantClaiming(true);
      setGrantError(null);
      const data = await claimSandboxGrant(id);
      setGrant(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setGrantError(t('Chỉ tài khoản Consumer đang hoạt động mới có quyền yêu cầu Sandbox grant.'));
        } else if (err.status === 404) {
          setGrantError(t('API này không tồn tại hoặc chưa được công khai.'));
        } else if (err.status === 429) {
          setGrantError(t('Quá nhiều yêu cầu. Vui lòng đợi trong giây lát.'));
        } else {
          setGrantError(err.message || t('Không thể cấp phát Sandbox grant.'));
        }
      } else {
        setGrantError(t('Lỗi kết nối máy chủ khi kích hoạt Sandbox grant.'));
      }
    } finally {
      setIsGrantClaiming(false);
    }
  };

  const selectedEndpoint = useMemo(() => {
    if (!api || !api.endpoints) return null;
    return api.endpoints.find(e => e.id === selectedEndpointId) || api.endpoints[0] || null;
  }, [api, selectedEndpointId]);

  const firstPaidPlan = useMemo(() => api?.plans?.find(p => p.priceMonthly > 0), [api]);

  const generatedCurl = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    const queryParams: Record<string, string> = {};
    if (activePreset === 'standard' && Array.isArray(selectedEndpoint.parameters)) {
      selectedEndpoint.parameters
        .filter((p: any) => p.in === 'query')
        .forEach((p: any) => {
          queryParams[p.name] = String(p.default ?? 'demo');
        });
    }

    const isBodyAllowed = selectedEndpoint.method.toUpperCase() !== 'GET' && selectedEndpoint.method.toUpperCase() !== 'DELETE';
    const bodyPayload = isBodyAllowed
      ? JSON.stringify({ sandbox: true, preset: activePreset })
      : null;

    const resolvedApiKey = (includeRealKeyInSnippet && customApiKey.trim())
      ? customApiKey.trim()
      : 'YOUR_API_KEY';

    return generateCurlSnippet({
      method: selectedEndpoint.method,
      urlPath: selectedEndpoint.path,
      apiKey: resolvedApiKey,
      queryParams,
      body: bodyPayload,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, customApiKey, activePreset, includeRealKeyInSnippet]);

  const handleCopyCurl = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(generatedCurl);
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
      } catch {
        // clipboard write failed - no false positive
      }
    }
  };

  const isGrantExpired = useMemo(() => {
    if (!grant) return false;
    return new Date(grant.expiresAt).getTime() <= Date.now();
  }, [grant]);

  const isGrantExhausted = useMemo(() => {
    if (!grant) return false;
    return grant.remainingRequests <= 0 || grant.usedRequests >= grant.maxRequests;
  }, [grant]);

  const isGrantRevoked = useMemo(() => {
    if (!grant) return false;
    return grant.revokedAt !== null;
  }, [grant]);

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-48 mb-6" />
        <div className="h-48 bg-surface-container-low rounded-2xl border border-outline-variant/30 mb-6" />
        <div className="h-32 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
      </div>
    );
  }

  if (error || !api) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">science</span>
        </div>
        <h2 className="text-title-lg font-bold text-on-surface mb-2">{t('Sandbox Not Available')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {error?.status === 404
            ? t('API này không tồn tại hoặc chưa được công khai.')
            : t('Đã xảy ra sự cố khi tải thông tin Sandbox.')}
        </p>
        <Link to="/marketplace">
          <Button variant="primary" icon="storefront">{t('Browse Marketplace')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageReveal className="pt-20 pb-16 px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/api/${api.id}`} className="hover:text-primary transition-colors">{api.name}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{t('Try Before Subscribe')}</span>
      </div>

      {/* Main Guided Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-headline-lg font-bold text-on-surface">{t('Try Before Subscribe')}</h1>
                <Badge variant={api.hasFreePlan ? 'success' : 'neutral'}>
                  {api.hasFreePlan ? t('Free Tier Available') : t('Paid Only')}
                </Badge>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {t('Môi trường kiểm thử nhanh dành cho')} <strong className="text-on-surface">{api.name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="terminal"
              onClick={() => navigate(`/api/${api.id}/playground`)}
            >
              {t('Open Full Playground')}
            </Button>
          </div>
        </div>

        {/* Guided Step Progress Indicator */}
        <div data-testid="wizard-steps" role="tablist" aria-label="Wizard Steps" className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: 1, title: 'Step 1: Sandbox Grant & Quota', icon: 'key' },
            { step: 2, title: 'Step 2: Endpoint & Presets', icon: 'tune' },
            { step: 3, title: 'Step 3: Execute & cURL', icon: 'play_arrow' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
                    : isCompleted
                      ? 'bg-surface-container border-outline-variant/30 text-on-surface'
                      : 'bg-surface-container/50 border-outline-variant/20 text-on-surface-variant'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-body-xs font-bold ${
                  isCurrent ? 'bg-primary text-on-primary' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : s.step}
                </span>
                <span className="text-body-xs truncate hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step 1: Sandbox Grant & Quota */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Real Authoritative Backend Sandbox Grant Panel */}
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                    <span>{t('Quyền Truy Cập Sandbox (Sandbox Grant & Quota)')}</span>
                  </h3>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    {t('Hạn mức thử nghiệm authoritative từ Backend (5 requests / 24 giờ). Không tự động sinh khóa giả hoặc tính toán tại trình duyệt.')}
                  </p>
                </div>
                {grant ? (
                  isGrantRevoked ? (
                    <Badge variant="danger" size="sm">Revoked</Badge>
                  ) : isGrantExpired ? (
                    <Badge variant="warning" size="sm">Expired</Badge>
                  ) : isGrantExhausted ? (
                    <Badge variant="warning" size="sm">Exhausted</Badge>
                  ) : (
                    <Badge variant="success" size="sm">{t('Active Grant')}</Badge>
                  )
                ) : (
                  <Badge variant="neutral" size="sm">{t('No Grant Yet')}</Badge>
                )}
              </div>

              {/* RBAC / Auth Warnings */}
              {!isAuthenticated ? (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-body-xs text-on-surface-variant">
                    <strong className="text-on-surface block mb-0.5">{t('Yêu cầu Đăng nhập Consumer')}</strong>
                    {t('Đăng nhập tài khoản Consumer để kích hoạt 5 lượt gọi thử nghiệm Sandbox lưu trữ trên máy chủ.')}
                  </div>
                  <Link to="/login" state={{ from: `/api/${api.id}/sandbox` }}>
                    <Button variant="primary" size="sm" icon="login">
                      {t('Đăng nhập Consumer')}
                    </Button>
                  </Link>
                </div>
              ) : !isConsumer ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-amber-900 dark:text-amber-200">
                  <strong className="block mb-0.5">{t('Vai trò không hợp lệ')}</strong>
                  {t('Tài khoản hiện tại có vai trò')} <strong>{currentUser?.role}</strong>. {t('Sandbox grant và hạn mức kiểm thử chỉ dành riêng cho tài khoản Consumer.')}
                </div>
              ) : isGrantLoading ? (
                <div className="p-6 text-center text-body-xs text-on-surface-variant animate-pulse">
                  {t('Đang kiểm tra trạng thái Sandbox grant trên máy chủ...')}
                </div>
              ) : grant ? (
                /* Active / Authoritative Grant Card */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 text-center sm:text-left">
                    <div>
                      <div className="text-caption text-on-surface-variant">{t('Lượt gọi còn lại')}</div>
                      <div className="text-headline-sm font-bold text-primary">
                        {grant.remainingRequests} <span className="text-body-xs text-on-surface-variant font-normal">/ {grant.maxRequests}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-caption text-on-surface-variant">{t('Đã sử dụng')}</div>
                      <div className="text-headline-sm font-bold text-on-surface">
                        {grant.usedRequests} <span className="text-body-xs text-on-surface-variant font-normal">requests</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-caption text-on-surface-variant">{t('Hết hạn lúc (24h)')}</div>
                      <div className="text-body-xs font-semibold text-on-surface mt-1">
                        {new Date(grant.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Quota Progress Bar */}
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        grant.remainingRequests > 0 ? 'bg-primary' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, (grant.remainingRequests / grant.maxRequests) * 100))}%` }}
                    />
                  </div>

                  {isGrantExhausted && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-on-surface-variant">
                      <strong className="text-amber-800 dark:text-amber-200 block mb-0.5">{t('Hạn mức Sandbox đã hết')}</strong>
                      {t('Bạn đã sử dụng toàn bộ 5 lượt thử nghiệm miễn phí cho API này. Để tiếp tục gọi API, hãy đăng ký gói chính thức hoặc sử dụng API Key.')}
                    </div>
                  )}

                  {isGrantExpired && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-on-surface-variant">
                      <strong className="text-amber-800 dark:text-amber-200 block mb-0.5">{t('Sandbox Grant đã hết hạn')}</strong>
                      {t('Quyền truy cập 24 giờ cho Sandbox này đã kết thúc.')}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>
                      {t('Dữ liệu lưu trữ an toàn trong PostgreSQL. Yêu cầu lại không làm đặt lại quota đã dùng.')}
                    </span>
                    <button
                      type="button"
                      disabled={isGrantClaiming}
                      onClick={handleClaimGrant}
                      className="text-primary hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isGrantClaiming ? t('Đang đồng bộ...') : t('Đồng bộ trạng thái')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Unclaimed Grant State */
                <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-body-xs text-on-surface-variant">
                    <strong className="text-on-surface block mb-0.5">{t('Chưa kích hoạt Sandbox Grant')}</strong>
                    {t('Nhấn nút bên cạnh để cấp phát 5 lượt gọi thử nghiệm miễn phí có hiệu lực trong 24 giờ.')}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="science"
                    disabled={isGrantClaiming}
                    onClick={handleClaimGrant}
                  >
                    {isGrantClaiming ? t('Đang kích hoạt...') : t('Kích hoạt Sandbox Grant')}
                  </Button>
                </div>
              )}

              {grantError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-body-xs text-red-600 dark:text-red-400">
                  {grantError}
                </div>
              )}
            </div>

            {/* Difference between Sandbox Grant and API Key */}
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">key</span>
                    <span>{t('Yêu cầu Khóa Xác thực (API Key)')}</span>
                  </h3>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    {t('Phân biệt: Sandbox Grant dùng cho kiểm thử nhanh trên Playground qua JWT. Khóa API (ak_live_) dùng để gọi trực tiếp qua Gateway từ ứng dụng bên ngoài.')}
                  </p>
                </div>
                <Badge variant="neutral" size="sm">Gateway Auth</Badge>
              </div>

              {/* Direct to API Keys page */}
              <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-body-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface block mb-0.5">{t('Cần gọi API từ backend hoặc ứng dụng của bạn?')}</span>
                  {t('Tạo và quản lý khóa API có tiền tố ak_live_ trong trang Quản lý API Keys.')}
                </div>
                <Link to="/dashboard/keys">
                  <Button variant="outline" size="sm" icon="key">
                    {t('Quản lý API Keys')}
                  </Button>
                </Link>
              </div>

              {/* Optional personal key input for testing without persisting */}
              <div className="space-y-1.5">
                <label className="text-body-sm font-semibold text-on-surface block">
                  {t('Nhập API Key để tạo snippet lệnh (tùy chọn, không lưu trữ):')}
                </label>
                <div className="flex items-center gap-2 bg-surface-container-high p-2 rounded-xl border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-1">password</span>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Nhập API Key của bạn (mặc định: YOUR_API_KEY)"
                    autoComplete="off"
                    className="flex-1 bg-transparent text-on-surface font-code-sm text-body-sm outline-none px-2"
                  />
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                      title={showApiKey ? t('Ẩn') : t('Hiện')}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showApiKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  )}
                </div>
                {customApiKey && (
                  <label className="flex items-center gap-2 pt-1 text-body-xs text-on-surface-variant cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeRealKeyInSnippet}
                      onChange={(e) => setIncludeRealKeyInSnippet(e.target.checked)}
                      className="rounded border-outline-variant/40 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span>{t('Chèn API Key thật vào snippet (Mặc định tắt: hiển thị "YOUR_API_KEY" để an toàn khi chia sẻ)')}</span>
                  </label>
                )}
                <p className="text-[11px] text-on-surface-variant">
                  {t('Khóa chỉ dùng để điền vào câu lệnh cURL mẫu bên dưới, không gửi đi đâu và không lưu vào bộ nhớ trình duyệt.')}
                </p>
              </div>

              {/* SSRF & SafeProxy Technical Security Architecture Notice */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-body-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  <span>{t('Kiến trúc Bảo vệ An ninh SafeProxy & Anti-SSRF')}</span>
                </div>
                <p className="leading-relaxed">
                  {t('Mọi yêu cầu gửi qua Playground và Gateway đều được kiểm soát bởi SafeProxy: ghim địa chỉ IP qua DNS pinning, chặn truy cập dải mạng nội bộ (private/loopback/link-local IPv4 & IPv6), từ chối HTTP redirects, giới hạn thời gian phản hồi 10 giây và dung lượng tối đa 2MB.')}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                icon="arrow_forward"
                onClick={() => setCurrentStep(2)}
              >
                {t('Tiếp tục: Chọn Endpoint (Step 2)')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Endpoint & Parameter Presets */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                  {t('1. Chọn Endpoint kiểm thử:')}
                </label>
                <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl border border-outline-variant/30">
                  <MethodBadge method={selectedEndpoint?.method as any || 'GET'} />
                  <select
                    id="sandbox-endpoint-select"
                    aria-label={t('1. Chọn Endpoint kiểm thử:') || 'Chọn Endpoint kiểm thử'}
                    value={selectedEndpointId}
                    onChange={(e) => setSelectedEndpointId(e.target.value)}
                    className="bg-transparent flex-1 text-on-surface font-code-md text-body-sm outline-none cursor-pointer"
                  >
                    {api.endpoints.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        {ep.method} {ep.path} {ep.description ? `— ${ep.description.slice(0, 35)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                  {t('2. Parameter Quick-Run Presets:')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'standard', label: 'Standard Query', desc: 'Sử dụng tham số mẫu mặc định' },
                    { id: 'minimal', label: 'Minimal', desc: 'Không kèm query parameters' },
                    { id: 'custom', label: 'Sandbox Payload', desc: 'Kèm mock flag payload' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        activePreset === preset.id
                          ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                          : 'bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-outline-variant'
                      }`}
                    >
                      <div className="text-body-sm font-bold">{preset.label}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(1)}
              >
                {t('Quay lại Step 1')}
              </Button>
              <Button
                variant="primary"
                size="md"
                icon="arrow_forward"
                onClick={() => setCurrentStep(3)}
              >
                {t('Tiếp tục: Xem cURL & Chạy thử (Step 3)')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Execute / Review cURL */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/20 space-y-4">
              {/* Interactive Playground Execution Card */}
              <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                    <strong className="text-body-sm text-on-surface">{t('Kiểm thử trực tiếp trên Playground')}</strong>
                  </div>
                  <p className="text-body-xs text-on-surface-variant">
                    {grant ? (
                      grant.remainingRequests > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {t('Sandbox Grant sẵn sàng: Còn')} {grant.remainingRequests}/{grant.maxRequests} {t('lượt gọi miễn phí.')}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {t('Hạn mức Sandbox đã hết (0 lượt còn lại).')}
                        </span>
                      )
                    ) : (
                      t('Sử dụng phiên đăng nhập Consumer để gửi request an toàn qua SafeProxy.')
                    )}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon="play_arrow"
                  onClick={() => navigate(`/api/${api.id}/playground`)}
                >
                  {t('Mở Playground để chạy thử')}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">code</span>
                  <span>{t('Lệnh cURL kiểm thử qua Gateway')}</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedCurl ? 'check' : 'content_copy'}
                  onClick={handleCopyCurl}
                >
                  {copiedCurl ? t('Copied!') : t('Copy cURL')}
                </Button>
              </div>

              <CodeBlock
                code={generatedCurl}
                language="bash"
              />

              {customApiKey && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-high rounded-xl border border-outline-variant/30 text-body-xs">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                    <span>
                      {includeRealKeyInSnippet
                        ? t('Mã lệnh đang hiển thị API Key cá nhân của bạn.')
                        : t('Mã lệnh đang dùng "YOUR_API_KEY" để an toàn khi chia sẻ/sao chép.')}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIncludeRealKeyInSnippet(!includeRealKeyInSnippet)}
                  >
                    {includeRealKeyInSnippet ? t('Dùng "YOUR_API_KEY"') : t('Chèn API Key thật')}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentStep(2)}
              >
                {t('Quay lại Step 2')}
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon="terminal"
                onClick={() => navigate(`/api/${api.id}/playground`)}
              >
                {t('Chuyển tới Playground')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade to Production Plan Banner */}
      {firstPaidPlan && (
        <AnimatedCard hoverLift={true} className="bg-surface-container-low border border-primary/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
              <h3 className="text-body-lg font-bold text-on-surface">
                {t('Sẵn sàng triển khai thực tế? Nâng cấp lên')} {firstPaidPlan.name}
              </h3>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              {t('Mở rộng hạn mức lên')} <strong>{firstPaidPlan.quota.toLocaleString()} {t('requests / month')}</strong> {t('với tốc độ')} {firstPaidPlan.rateLimit} req/giây.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            shine={true}
            icon="payments"
            className="flex-shrink-0"
            onClick={() => navigate(`/checkout/${api.id}/${firstPaidPlan.id}`)}
          >
            {t('Upgrade to Production Plan')} ({formatPrice(firstPaidPlan.priceMonthly, firstPaidPlan.currency)})
          </Button>
        </AnimatedCard>
      )}
    </PageReveal>
  );
};
