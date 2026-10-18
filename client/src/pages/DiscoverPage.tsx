import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Compass,
  Users,
  Building,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  CreatorProfileData,
  BrandProfileData,
  PaginationMeta,
} from '../services/api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const DiscoverPage: React.FC = () => {
  const { user } = useAuth();

  // Mode: for brands, default to creators; for creators, default to brands
  const initialMode = user?.role === 'creator' ? 'brands' : 'creators';
  const [activeTab, setActiveTab] = useState<'creators' | 'brands'>(initialMode);

  // Common filters
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Creator specific filters
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('');
  const [followerTier, setFollowerTier] = useState('');

  // Brand specific filters
  const [industry, setIndustry] = useState('');

  // Data states
  const [creators, setCreators] = useState<CreatorProfileData[]>([]);
  const [brands, setBrands] = useState<BrandProfileData[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Compute min/max followers from followerTier
  const getFollowerBounds = useCallback(() => {
    switch (followerTier) {
      case '0-10k':
        return { minFollowers: 0, maxFollowers: 10000 };
      case '10k-50k':
        return { minFollowers: 10000, maxFollowers: 50000 };
      case '50k-100k':
        return { minFollowers: 50000, maxFollowers: 10000 };
      case '100k-500k':
        return { minFollowers: 100000, maxFollowers: 500000 };
      case '500k+':
        return { minFollowers: 500000, maxFollowers: undefined };
      default:
        return { minFollowers: undefined, maxFollowers: undefined };
    }
  }, [followerTier]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'creators') {
        const bounds = getFollowerBounds();
        const res = await api.getCreators({
          q: searchQuery.trim() || undefined,
          niche: niche || undefined,
          platform: platform || undefined,
          minFollowers: bounds.minFollowers,
          maxFollowers: bounds.maxFollowers,
          page,
          limit: 12,
        });
        setCreators(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      } else {
        const res = await api.getBrands({
          q: searchQuery.trim() || undefined,
          industry: industry || undefined,
          page,
          limit: 12,
        });
        setBrands(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch {
      // Empty result or failure handled honestly
      if (activeTab === 'creators') setCreators([]);
      else setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, niche, platform, getFollowerBounds, industry, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle tab switch
  const handleTabChange = (tab: 'creators' | 'brands') => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery('');
  };

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Collaboration Directory</span>
          </div>
          <h1 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">
            {activeTab === 'creators' ? 'Discover Creators' : 'Discover Brands'}
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            {activeTab === 'creators'
              ? 'Browse verified creator media channels, engagement benchmarks, and niches.'
              : 'Explore partner brands looking for active creator sponsorship campaigns.'}
          </p>
        </div>

        {/* Directory Toggle Tabs */}
        <div className="flex items-center p-1 bg-surface-100 dark:bg-surface-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('creators')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'creators'
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Creators</span>
          </button>
          <button
            onClick={() => handleTabChange('brands')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'brands'
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Brands</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder={activeTab === 'creators' ? 'Search by creator name, niche, or bio...' : 'Search brand or industry...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-surface-400" />}
            />
          </div>

          {activeTab === 'creators' ? (
            <>
              <Select
                value={niche}
                onChange={(e) => {
                  setNiche(e.target.value);
                  setPage(1);
                }}
                options={[
                  { label: 'All Niches', value: '' },
                  { label: 'Tech & Hardware', value: 'Tech & Hardware' },
                  { label: 'Technology', value: 'Technology' },
                  { label: 'Gaming & Esports', value: 'Gaming & Esports' },
                  { label: 'Fitness & Wellness', value: 'Fitness & Wellness' },
                  { label: 'Travel & Lifestyle', value: 'Travel & Lifestyle' },
                  { label: 'Beauty & Fashion', value: 'Beauty & Fashion' },
                  { label: 'Business & Finance', value: 'Business & Finance' },
                  { label: 'Education & Design', value: 'Education & Design' },
                ]}
              />

              <Select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setPage(1);
                }}
                options={[
                  { label: 'All Platforms', value: '' },
                  { label: 'YouTube', value: 'youtube' },
                  { label: 'Instagram', value: 'instagram' },
                  { label: 'TikTok', value: 'tiktok' },
                  { label: 'Twitch', value: 'twitch' },
                  { label: 'Blog / Web', value: 'blog' },
                ]}
              />
            </>
          ) : (
            <div className="sm:col-span-2">
              <Select
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  setPage(1);
                }}
                options={[
                  { label: 'All Industries', value: '' },
                  { label: 'Audio & Consumer Tech', value: 'Audio & Consumer Tech' },
                  { label: 'Apparel & Fitness', value: 'Apparel & Fitness' },
                  { label: 'Software & SaaS', value: 'Software & SaaS' },
                  { label: 'Health & Nutrition', value: 'Health & Nutrition' },
                  { label: 'E-commerce & Retail', value: 'E-commerce & Retail' },
                ]}
              />
            </div>
          )}
        </div>

        {activeTab === 'creators' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-100 dark:border-surface-850 text-xs">
            <span className="text-[11px] font-semibold text-surface-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Followers:
            </span>
            {[
              { label: 'Any size', value: '' },
              { label: '< 10K', value: '0-10k' },
              { label: '10K - 50K', value: '10k-50k' },
              { label: '50K - 100K', value: '50k-100k' },
              { label: '100K - 500K', value: '100k-500k' },
              { label: '500K+', value: '500k+' },
            ].map((tier) => (
              <button
                key={tier.label}
                onClick={() => {
                  setFollowerTier(tier.value);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  followerTier === tier.value
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'creators' ? (
        creators.length === 0 ? (
          <div className="p-12 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
              No creators match your filters
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">
              No creator profiles currently match the selected criteria. Try adjusting your search query, niche, or follower thresholds.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setNiche('');
                setPlatform('');
                setFollowerTier('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((creator) => {
              const targetId = creator._id || creator.user;
              return (
                <div
                  key={targetId}
                  className="p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 line-clamp-1">
                          {creator.displayName}
                        </h3>
                        {creator.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-surface-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {creator.location}
                          </span>
                        )}
                      </div>
                      <Badge variant="accent" size="sm" className="capitalize text-[10px]">
                        {creator.niche}
                      </Badge>
                    </div>

                    {creator.bio && (
                      <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed mb-3">
                        {creator.bio}
                      </p>
                    )}

                    {/* Platform icons & counts */}
                    {creator.platforms && creator.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {creator.platforms.map((p, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-[10px] font-semibold text-surface-700 dark:text-surface-300 capitalize"
                          >
                            <span>{p.platform}</span>
                            <span className="text-surface-400 font-normal">
                              ({formatFollowers(p.followers)})
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-surface-100 dark:border-surface-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">
                        Total Reach
                      </span>
                      <span className="text-xs font-bold text-surface-900 dark:text-surface-100">
                        {formatFollowers(creator.totalFollowers)}
                      </span>
                    </div>

                    <Link
                      to={`/creators/${targetId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : brands.length === 0 ? (
        <div className="p-12 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            No brands match your filters
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">
            No brand accounts currently match your search criteria. Try modifying your search query or industry filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setIndustry('');
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => {
            const targetId = brand._id || brand.user;
            return (
              <div
                key={targetId}
                className="p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 line-clamp-1">
                      {brand.companyName}
                    </h3>
                    <Badge variant="neutral" size="sm" className="text-[10px]">
                      {brand.industry}
                    </Badge>
                  </div>

                  {brand.about && (
                    <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-3 leading-relaxed mb-3">
                      {brand.about}
                    </p>
                  )}

                  {brand.targetAudience && (
                    <div className="text-[11px] text-surface-500 mb-3">
                      <span className="font-semibold text-surface-700 dark:text-surface-300">Audience: </span>
                      <span className="line-clamp-1">{brand.targetAudience}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-100 dark:border-surface-850 flex items-center justify-between">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[11px] text-surface-400 hover:text-brand-600 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-surface-400">Verified Brand</span>
                  )}

                  <Link
                    to={`/brands/${targetId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
