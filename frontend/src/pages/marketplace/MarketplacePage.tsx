import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const MarketplacePage: React.FC = () => {
  const { apis } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'latency' | 'rating'>('popular');

  const categories = [
    'All',
    'Machine Learning & AI',
    'Finance & Banking',
    'Data & Web Scraping',
    'DevOps & Cloud',
    'Translation & NLP',
    'Weather & Geo',
    'Security & Auth'
  ];

  const categoryIcons: Record<string, string> = {
    'All': 'grid_view',
    'Machine Learning & AI': 'neurology',
    'Finance & Banking': 'payments',
    'Data & Web Scraping': 'database',
    'DevOps & Cloud': 'cloud',
    'Translation & NLP': 'translate',
    'Weather & Geo': 'partly_cloudy_day',
    'Security & Auth': 'shield'
  };

  const filteredApis = useMemo(() => {
    return apis
      .filter(api => {
        // Only show published in marketplace (or draft if testing)
        if (api.status !== 'Published' && api.status !== 'Draft') return false;
        
        // Category filter
        if (selectedCategory !== 'All' && api.category !== selectedCategory) return false;

        // Verified filter
        if (verifiedOnly && !api.providerVerified) return false;

        // Free tier filter
        if (freeOnly && !api.plans.some(p => p.priceMonthly === 0)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = api.name.toLowerCase().includes(q);
          const matchesDesc = api.shortDescription.toLowerCase().includes(q);
          const matchesTags = api.tags.some(t => t.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.subscribersCount - a.subscribersCount;
        if (sortBy === 'latency') return a.latencyP95Ms - b.latencyP95Ms;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [apis, selectedCategory, verifiedOnly, freeOnly, searchQuery, sortBy]);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
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
          <p className="text-body-md text-on-surface-variant mt-1.5 max-w-2xl leading-relaxed">
            {t('Discover, test in real-time sandbox, and integrate production-grade APIs crafted by verified engineering providers.')}
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-96 flex-shrink-0">
          <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2.5">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search APIs, tags, schemas...')}
              className="w-full bg-transparent text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant hover:text-on-surface mr-2 text-[16px]"
              >
                ✕
              </button>
            )}
            <span className="text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters + Results */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/20">
            <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span> {t('Filters')}
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setFreeOnly(false);
                setVerifiedOnly(false);
                setSearchQuery('');
              }}
              className="text-body-sm text-primary hover:underline font-label-md"
            >
              {t('Reset')}
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Category')}
            </h4>
            <div className="space-y-1">
              {categories.map(cat => {
                const count = cat === 'All' 
                  ? apis.length 
                  : apis.filter(a => a.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm transition-all text-left ${
                      isSelected
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <span className={`material-symbols-outlined text-[18px] flex-shrink-0 ${isSelected ? 'text-on-primary' : 'text-primary'}`}>
                        {categoryIcons[cat] || 'category'}
                      </span>
                      <span className="truncate text-[13px]">{t(cat)}</span>
                    </div>
                    <span className={`text-code-sm font-code-sm px-2 py-0.5 rounded-full text-[11px] flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-on-primary font-bold' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {count}
                    </span>
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
            <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="rounded accent-primary w-4 h-4 cursor-pointer"
              />
              <span>{t('Free Tier Available')}</span>
            </label>
          </div>

          {/* Verification Status */}
          <div className="pt-4 border-t border-outline-variant/30">
            <h4 className="text-[11px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-3 font-semibold">
              {t('Provider Trust')}
            </h4>
            <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded accent-primary w-4 h-4 cursor-pointer"
              />
              <span>{t('Verified Providers Only')}</span>
            </label>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-surface-container-low border border-outline-variant/30 px-5 py-3.5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-body-md font-semibold text-on-surface whitespace-nowrap">
                {filteredApis.length} {t('APIs available')}
              </span>
              {selectedCategory !== 'All' && (
                <Badge variant="primary" size="sm">{t(selectedCategory)}</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-body-sm text-on-surface-variant whitespace-nowrap">{t('Sort by:')}</span>
              <CustomSelect<'popular' | 'latency' | 'rating'>
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: 'popular', label: t('Most Popular'), icon: 'trending_up' },
                  { value: 'latency', label: t('Lowest Latency (P95)'), icon: 'speed' },
                  { value: 'rating', label: t('Highest Rated'), icon: 'star' },
                ]}
                className="w-48 sm:w-52"
              />
            </div>
          </div>

          {/* APIs Grid */}
          {apis.length === 0 ? (
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px]">storefront</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface">{t('Sàn API đang sẵn sàng đón nhận sản phẩm')}</h3>
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
          ) : filteredApis.length === 0 ? (
            <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
              <h3 className="text-headline-sm font-semibold text-on-surface">{t('No APIs Match Your Criteria')}</h3>
              <p className="text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
                {t('Try loosening your filters or searching for terms like "chat", "translate", "payment", or "radar".')}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory('All');
                  setFreeOnly(false);
                  setVerifiedOnly(false);
                  setSearchQuery('');
                }}
              >
                {t('Reset All Filters')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filteredApis.map(api => {
                const cheapestPlan = [...api.plans].sort((a, b) => a.priceMonthly - b.priceMonthly)[0];
                return (
                  <div
                    key={api.id}
                    className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-outline-variant/80 hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-[26px]">{api.icon}</span>
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
                              {api.providerVerified && (
                                <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0" title={t('Verified Provider')}>
                                  verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-lg text-body-sm font-medium flex-shrink-0">
                          <span className="material-symbols-outlined text-amber-500 text-[16px]">star</span>
                          <span>{api.rating > 0 ? api.rating.toFixed(1) : t('New')}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {t(api.shortDescription) || api.shortDescription}
                      </p>

                      {/* Developer Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4" data-no-translate="true">
                        {api.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[11px] font-code-sm font-medium bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-md border border-outline-variant/20">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Metrics bar */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-surface-container/60 rounded-xl border border-outline-variant/20 mb-4 text-center">
                        <div className="px-1">
                          <span className="text-[11px] text-on-surface-variant/80 block font-medium truncate mb-0.5">{t('Latency P95')}</span>
                          <span className="text-body-sm font-code-md font-bold text-emerald-600 block">
                            {api.latencyP95Ms}ms
                          </span>
                        </div>
                        <div className="px-1 border-x border-outline-variant/20">
                          <span className="text-[11px] text-on-surface-variant/80 block font-medium truncate mb-0.5">{t('Uptime')}</span>
                          <span className="text-body-sm font-code-md font-bold text-emerald-600 block">
                            {api.uptimePercent}%
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[11px] text-on-surface-variant/80 block font-medium truncate mb-0.5">{t('Monthly Calls')}</span>
                          <span className="text-body-sm font-code-md font-bold text-on-surface block">
                            {api.totalCallsMonthly}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] text-on-surface-variant block uppercase font-medium">{t('Pricing')}</span>
                        <span className="text-body-sm font-bold text-on-surface truncate block">
                          {cheapestPlan?.priceMonthly === 0 ? t('Free Tier Available') : `${t('From')} $${cheapestPlan?.priceMonthly}/tháng`}
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
                          onClick={() => navigate(`/api/${api.id}`)}
                        >
                          {t('Details')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
