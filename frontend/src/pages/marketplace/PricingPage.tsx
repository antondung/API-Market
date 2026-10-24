import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import {
  listMarketplaceApis,
  getMarketplaceApiDetail,
  formatPrice,
} from '../../services/marketplaceApi';
import type { MarketplaceApiDetail } from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

export const PricingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [apiDetails, setApiDetails] = useState<MarketplaceApiDetail[]>([]);
  const [totalApis, setTotalApis] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialWarning, setPartialWarning] = useState<string | null>(null);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showFeatureMatrix, setShowFeatureMatrix] = useState<boolean>(false);

  const queryApiId = searchParams.get('api');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const PAGE_SIZE = 12;

  const faqs = [
    {
      q: 'Làm thế nào để chuyển đổi giữa gói Sandbox và Production?',
      a: 'Bạn có thể bắt đầu với gói Free Sandbox để kiểm thử API trong Playground hoặc ứng dụng thử nghiệm. Khi sẵn sàng ra mắt ứng dụng thực tế, nâng cấp lên gói Production để nhận khóa API với hạn mức băng thông cao và dịch vụ ổn định.',
    },
    {
      q: 'Cách API Gateway kiểm soát Rate Limit và Quota?',
      a: 'Hạ tầng Gateway kiểm soát lưu lượng dựa trên thuật toán giới hạn tần suất yêu cầu trên từng API Key và từng gói cước để đảm bảo tính sẵn sàng của dịch vụ.',
    },
    {
      q: 'API HUB hỗ trợ các hình thức thanh toán nào?',
      a: 'Trong phiên bản xem trước Sprint 3, hệ thống cung cấp môi trường Sandbox mô phỏng. Cổng thanh toán chính thức qua Thẻ quốc tế (Visa/Mastercard) và VNPay sẽ kích hoạt trong Sprint 4.',
    },
    {
      q: 'Chính sách cam kết dịch vụ và hỗ trợ khi xảy ra sự cố?',
      a: 'Nhà phát hành API cung cấp cam kết chất lượng dịch vụ theo thông tin mô tả chi tiết trên từng trang API. Thông số kết nối được Gateway theo dõi và đối soát khi có sự cố.',
    },
  ];

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPartialWarning(null);

        // If deep linked via ?api=<id>, prioritize fetching that specific API
        if (queryApiId) {
          try {
            const singleDetail = await getMarketplaceApiDetail(queryApiId, controller.signal);
            if (controller.signal.aborted) return;
            setApiDetails([singleDetail]);
            setTotalApis(1);
            setIsLoading(false);
            return;
          } catch {
            // Fall back to general catalog if deep linked API id not found
          }
        }

        // Support pagination beyond 50 APIs without bottleneck
        const listRes = await listMarketplaceApis(
          { page: currentPage, pageSize: PAGE_SIZE },
          controller.signal
        );
        if (controller.signal.aborted) return;

        setTotalApis(listRes.total);
        if (listRes.items.length === 0) {
          setApiDetails([]);
          return;
        }

        // Bounded concurrency (chunks of 4) to prevent N+1 request flooding
        const items = listRes.items;
        const details: MarketplaceApiDetail[] = [];
        let failedCount = 0;
        const CHUNK_SIZE = 4;

        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
          if (controller.signal.aborted) return;
          const chunk = items.slice(i, i + CHUNK_SIZE);
          const chunkResults = await Promise.allSettled(
            chunk.map(item => getMarketplaceApiDetail(item.id, controller.signal))
          );

          for (const res of chunkResults) {
            if (res.status === 'fulfilled') {
              details.push(res.value);
            } else {
              failedCount++;
            }
          }
        }

        if (!controller.signal.aborted) {
          if (details.length === 0 && failedCount > 0) {
            setError('Không thể tải chi tiết bảng giá API từ máy chủ.');
          } else {
            setApiDetails(details);
            if (failedCount > 0) {
              setPartialWarning(`Một số API (${failedCount}) tạm thời không thể tải chi tiết bảng giá.`);
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : 'Không thể tải bảng giá API.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllPlans();

    return () => {
      controller.abort();
    };
  }, [currentPage, queryApiId]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearDeepLink = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('api');
      next.set('page', '1');
      return next;
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalApis / PAGE_SIZE));

  return (
    <PageReveal className="pt-20 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Deep Link Active Banner */}
      {queryApiId && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-body-sm text-primary font-medium">
            <span className="material-symbols-outlined text-[20px]">filter_alt</span>
            <span>{t('Đang xem bảng giá cho API được chọn:')} <strong>{queryApiId}</strong></span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearDeepLink}>
            {t('Xem tất cả API')}
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge variant="primary" size="md" className="mb-3">{t('Predictable API Economics')}</Badge>
        <h1 className="text-headline-lg font-bold text-on-surface">
          {t('Scale Your Applications with Predictable API Economics')}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          {t('Bảng giá minh bạch được kích hoạt trực tiếp từ nhà phát hành. Quản lý hạn mức và lưu lượng qua API Gateway.')}
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-surface-container rounded-xl border border-outline-variant/30 mt-6 relative">
          <button
            type="button"
            className="relative px-4 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer select-none text-primary font-bold"
          >
            <motion.div
              layoutId="pricing-billing-cycle"
              className="absolute inset-0 bg-surface-container-lowest rounded-lg shadow-2xs border border-outline-variant/20"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
            <span className="relative z-10">{t('Monthly Billing')}</span>
          </button>
          <button
            type="button"
            disabled={true}
            title={t('Chính sách thanh toán năm sẽ mở cùng Backend Billing Service trong Sprint 4')}
            className="relative px-4 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-not-allowed opacity-60 text-on-surface-variant flex items-center gap-1.5 select-none"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{t('Annual Billing')}</span>
              <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold">
                {t('Chờ Sprint 4')}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Partial failure notice if some API details could not be loaded */}
      {partialWarning && !isLoading && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-amber-800 dark:text-amber-200 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{partialWarning}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8">
            <div className="h-6 bg-surface-container-high rounded w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-surface-container rounded-xl" />
              <div className="h-64 bg-surface-container rounded-xl" />
              <div className="h-64 bg-surface-container rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">cloud_off</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">{t('Không thể tải dữ liệu bảng giá')}</h2>
          <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate(0)}>{t('Thử lại')}</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && apiDetails.length === 0 && (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">price_change</span>
          <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có gói cước API công khai')}</h3>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
            {t('Các nhà cung cấp đang chuẩn bị xuất bản các sản phẩm API đầu tiên lên sàn.')}
          </p>
          <Link to="/marketplace" className="inline-block mt-6">
            <Button variant="primary">
              {t('Khám phá Sàn API')}
            </Button>
          </Link>
        </div>
      )}

      {/* Featured APIs and their plans */}
      {!isLoading && !error && apiDetails.length > 0 && (
        <div className="space-y-12">
          {apiDetails.map(api => (
            <div key={api.id} className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">api</span>
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-bold text-on-surface">{api.name}</h2>
                    <span className="text-body-sm text-on-surface-variant">
                      {t(api.category)} • {api.providerName}
                    </span>
                  </div>
                </div>
                <Link to={`/api/${api.id}`} className="text-body-sm text-primary font-semibold hover:underline">
                  {t('View Specs & Endpoints →')}
                </Link>
              </div>

              {api.plans && api.plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {api.plans.map(plan => {
                    const priceAmount = plan.priceMonthly;

                    return (
                      <AnimatedCard
                        key={plan.id}
                        hoverLift={true}
                        className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                          plan.priceMonthly > 0
                            ? 'bg-surface-container-low border-primary/30 shadow-md ring-1 ring-primary/20'
                            : 'bg-surface-container border-outline-variant/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-headline-sm font-bold text-on-surface">{plan.name}</h3>
                            <div className="flex items-center gap-1.5">
                              {Boolean((plan as { recommended?: boolean }).recommended) && (
                                <Badge variant="primary" size="sm">
                                  {t('Recommended')}
                                </Badge>
                              )}
                              <Badge variant={plan.priceMonthly === 0 ? 'neutral' : 'primary'}>
                                {plan.priceMonthly === 0 ? 'Free' : 'Paid'}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1 mb-5">
                            <span className="text-3xl font-extrabold text-on-surface">
                              {formatPrice(priceAmount, plan.currency)}
                            </span>
                            {plan.priceMonthly > 0 && (
                              <span className="text-body-sm text-on-surface-variant">/ tháng</span>
                            )}
                          </div>

                          <div className="space-y-2.5 pt-4 border-t border-outline-variant/20 mb-6 text-body-sm">
                            <div className="font-semibold text-on-surface flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-primary text-[18px]">data_usage</span>
                              <span>{plan.quota.toLocaleString()} {t('requests / month')}</span>
                            </div>
                            <div className="text-on-surface-variant flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                              <span>{plan.rateLimit} {t('req/sec rate limit')}</span>
                            </div>
                            <div className="text-on-surface-variant flex items-start gap-1.5">
                              <span className="material-symbols-outlined text-emerald-600 text-[16px] flex-shrink-0 mt-0.5">check</span>
                              <span>Xác thực qua API Gateway</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Button
                            variant={plan.priceMonthly === 0 ? 'secondary' : 'primary'}
                            size="md"
                            shine={plan.priceMonthly > 0}
                            className="w-full"
                            onClick={() => navigate(`/checkout/${api.id}/${plan.id}`)}
                          >
                            {plan.priceMonthly === 0 ? t('Activate Free Sandbox Tier') : `${t('Subscribe to')} ${plan.name}`}
                          </Button>
                        </div>
                      </AnimatedCard>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-on-surface-variant text-body-sm bg-surface-container rounded-xl">
                  {t('API này hiện chưa có gói cước kích hoạt.')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Catalog Pagination beyond 50 APIs */}
      {!isLoading && !error && !queryApiId && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between gap-4 p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
          <span className="text-body-sm text-on-surface-variant">
            {t('Trang')} <strong>{currentPage}</strong> / {totalPages} ({totalApis} {t('APIs công khai')})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="chevron_left"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {t('Trang trước')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="chevron_right"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {t('Trang sau')}
            </Button>
          </div>
        </div>
      )}

      {/* Honest SLA & Technical Support Disclaimer */}
      <div className="mt-8 p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 text-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0">verified_user</span>
        <span>
          {t('Chi tiết SLA và kênh hỗ trợ theo cam kết cụ thể của từng Provider hoặc thỏa thuận riêng.')}
        </span>
      </div>

      {/* Feature Comparison Matrix Collapsible */}
      <div className="mt-12 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">{t('Feature Comparison Matrix')}</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {t('So sánh tính năng kiến trúc, bảo mật và hạn mức giữa các cấp độ gói')}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={showFeatureMatrix ? 'expand_less' : 'expand_more'}
            onClick={() => setShowFeatureMatrix(!showFeatureMatrix)}
          >
            {showFeatureMatrix ? t('Thu gọn bảng') : t('Xem chi tiết')}
          </Button>
        </div>

        <AnimatePresence>
          {showFeatureMatrix && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-body-sm min-w-[600px]">
                  <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                    <tr>
                      <th className="p-4">{t('Tính năng / Năng lực')}</th>
                      <th className="p-4">{t('Free Sandbox')}</th>
                      <th className="p-4">{t('Pro Tier')}</th>
                      <th className="p-4">{t('Enterprise Custom')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                    <tr>
                      <td className="p-4 font-medium">{t('API Gateway Rate Limiting')}</td>
                      <td className="p-4 text-on-surface-variant">{t('Theo cấu hình gói')}</td>
                      <td className="p-4 font-bold text-primary">{t('Theo cấu hình gói')}</td>
                      <td className="p-4 font-bold text-emerald-600">{t('Dedicated Quota')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('Bảo vệ chống SSRF & Proxy trung tâm')}</td>
                      <td className="p-4"><span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span></td>
                      <td className="p-4"><span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span></td>
                      <td className="p-4"><span className="material-symbols-outlined text-emerald-600 text-[18px]">check</span></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('Cam kết dịch vụ (SLA) & Hỗ trợ')}</td>
                      <td className="p-4 text-on-surface-variant">{t('Best Effort')}</td>
                      <td className="p-4 font-semibold">{t('Theo cam kết Provider')}</td>
                      <td className="p-4 font-semibold text-emerald-600">{t('Thỏa thuận riêng (Enterprise)')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('Hỗ trợ kỹ thuật (Support Tier)')}</td>
                      <td className="p-4 text-on-surface-variant">{t('Tài liệu & Portal')}</td>
                      <td className="p-4">{t('Theo chính sách Provider')}</td>
                      <td className="p-4 font-semibold text-primary">{t('Kênh chuyên biệt theo Hợp đồng')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAQ Accordion Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="neutral" size="sm" className="mb-2">FAQ</Badge>
          <h2 className="text-headline-sm font-bold text-on-surface">{t('Frequently Asked Questions')}</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t('Giải đáp các thắc mắc phổ biến về mô hình thanh toán và hạn mức API')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={faq.q}
                className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-5 text-left font-semibold text-body-md text-on-surface flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`material-symbols-outlined text-primary text-[20px] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-body-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </PageReveal>
  );
};
