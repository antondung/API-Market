import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { PageReveal } from '../../components/motion/PageReveal';
import { StaggerGrid } from '../../components/motion/StaggerGrid';
import { AnimatedCard } from '../../components/motion/AnimatedCard';
import { AnimatedCounter } from '../../components/motion/AnimatedCounter';
import { TypingText } from '@animate-ui/react/primitives/texts/typing';
import {
  listMarketplaceApis,
  formatPublishedDate,
} from '../../services/marketplaceApi';
import type {
  MarketplaceApiSummary,
  MarketplaceQuery,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';

const CATEGORIES = [
  'All',
  'Weather & Geo',
  'Finance & Banking',
  'Data & Web Scraping',
  'DevOps & Cloud',
  'Translation & NLP',
  'Machine Learning & AI',
  'Security & Auth',
];

const CATEGORY_ICONS: Record<string, string> = {
  'All': 'grid_view',
  'Weather & Geo': 'partly_cloudy_day',
  'Finance & Banking': 'payments',
  'Data & Web Scraping': 'database',
  'DevOps & Cloud': 'cloud',
  'Translation & NLP': 'translate',
  'Machine Learning & AI': 'neurology',
  'Security & Auth': 'shield',
};

export const MarketplacePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query state
  const urlQ = searchParams.get('q') ?? '';
  const urlCategory = searchParams.get('category') ?? 'All';
  const urlTag = searchParams.get('tag') ?? '';
  const urlPricing = (searchParams.get('pricing') as 'free' | 'paid' | null) ?? undefined;
  const urlSort = (searchParams.get('sort') as 'newest' | 'name' | null) ?? 'newest';
  const urlPage = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const urlPageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') ?? '20', 10) || 20));

  // Responsive UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Local search input for immediate typing response
  const [searchInput, setSearchInput] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setSearchInput(urlQ);
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Data fetching state
  const [items, setItems] = useState<MarketplaceApiSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const hasLoadedOnceRef = useRef(false);

  // Debounced update to URL search params when user types
  const debounceTimerRef = useRef<number | null>(null);

  const updateSearchParam = useCallback(
    (newQ: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const trimmed = newQ.trim();
        if (trimmed) {
          next.set('q', trimmed);
        } else {
          next.delete('q');
        }
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      updateSearchParam(val);
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    updateSearchParam('');
  };

  const handleSelectCategory = (cat: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (cat === 'All') {
        next.delete('category');
      } else {
        next.set('category', cat);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSelectPricing = (pricing: 'free' | 'paid' | 'all') => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (pricing === 'all') {
        next.delete('pricing');
      } else {
        next.set('pricing', pricing);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSelectSort = (sort: 'newest' | 'name') => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (sort === 'newest') {
        next.delete('sort');
      } else {
        next.set('sort', sort);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newPage <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(newPage));
      }
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newSize === 20) {
        next.delete('pageSize');
      } else {
        next.set('pageSize', String(newSize));
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    setSearchParams(new URLSearchParams());
  };

  // Fetch data with AbortController
  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setError(null);
        if (hasLoadedOnceRef.current) {
          setIsRefetching(true);
        }

        const query: MarketplaceQuery = {
          q: urlQ || undefined,
          category: urlCategory !== 'All' ? urlCategory : undefined,
          tag: urlTag || undefined,
          pricing: urlPricing,
          sort: urlSort,
          page: urlPage,
          pageSize: urlPageSize,
        };

        const result = await listMarketplaceApis(query, signal);
        hasLoadedOnceRef.current = true;
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        if (signal?.aborted) return;
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(new ApiError(0, 'UNKNOWN_ERROR', 'Đã xảy ra lỗi không xác định.'));
        }
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [urlQ, urlCategory, urlTag, urlPricing, urlSort, urlPage, urlPageSize]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / urlPageSize));
  const hasActiveFilters = Boolean(urlQ || (urlCategory && urlCategory !== 'All') || urlTag || urlPricing);
  const displayedItems = items;

  return (
    <PageReveal className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto min-h-screen">
      {/* Hero Header / Search Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-2">
            <span>{t('Marketplace')}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-label-md">{t('All APIs')}</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
            {t('Explore High-Performance APIs')}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed min-h-[1.5rem]">
            <TypingText
              text={t('Discover, test in real-time sandbox, and integrate production-grade APIs crafted by verified engineering providers.')}
              duration={20}
              loop={false}
              inViewOnce={true}
            />
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-96 flex-shrink-0">
          <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2.5">search</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder={t('Search APIs by name, description...')}
              className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={t('Clear search')}
                className="text-on-surface-variant hover:text-on-surface mr-2 text-[16px] focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            )}
            <kbd className="text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm select-none">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters + Results */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-[280px] xl:w-[300px] flex-shrink-0 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/20">
            <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span> {t('Filters')}
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-body-sm text-primary hover:underline font-label-md cursor-pointer"
              >
                {t('Reset')}
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Category')}
            </h4>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const isSelected = (urlCategory === cat) || (cat === 'All' && !urlCategory);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <span className={`material-symbols-outlined text-[18px] flex-shrink-0 ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {CATEGORY_ICONS[cat] || 'category'}
                      </span>
                      <span className="truncate text-[13px]">{t(cat)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Filters */}
          <div className="mb-5 pt-4 border-t border-outline-variant/30">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Pricing Options')}
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="pricing"
                  checked={!urlPricing}
                  onChange={() => handleSelectPricing('all')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('All Pricing')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="pricing"
                  checked={urlPricing === 'free'}
                  onChange={() => handleSelectPricing('free')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('Free Tier Available')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="pricing"
                  checked={urlPricing === 'paid'}
                  onChange={() => handleSelectPricing('paid')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('Paid Plans Only')}</span>
              </label>
            </div>
          </div>

          {/* Provider Verification Filter */}
          <div className="pt-4 border-t border-outline-variant/30">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-2 font-semibold">
              {t('Provider Trust')}
            </h4>
            <label
              className="flex items-center gap-2.5 text-body-sm text-on-surface-variant cursor-not-allowed select-none mb-3 opacity-70"
              title={t('Tính năng lọc theo Provider Verified sẽ mở cùng backend query param trong Sprint 4')}
            >
              <input
                type="checkbox"
                disabled={true}
                checked={false}
                readOnly
                className="accent-primary w-4 h-4 rounded cursor-not-allowed"
              />
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>{t('Only Verified Providers')}</span>
                <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold ml-1">
                  {t('Chờ Sprint 4')}
                </span>
              </span>
            </label>
            <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 text-body-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-medium text-on-surface mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>{t('Verified Providers')}</span>
              </div>
              <p className="text-[12px] leading-relaxed">
                {t('Trạng thái xác minh của nhà phát triển được hiển thị rõ ràng trên từng thẻ API và chi tiết sản phẩm.')}
              </p>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-surface-container-low border border-outline-variant/30 px-5 py-3.5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Mobile Filter Trigger */}
              <Button
                variant="outline"
                size="sm"
                icon="tune"
                className="lg:hidden"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                {t('Filters')}
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary inline-block ml-1" />
                )}
              </Button>

              <span className="text-body-md font-semibold text-on-surface whitespace-nowrap flex items-center gap-1.5">
                <AnimatedCounter value={total} className="text-primary font-bold" />
                <span>{t('APIs available')}</span>
              </span>

              {urlCategory && urlCategory !== 'All' && (
                <Badge variant="primary" size="sm">{t(urlCategory)}</Badge>
              )}
              {urlPricing && (
                <Badge variant="outline" size="sm">
                  {urlPricing === 'free' ? t('Free Tier') : t('Paid Plans')}
                </Badge>
              )}
              {isRefetching && (
                <span className="text-body-xs text-primary animate-pulse flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                  {t('Updating...')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Grid vs List Toggle */}
              <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 border border-outline-variant/30">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-surface-container-lowest text-primary shadow-2xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-on-surface-variant whitespace-nowrap hidden md:inline">{t('Sort by:')}</span>
                <CustomSelect<'newest' | 'name'>
                  value={urlSort}
                  onChange={handleSelectSort}
                  options={[
                    { value: 'newest', label: t('Newest (Mới nhất)'), icon: 'schedule' },
                    { value: 'name', label: t('Name (Tên A–Z)'), icon: 'sort_by_alpha' },
                  ]}
                  className="w-44 sm:w-52"
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error ? (
            <div className="bg-surface-container-low border border-error/30 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px]">
                  {error.status === 429 ? 'hourglass_top' : 'cloud_off'}
                </span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {error.status === 429 ? t('Gửi yêu cầu quá nhanh') : t('Không thể tải danh sách API')}
              </h3>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-lg mx-auto">
                {error.status === 429
                  ? t('Hệ thống đang giới hạn tần suất truy vấn để bảo vệ tài nguyên. Vui lòng đợi trong giây lát rồi thử lại.')
                  : error.message || t('Đã xảy ra sự cố khi kết nối tới máy chủ. Vui lòng kiểm tra đường truyền và thử lại.')}
              </p>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="primary"
                  icon="refresh"
                  onClick={() => fetchData()}
                >
                  {t('Thử lại')}
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5" aria-label="Loading marketplace APIs">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 animate-pulse flex flex-col justify-between h-64"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-surface-container-high rounded w-3/4" />
                        <div className="h-3 bg-surface-container-high rounded w-1/3" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3.5 bg-surface-container-high rounded w-full" />
                      <div className="h-3.5 bg-surface-container-high rounded w-4/5" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-surface-container-high rounded" />
                      <div className="h-5 w-16 bg-surface-container-high rounded" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                    <div className="h-4 bg-surface-container-high rounded w-24" />
                    <div className="h-8 bg-surface-container-high rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : total === 0 && !hasActiveFilters ? (
            /* Empty Catalog State */
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px]">storefront</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface">
                {t('Sàn API đang sẵn sàng đón nhận sản phẩm')}
              </h3>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-lg mx-auto">
                {t('Hiện tại chưa có API nào được xuất bản lên sàn công khai. Bạn là Nhà phát triển (Provider)? Hãy đăng ký và xuất bản sản phẩm API đầu tiên của bạn!')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="primary"
                  icon="add_circle"
                  onClick={() => navigate('/provider/create-api')}
                >
                  {t('Tạo API Mới')}
                </Button>
                <Button
                  variant="outline"
                  icon="person_add"
                  onClick={() => navigate('/register')}
                >
                  {t('Đăng ký Nhà cung cấp')}
                </Button>
              </div>
            </div>
          ) : displayedItems.length === 0 ? (
            /* No Results for Filter */
            <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
              <h3 className="text-headline-sm font-semibold text-on-surface">
                {t('No APIs Match Your Criteria')}
              </h3>
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
                {t('Try loosening your filters or searching for different terms.')}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleResetFilters}
              >
                {t('Reset All Filters')}
              </Button>
            </div>
          ) : (
            /* APIs Grid */
            <StaggerGrid className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-5" : "flex flex-col gap-4"}>
              {displayedItems.map(api => {
                return (
                  <AnimatedCard
                    key={api.id}
                    hoverLift={true}
                    className="flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-[26px]">
                              {CATEGORY_ICONS[api.category] || 'api'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/api/${api.id}`}
                              className="text-headline-sm font-headline-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                            >
                              {api.name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant mt-0.5">
                              <span className="truncate">{api.providerName}</span>
                              {api.providerStatus === 'Verified' && (
                                <span
                                  className="material-symbols-outlined text-primary text-[16px] flex-shrink-0"
                                  title={t('Verified Provider')}
                                >
                                  verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-lg text-body-xs font-medium text-on-surface-variant flex-shrink-0">
                          <span>{t(api.category)}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {api.description}
                      </p>

                      {/* Developer Tags */}
                      {api.tags && api.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4" data-no-translate="true">
                          {api.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className="text-[11px] font-code-sm font-medium bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-md border border-outline-variant/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center justify-between py-2 px-3 bg-surface-container/60 rounded-xl border border-outline-variant/20 mb-4 text-body-xs text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          <span>{t('Published')}: {formatPublishedDate(api.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {api.hasFreePlan && api.hasPaidPlan ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
                              {t('Free & Paid Plans')}
                            </span>
                          ) : api.hasFreePlan ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium">
                              {t('Free Tier Available')}
                            </span>
                          ) : api.hasPaidPlan ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-medium">
                              {t('Paid Plans Only')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-medium">
                              {t('Contact for Pricing')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] text-on-surface-variant block uppercase font-medium">
                          {t('Provider ID')}
                        </span>
                        <span className="text-body-sm font-code-sm text-on-surface truncate block">
                          #{api.providerId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="terminal"
                          onClick={() => navigate(`/api/${api.id}/playground`)}
                        >
                          {t('Playground')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          shine={true}
                          onClick={() => navigate(`/api/${api.id}`)}
                        >
                          {t('Details')}
                        </Button>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </StaggerGrid>
          )}

          {/* Pagination Controls */}
          {!error && !isLoading && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-outline-variant/30">
              <div className="text-body-sm text-on-surface-variant">
                {t('Hiển thị')} {(urlPage - 1) * urlPageSize + 1}–
                {Math.min(urlPage * urlPageSize, total)} / {total} API
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon="chevron_left"
                  disabled={urlPage <= 1 || isRefetching}
                  onClick={() => handlePageChange(urlPage - 1)}
                >
                  {t('Previous')}
                </Button>

                <span className="text-body-sm font-medium text-on-surface px-2">
                  {t('Trang')} {urlPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={urlPage >= totalPages || isRefetching}
                  onClick={() => handlePageChange(urlPage + 1)}
                >
                  <span className="flex items-center gap-1">
                    {t('Next')}
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </span>
                </Button>
              </div>

              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span>{t('Mỗi trang')}:</span>
                <select
                  value={urlPageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-lg px-2 py-1 text-on-surface text-body-sm focus:outline-none"
                >
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal Drawer */}
      <Modal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title={t('Filters')}
        maxWidth="md"
      >
        <div className="py-2">
          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Category')}
            </h4>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const isSelected = (urlCategory === cat) || (cat === 'All' && !urlCategory);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      handleSelectCategory(cat);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <span className={`material-symbols-outlined text-[18px] flex-shrink-0 ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {CATEGORY_ICONS[cat] || 'category'}
                      </span>
                      <span className="truncate text-[13px]">{t(cat)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Filters */}
          <div className="mb-5 pt-4 border-t border-outline-variant/30">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Pricing Options')}
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="mobile-pricing"
                  checked={!urlPricing}
                  onChange={() => handleSelectPricing('all')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('All Pricing')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="mobile-pricing"
                  checked={urlPricing === 'free'}
                  onChange={() => handleSelectPricing('free')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('Free Tier Available')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="radio"
                  name="mobile-pricing"
                  checked={urlPricing === 'paid'}
                  onChange={() => handleSelectPricing('paid')}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span>{t('Paid Plans Only')}</span>
              </label>
            </div>
          </div>

          {/* Provider Verification Filter */}
          <div className="pt-4 border-t border-outline-variant/30">
            <label
              className="flex items-center gap-2.5 text-body-sm text-on-surface-variant cursor-not-allowed select-none mb-3 opacity-70"
              title={t('Tính năng lọc theo Provider Verified sẽ mở cùng backend query param trong Sprint 4')}
            >
              <input
                type="checkbox"
                disabled={true}
                checked={false}
                readOnly
                className="accent-primary w-4 h-4 rounded cursor-not-allowed"
              />
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>{t('Only Verified Providers')}</span>
                <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold ml-1">
                  {t('Chờ Sprint 4')}
                </span>
              </span>
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="text-body-sm text-primary hover:underline font-label-md cursor-pointer"
              >
                {t('Reset')}
              </button>
            ) : <span />}
            <Button
              variant="primary"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              {t('Apply Filters')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
