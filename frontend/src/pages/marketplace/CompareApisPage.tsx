import React, { useState, useEffect, useRef } from 'react';
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
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const [catalogTotal, setCatalogTotal] = useState<number>(0);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [retryList, setRetryList] = useState(0);

  const queryApiId1 = searchParams.get('api1') || searchParams.get('api');
  const queryApiId2 = searchParams.get('api2');

  const [apiId1, setApiId1] = useState<string>(() => queryApiId1 || '');
  const [apiId2, setApiId2] = useState<string>(() => queryApiId2 || '');

  useEffect(() => {
    if (queryApiId1 && queryApiId1 !== apiId1) setApiId1(queryApiId1);
  }, [queryApiId1]);

  useEffect(() => {
    if (queryApiId2 && queryApiId2 !== apiId2) setApiId2(queryApiId2);
  }, [queryApiId2]);

  const [detail1, setDetail1] = useState<MarketplaceApiDetail | null>(null);
  const [detail2, setDetail2] = useState<MarketplaceApiDetail | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const [retry1, setRetry1] = useState(0);
  const [retry2, setRetry2] = useState(0);

  const reqId1Ref = useRef(0);
  const reqId2Ref = useRef(0);
  const initialSelectionDoneRef = useRef(false);

  const CATALOG_PAGE_SIZE = 12;
  const totalCatalogPages = Math.max(1, Math.ceil(catalogTotal / CATALOG_PAGE_SIZE));

  // Load available marketplace APIs using server-driven pagination
  useEffect(() => {
    const controller = new AbortController();

    const fetchApis = async () => {
      try {
        setIsLoadingList(true);
        setListError(null);

        const res = await listMarketplaceApis(
          { page: catalogPage, pageSize: CATALOG_PAGE_SIZE },
          controller.signal
        );
        if (controller.signal.aborted) return;

        setAvailableApis(res.items);
        setCatalogTotal(res.total);

        // Determine initial API selections without || true and preventing self-comparison
        if (!initialSelectionDoneRef.current) {
          initialSelectionDoneRef.current = true;
          const initialId1 = queryApiId1 || (res.items.length > 0 ? res.items[0].id : '');
          let initialId2 = queryApiId2 || '';

          if (!initialId2 && res.items.length > 1) {
            const alternate = res.items.find(a => a.id !== initialId1);
            if (alternate) {
              initialId2 = alternate.id;
            }
          }

          if (initialId1) setApiId1(prev => (prev !== initialId1 ? initialId1 : prev));
          if (initialId2) setApiId2(prev => (prev !== initialId2 ? initialId2 : prev));
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
  }, [catalogPage, retryList, queryApiId1, queryApiId2]);

  // Independent fetch effect for API 1
  useEffect(() => {
    if (!apiId1) return;
    const reqId = ++reqId1Ref.current;
    const controller = new AbortController();

    const fetchOne = async () => {
      try {
        setLoading1(true);
        setError1(null);
        const data = await getMarketplaceApiDetail(apiId1, controller.signal);
        if (controller.signal.aborted || reqId1Ref.current !== reqId) return;
        setDetail1(data);
      } catch (err) {
        if (controller.signal.aborted || reqId1Ref.current !== reqId) return;
        setError1(err instanceof ApiError ? err.message : 'Không thể tải chi tiết của API thứ nhất.');
        setDetail1(null);
      } finally {
        if (!controller.signal.aborted && reqId1Ref.current === reqId) {
          setLoading1(false);
        }
      }
    };

    fetchOne();

    return () => {
      controller.abort();
    };
  }, [apiId1, retry1]);

  // Independent fetch effect for API 2
  useEffect(() => {
    if (!apiId2) return;
    const reqId = ++reqId2Ref.current;
    const controller = new AbortController();

    const fetchTwo = async () => {
      try {
        setLoading2(true);
        setError2(null);
        const data = await getMarketplaceApiDetail(apiId2, controller.signal);
        if (controller.signal.aborted || reqId2Ref.current !== reqId) return;
        setDetail2(data);
      } catch (err) {
        if (controller.signal.aborted || reqId2Ref.current !== reqId) return;
        setError2(err instanceof ApiError ? err.message : 'Không thể tải chi tiết của API thứ hai.');
        setDetail2(null);
      } finally {
        if (!controller.signal.aborted && reqId2Ref.current === reqId) {
          setLoading2(false);
        }
      }
    };

    fetchTwo();

    return () => {
      controller.abort();
    };
  }, [apiId2, retry2]);

  const handleSelectApi1 = (val: string) => {
    setApiId1(val);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) {
        next.set('api1', val);
        next.set('api', val);
      } else {
        next.delete('api1');
        next.delete('api');
      }
      return next;
    });
  };

  const handleSelectApi2 = (val: string) => {
    setApiId2(val);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) {
        next.set('api2', val);
      } else {
        next.delete('api2');
      }
      return next;
    });
  };

  const renderPersonalDataProcessing = (val: boolean | null | undefined) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 text-body-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {t('Có')}
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-body-xs font-medium">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          {t('Không')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-body-xs font-medium">
        <span className="material-symbols-outlined text-[16px]">help_outline</span>
        {t('Chưa công bố')}
      </span>
    );
  };

  // Assemble selectable APIs including currently selected APIs from distant pages
  const selectOptions = (() => {
    const map = new Map<string, { value: string; label: string; badge?: string; icon?: string }>();

    for (const a of availableApis) {
      map.set(a.id, {
        value: a.id,
        label: a.name,
        badge: t(a.category) || a.category,
        icon: 'api',
      });
    }

    if (apiId1 && !map.has(apiId1)) {
      map.set(apiId1, {
        value: apiId1,
        label: detail1?.name || (loading1 ? t('Đang tải...') : apiId1),
        badge: detail1 ? (t(detail1.category) || detail1.category) : undefined,
        icon: 'api',
      });
    }

    if (apiId2 && !map.has(apiId2)) {
      map.set(apiId2, {
        value: apiId2,
        label: detail2?.name || (loading2 ? t('Đang tải...') : apiId2),
        badge: detail2 ? (t(detail2.category) || detail2.category) : undefined,
        icon: 'api',
      });
    }

    return Array.from(map.values());
  })();

  const isSameApiSelected = Boolean(apiId1 && apiId2 && apiId1 === apiId2);

  if (isLoadingList && availableApis.length === 0 && !queryApiId1 && !queryApiId2) {
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

  if (listError && availableApis.length === 0 && !queryApiId1 && !queryApiId2) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">cloud_off</span>
        </div>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">{t('Không thể tải API để so sánh')}</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{listError}</p>
        <Button variant="primary" onClick={() => setRetryList(c => c + 1)}>{t('Thử lại')}</Button>
      </div>
    );
  }

  if (catalogTotal === 0 && !isLoadingList && !listError && !queryApiId1 && !queryApiId2) {
    return (
      <div className="pt-24 pb-20 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16">
          <span className="material-symbols-outlined text-[48px] text-outline mb-3">inventory_2</span>
          <h2 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào trên hệ thống')}</h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
            {t('Hiện chưa có API nào được phát hành trên sàn để so sánh.')}
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

  if (catalogTotal === 1 && !isLoadingList && !listError && !queryApiId1 && !queryApiId2) {
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

  // Both failed completely
  const bothFailed = !loading1 && !loading2 && error1 && error2 && !detail1 && !detail2;
  const bothLoading = loading1 && loading2 && !detail1 && !detail2;

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

      {/* Catalog Pagination Info & Navigation */}
      {totalCatalogPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1 text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>
              {t('Danh mục API')} ({catalogTotal} {t('APIs')}) — {t('Trang')} {catalogPage}/{totalCatalogPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={catalogPage <= 1 || isLoadingList}
              onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              {t('Trang trước')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={catalogPage >= totalCatalogPages || isLoadingList}
              onClick={() => setCatalogPage(p => Math.min(totalCatalogPages, p + 1))}
            >
              {t('Trang sau')}
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Button>
          </div>
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 1 API')}</label>
          <CustomSelect
            value={apiId1}
            onChange={handleSelectApi1}
            options={selectOptions}
            className="w-full"
          />
        </div>

        <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-2xs">
          <label className="text-body-sm font-semibold text-on-surface block mb-2">{t('Slot 2 API')}</label>
          <CustomSelect
            value={apiId2}
            onChange={handleSelectApi2}
            options={selectOptions}
            className="w-full"
          />
        </div>
      </div>

      {/* Self-comparison warning */}
      {isSameApiSelected && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-body-sm mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-amber-600 shrink-0">info</span>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              {t('Không thể so sánh một API với chính nó')}
            </h3>
            <p className="mt-1 text-amber-800/90 dark:text-amber-300">
              {t('Bạn đã chọn cùng một API ở cả hai slot. Vui lòng chọn một API khác ở Slot 1 hoặc Slot 2 để tiến hành so sánh.')}
            </p>
          </div>
        </div>
      )}

      {/* Partial error banner if one API fails */}
      {error1 && !error2 && !bothFailed && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-body-sm mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
            <span>{t('Không thể tải chi tiết của API thứ nhất')}: {error1}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setRetry1(c => c + 1)}>
            {t('Thử lại API 1')}
          </Button>
        </div>
      )}

      {error2 && !error1 && !bothFailed && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 text-body-sm mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
            <span>{t('Không thể tải chi tiết của API thứ hai')}: {error2}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setRetry2(c => c + 1)}>
            {t('Thử lại API 2')}
          </Button>
        </div>
      )}

      {/* When both failed */}
      {bothFailed ? (
        <div className="bg-surface-container-low border border-error/20 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">cloud_off</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">
            {t('Không thể tải chi tiết của cả 2 API để so sánh')}
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {error1} | {error2}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setRetry1(c => c + 1);
                setRetry2(c => c + 1);
              }}
            >
              {t('Thử lại tất cả')}
            </Button>
          </div>
        </div>
      ) : bothLoading ? (
        /* Both are loading initial details */
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center animate-pulse">
          <div className="h-6 bg-surface-container-high rounded w-48 mx-auto mb-4" />
          <div className="h-32 bg-surface-container-high/50 rounded-xl" />
        </div>
      ) : !isSameApiSelected ? (
        /* Comparison Table with independent per-slot rendering */
        <>
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="sticky top-16 z-20 bg-surface-container-high/95 backdrop-blur-md border-b border-outline-variant/30 text-on-surface shadow-2xs">
                <tr>
                  <th className="p-5 font-semibold text-body-md w-1/4">{t('Specification & Criteria')}</th>
                  <th className="p-5 font-bold text-headline-sm text-primary w-3/8">
                    {loading1 ? (
                      <div className="h-7 bg-surface-container rounded w-36 animate-pulse" />
                    ) : error1 ? (
                      <div className="flex items-center justify-between text-error text-body-sm">
                        <span>{t('Lỗi tải API 1')}</span>
                        <Button variant="outline" size="sm" onClick={() => setRetry1(c => c + 1)}>
                          {t('Thử lại')}
                        </Button>
                      </div>
                    ) : detail1 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[22px]">api</span>
                          <Link to={`/api/${detail1.id}`} className="hover:underline">{detail1.name}</Link>
                        </div>
                        <Link to={`/api/${detail1.id}/playground`}>
                          <Button variant="secondary" size="sm">{t('Playground')}</Button>
                        </Link>
                      </div>
                    ) : null}
                  </th>
                  <th className="p-5 font-bold text-headline-sm text-primary w-3/8">
                    {loading2 ? (
                      <div className="h-7 bg-surface-container rounded w-36 animate-pulse" />
                    ) : error2 ? (
                      <div className="flex items-center justify-between text-error text-body-sm">
                        <span>{t('Lỗi tải API 2')}</span>
                        <Button variant="outline" size="sm" onClick={() => setRetry2(c => c + 1)}>
                          {t('Thử lại')}
                        </Button>
                      </div>
                    ) : detail2 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[22px]">api</span>
                          <Link to={`/api/${detail2.id}`} className="hover:underline">{detail2.name}</Link>
                        </div>
                        <Link to={`/api/${detail2.id}/playground`}>
                          <Button variant="secondary" size="sm">{t('Playground')}</Button>
                        </Link>
                      </div>
                    ) : null}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-md text-on-surface">
                {/* Provider Identity */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Provider Identity')}</td>
                  <td className="p-5 font-medium">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-28 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">{t('Không có dữ liệu')}</span>
                    ) : detail1 ? (
                      <>
                        {detail1.providerName}{' '}
                        {detail1.providerStatus === 'Verified' && (
                          <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>
                        )}
                      </>
                    ) : null}
                  </td>
                  <td className="p-5 font-medium">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-28 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">{t('Không có dữ liệu')}</span>
                    ) : detail2 ? (
                      <>
                        {detail2.providerName}{' '}
                        {detail2.providerStatus === 'Verified' && (
                          <Badge variant="success" size="sm">{t('Verified Provider')}</Badge>
                        )}
                      </>
                    ) : null}
                  </td>
                </tr>

                {/* Category */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Category')}</td>
                  <td className="p-5">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-20 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      <Badge variant="primary">{t(detail1.category)}</Badge>
                    ) : null}
                  </td>
                  <td className="p-5">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-20 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      <Badge variant="primary">{t(detail2.category)}</Badge>
                    ) : null}
                  </td>
                </tr>

                {/* Published Date */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Published Date')}</td>
                  <td className="p-5 font-code-sm">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      formatPublishedDate(detail1.publishedAt)
                    ) : null}
                  </td>
                  <td className="p-5 font-code-sm">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      formatPublishedDate(detail2.publishedAt)
                    ) : null}
                  </td>
                </tr>

                {/* Versions */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Versions')}</td>
                  <td className="p-5 font-code-sm">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-16 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      detail1.versions?.length || 0
                    ) : null}
                  </td>
                  <td className="p-5 font-code-sm">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-16 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      detail2.versions?.length || 0
                    ) : null}
                  </td>
                </tr>

                {/* Endpoints */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Endpoints')}</td>
                  <td className="p-5 font-code-sm">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      `${detail1.endpoints?.length || 0} endpoints`
                    ) : null}
                  </td>
                  <td className="p-5 font-code-sm">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      `${detail2.endpoints?.length || 0} endpoints`
                    ) : null}
                  </td>
                </tr>

                {/* Authentication */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Authentication')}</td>
                  <td className="p-5 font-code-sm text-xs">Header <code>X-API-Key</code> qua Gateway</td>
                  <td className="p-5 font-code-sm text-xs">Header <code>X-API-Key</code> qua Gateway</td>
                </tr>

                {/* Data Classification */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Data Classification')}</td>
                  <td className="p-5 text-sm">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      <Badge variant="neutral" size="sm">
                        {detail1.legal?.dataClassification || 'Chưa công bố'}
                      </Badge>
                    ) : null}
                  </td>
                  <td className="p-5 text-sm">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-24 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      <Badge variant="neutral" size="sm">
                        {detail2.legal?.dataClassification || 'Chưa công bố'}
                      </Badge>
                    ) : null}
                  </td>
                </tr>

                {/* Personal Data Processing */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Xử lý dữ liệu cá nhân')}</td>
                  <td className="p-5 text-sm">
                    {loading1 ? (
                      <div className="h-5 bg-surface-container rounded w-16 animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail1 ? (
                      renderPersonalDataProcessing(detail1.legal?.processesPersonalData)
                    ) : null}
                  </td>
                  <td className="p-5 text-sm">
                    {loading2 ? (
                      <div className="h-5 bg-surface-container rounded w-16 animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">—</span>
                    ) : detail2 ? (
                      renderPersonalDataProcessing(detail2.legal?.processesPersonalData)
                    ) : null}
                  </td>
                </tr>

                {/* Pricing Plans */}
                <tr className="hover:bg-surface-container/60 transition-colors">
                  <td className="p-5 font-medium text-on-surface-variant">{t('Pricing Plans')}</td>
                  <td className="p-5">
                    {loading1 ? (
                      <div className="h-10 bg-surface-container rounded w-full animate-pulse" />
                    ) : error1 ? (
                      <span className="text-error text-xs italic">{t('Không thể tải')}</span>
                    ) : detail1 ? (
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
                          <span className="text-body-sm text-on-surface-variant">{t('Chưa có gói cước')}</span>
                        )}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-5">
                    {loading2 ? (
                      <div className="h-10 bg-surface-container rounded w-full animate-pulse" />
                    ) : error2 ? (
                      <span className="text-error text-xs italic">{t('Không thể tải')}</span>
                    ) : detail2 ? (
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
                          <span className="text-body-sm text-on-surface-variant">{t('Chưa có gói cước')}</span>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Quick Action Dock */}
          {(detail1 || detail2) && (
            <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
              <div className="pointer-events-auto bg-surface-container-highest/90 backdrop-blur-lg border border-outline-variant/40 rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4 text-body-sm">
                {detail1 ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface truncate max-w-[120px]">{detail1.name}</span>
                    <Link to={`/api/${detail1.id}/try-sandbox`}>
                      <Button variant="secondary" size="sm" icon="play_arrow">{t('Sandbox')}</Button>
                    </Link>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant italic">{t('API 1 chưa tải')}</span>
                )}
                <span className="text-on-surface font-black px-2 py-0.5 rounded bg-surface-container-high text-xs">VS</span>
                {detail2 ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface truncate max-w-[120px]">{detail2.name}</span>
                    <Link to={`/api/${detail2.id}/try-sandbox`}>
                      <Button variant="secondary" size="sm" icon="play_arrow">{t('Sandbox')}</Button>
                    </Link>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant italic">{t('API 2 chưa tải')}</span>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </PageReveal>
  );
};
