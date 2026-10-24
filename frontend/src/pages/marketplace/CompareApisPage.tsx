import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { PageReveal } from '../../components/motion/PageReveal';
import {
  listMarketplaceApis,
  getMarketplaceApiDetail,
  formatPrice,
  formatPublishedDate,
} from '../../services/marketplaceApi';
import type {
  MarketplaceApiSummary,
  MarketplaceApiDetail,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

export const CompareApisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [availableApis, setAvailableApis] = useState<MarketplaceApiSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [apiId1, setApiId1] = useState<string>('');
  const [apiId2, setApiId2] = useState<string>('');

  const [detail1, setDetail1] = useState<MarketplaceApiDetail | null>(null);
  const [detail2, setDetail2] = useState<MarketplaceApiDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const queryApiId = searchParams.get('api');

  // Load available marketplace APIs
  useEffect(() => {
    const controller = new AbortController();

    const fetchApis = async () => {
      try {
        setIsLoadingList(true);
        setListError(null);
        const res = await listMarketplaceApis({ pageSize: 50 }, controller.signal);
        if (controller.signal.aborted) return;
        setAvailableApis(res.items);

        if (res.items.length > 0) {
          const firstId = (queryApiId && res.items.some(a => a.id === queryApiId))
            ? queryApiId
            : res.items[0].id;
          const secondId = res.items.length > 1
            ? (res.items.find(a => a.id !== firstId)?.id || res.items[0].id)
            : res.items[0].id;

          setApiId1(firstId);
          setApiId2(secondId);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setListError(err instanceof ApiError ? err.message : 'Không thể tải danh sách API.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingList(false);
        }
      }
    };

    fetchApis();

    return () => {
      controller.abort();
    };
  }, [queryApiId]);

  // Fetch details for both selected APIs with differentiated error states
  useEffect(() => {
    if (!apiId1 || !apiId2) return;
    const controller = new AbortController();

    const fetchBothDetails = async () => {
      try {
        setIsLoadingDetails(true);
        setDetailsError(null);

        const [d1Res, d2Res] = await Promise.allSettled([
          getMarketplaceApiDetail(apiId1, controller.signal),
          getMarketplaceApiDetail(apiId2, controller.signal),
        ]);
        if (controller.signal.aborted) return;

        const d1 = d1Res.status === 'fulfilled' ? d1Res.value : null;
        const d2 = d2Res.status === 'fulfilled' ? d2Res.value : null;

        setDetail1(d1);
        setDetail2(d2);

        if (!d1 && !d2) {
          setDetailsError('Không thể tải chi tiết của cả 2 API để so sánh.');
        } else if (!d1 || !d2) {
          setDetailsError(`Không thể tải chi tiết của ${!d1 ? 'API thứ nhất' : 'API thứ hai'}.`);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setDetailsError(err instanceof ApiError ? err.message : 'Lỗi khi tải dữ liệu so sánh chi tiết.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchBothDetails();

    return () => {
      controller.abort();
    };
  }, [apiId1, apiId2]);

  if (isLoadingList) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto text-center animate-pulse">
        <div className="h-8 bg-surface-container-high rounded w-64 mx-auto mb-4" />
        <div className="h-4 bg-surface-container-high rounded w-96 mx-auto mb-12" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-48 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">cloud_off</span>
        </div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">{t('Không thể tải API để so sánh')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{listError}</p>
        <Button variant="primary" onClick={() => navigate(0)}>{t('Thử lại')}</Button>
      </div>
    );
  }

  if (availableApis.length < 2) {
    return (
      <div className="pt-24 pb-20 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">compare</span>
          <h2 className="text-headline-sm font-bold text-on-surface">{t('Chưa đủ API để so sánh song song')}</h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
            {t('Tính năng so sánh yêu cầu ít nhất 2 API có sẵn trên sàn. Hiện sàn chưa có đủ số lượng API được xuất bản.')}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/marketplace')}>
              {t('Xem Chợ API')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageReveal className="pt-20 pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-6">
        <Link to="/marketplace" className="hover:text-primary">{t('Marketplace')}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-medium">{t('API Side-by-Side Comparison')}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold">
              {t('STANDARDIZED BENCHMARK')}
            </span>
            <span className="text-xs text-on-surface-variant">{t('Real Backend Data')}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('API Side-by-Side Comparison')}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t('So sánh chi tiết thông số kỹ thuật, gói giá và mức độ xác minh giữa hai API.')}
          </p>
        </div>
        <Link to="/marketplace" className="text-body-sm text-primary font-semibold hover:underline">
          ← {t('Back to Marketplace')}
        </Link>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 1 API')}</label>
          <CustomSelect
            value={apiId1}
            onChange={(val) => {
              setApiId1(val);
              setSearchParams(prev => {
                prev.set('api', val);
                return prev;
              });
            }}
            options={availableApis.map(a => ({
              value: a.id,
              label: a.name,
              badge: t(a.category) || a.category,
              icon: 'api',
            }))}
            className="w-full"
          />
        </div>

        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 2 API')}</label>
          <CustomSelect
            value={apiId2}
            onChange={(val) => setApiId2(val)}
            options={availableApis.map(a => ({
              value: a.id,
              label: a.name,
              badge: t(a.category) || a.category,
              icon: 'api',
            }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Details Error Message */}
      {detailsError && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-body-sm mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{detailsError}</span>
        </div>
      )}

      {/* Comparison Table */}
      {isLoadingDetails || !detail1 || !detail2 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center animate-pulse">
          <div className="h-6 bg-surface-container-high rounded w-48 mx-auto mb-4" />
          <div className="h-32 bg-surface-container-high/50 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="sticky top-16 z-20 bg-surface-container-high/95 backdrop-blur-md border-b border-outline-variant/30 text-on-surface shadow-2xs">
                <tr>
                  <th className="p-5 font-semibold text-body-md w-1/4">{t('Specification & Criteria')}</th>
                  <th className="p-5 font-bold text-headline-sm text-primary w-3/8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[22px]">api</span>
                        <Link to={`/api/${detail1.id}`} className="hover:underline">{detail1.name}</Link>
                      </div>
                      <Link to={`/api/${detail1.id}/playground`}>
                        <Button variant="secondary" size="sm">{t('Playground')}</Button>
                      </Link>
                    </div>
                  </th>
                  <th className="p-5 font-bold text-headline-sm text-primary w-3/8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[22px]">api</span>
                        <Link to={`/api/${detail2.id}`} className="hover:underline">{detail2.name}</Link>
                      </div>
                      <Link to={`/api/${detail2.id}/playground`}>
                        <Button variant="secondary" size="sm">{t('Playground')}</Button>
                      </Link>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-md text-on-surface">
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Provider Identity')}</td>
                  <td className="p-5 font-medium">
                    {detail1.providerName}{' '}
                    {detail1.providerStatus === 'Verified' && (
                      <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>
                    )}
                  </td>
                  <td className="p-5 font-medium">
                    {detail2.providerName}{' '}
                    {detail2.providerStatus === 'Verified' && (
                      <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Category')}</td>
                  <td className="p-5"><Badge variant="primary">{t(detail1.category)}</Badge></td>
                  <td className="p-5"><Badge variant="primary">{t(detail2.category)}</Badge></td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Published Date')}</td>
                  <td className="p-5 font-code-sm">{formatPublishedDate(detail1.publishedAt)}</td>
                  <td className="p-5 font-code-sm">{formatPublishedDate(detail2.publishedAt)}</td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Versions')}</td>
                  <td className="p-5 font-code-sm">{detail1.versions?.length || 0}</td>
                  <td className="p-5 font-code-sm">{detail2.versions?.length || 0}</td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Endpoints')}</td>
                  <td className="p-5 font-code-sm">{detail1.endpoints?.length || 0} endpoints</td>
                  <td className="p-5 font-code-sm">{detail2.endpoints?.length || 0} endpoints</td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Authentication')}</td>
                  <td className="p-5 font-code-sm text-xs">Header <code>X-API-Key</code> qua Gateway</td>
                  <td className="p-5 font-code-sm text-xs">Header <code>X-API-Key</code> qua Gateway</td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Data Classification')}</td>
                  <td className="p-5 text-sm">
                    <Badge variant="neutral" size="sm">
                      {detail1.legal?.dataClassification || 'Chưa công bố'}
                    </Badge>
                  </td>
                  <td className="p-5 text-sm">
                    <Badge variant="neutral" size="sm">
                      {detail2.legal?.dataClassification || 'Chưa công bố'}
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Xử lý dữ liệu cá nhân')}</td>
                  <td className="p-5 text-sm">
                    {detail1.legal?.processesPersonalData ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-body-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        {t('Có')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-body-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        {t('Không')}
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-sm">
                    {detail2.legal?.processesPersonalData ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-body-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        {t('Có')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-body-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        {t('Không')}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('P95 Latency')}</td>
                  <td className="p-5 text-on-surface-variant text-sm italic">
                    {t('Đang cập nhật (Theo dõi bởi Gateway)')}
                  </td>
                  <td className="p-5 text-on-surface-variant text-sm italic">
                    {t('Đang cập nhật (Theo dõi bởi Gateway)')}
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Uptime SLA')}</td>
                  <td className="p-5 text-on-surface-variant text-sm italic">
                    {t('Đang cập nhật (Theo dõi bởi Gateway)')}
                  </td>
                  <td className="p-5 text-on-surface-variant text-sm italic">
                    {t('Đang cập nhật (Theo dõi bởi Gateway)')}
                  </td>
                </tr>
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Pricing Plans')}</td>
                  <td className="p-5">
                    <div className="space-y-1.5">
                      {detail1.plans && detail1.plans.length > 0 ? (
                        detail1.plans.map(p => (
                          <div key={p.id} className="text-body-sm flex items-center justify-between bg-surface-container/60 px-3 py-1.5 rounded-lg border border-outline-variant/20">
                            <span className="font-medium">{p.name}</span>
                            <span className="font-code-sm text-primary font-bold">
                              {formatPrice(p.priceMonthly, p.currency)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">Chưa có gói cước</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-1.5">
                      {detail2.plans && detail2.plans.length > 0 ? (
                        detail2.plans.map(p => (
                          <div key={p.id} className="text-body-sm flex items-center justify-between bg-surface-container/60 px-3 py-1.5 rounded-lg border border-outline-variant/20">
                            <span className="font-medium">{p.name}</span>
                            <span className="font-code-sm text-primary font-bold">
                              {formatPrice(p.priceMonthly, p.currency)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">Chưa có gói cước</span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Action Dock */}
          <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
            <div className="pointer-events-auto bg-surface-container-highest/90 backdrop-blur-lg border border-outline-variant/40 rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4 text-body-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface truncate max-w-[120px]">{detail1.name}</span>
                <Link to={`/api/${detail1.id}/try-sandbox`}>
                  <Button variant="secondary" size="sm" icon="play_arrow">{t('Sandbox')}</Button>
                </Link>
              </div>
              <span className="text-on-surface-variant/40 font-bold">VS</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface truncate max-w-[120px]">{detail2.name}</span>
                <Link to={`/api/${detail2.id}/try-sandbox`}>
                  <Button variant="secondary" size="sm" icon="play_arrow">{t('Sandbox')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </PageReveal>
  );
};
