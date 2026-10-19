import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, CampaignData, CampaignStatus, PaginationMeta } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

const STATUS_VARIANTS: Record<CampaignStatus, 'default' | 'success' | 'warning' | 'danger' | 'accent'> = {
  draft: 'default',
  open: 'accent',
  inProgress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  open: 'Open for Creators',
  inProgress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const CampaignsPage: React.FC = () => {
  const { user } = useAuth();

  const isBrand = user?.role === 'brand';

  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | undefined> = {
        page,
        limit: 12,
      };

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (isBrand && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await api.getCampaigns(params);
      setCampaigns(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, isBrand]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>{isBrand ? 'My Campaigns' : 'Explore Open Campaigns'}</span>
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            {isBrand
              ? 'Manage your creator briefs, deliverables, and partnership budgets.'
              : 'Discover active brand briefs and sponsorship opportunities.'}
          </p>
        </div>

        {isBrand && (
          <Link to="/campaigns/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className={isBrand ? 'sm:col-span-7' : 'sm:col-span-9'}>
              <Input
                label="Search by keywords"
                placeholder="Search campaign title, brief requirements, audience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-surface-400" />}
              />
            </div>

            {isBrand && (
              <div className="sm:col-span-3">
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Open', value: 'open' },
                    { label: 'In Progress', value: 'inProgress' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ]}
                />
              </div>
            )}

            <div className={isBrand ? 'sm:col-span-2 flex gap-2' : 'sm:col-span-3 flex gap-2'}>
              <Button type="submit" variant="outline" className="w-full" size="md">
                Filter
              </Button>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-24 h-5 bg-surface-200 dark:bg-surface-800 rounded-md" />
                <div className="w-16 h-5 bg-surface-200 dark:bg-surface-800 rounded-md" />
              </div>
              <div className="w-3/4 h-5 bg-surface-200 dark:bg-surface-800 rounded-md" />
              <div className="space-y-1.5">
                <div className="w-full h-3.5 bg-surface-100 dark:bg-surface-850 rounded" />
                <div className="w-5/6 h-3.5 bg-surface-100 dark:bg-surface-850 rounded" />
              </div>
              <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex justify-between">
                <div className="w-16 h-4 bg-surface-200 dark:bg-surface-800 rounded" />
                <div className="w-20 h-4 bg-surface-200 dark:bg-surface-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            {isBrand ? 'No campaigns created yet' : 'No open campaigns found'}
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">
            {isBrand
              ? 'Get started by creating your first campaign brief with deliverables and budget.'
              : 'There are currently no active open campaigns matching your filter criteria. Check back soon!'}
          </p>
          {isBrand ? (
            <Link to="/campaigns/new">
              <Button variant="primary" size="sm" className="mt-4" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Your First Campaign
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => {
            const formattedDate = new Date(camp.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={camp._id}
                className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm hover:border-surface-300 dark:hover:border-surface-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={STATUS_VARIANTS[camp.status]} size="sm">
                      {STATUS_LABELS[camp.status]}
                    </Badge>

                    {camp.brand && typeof camp.brand === 'object' && camp.brand.name && !isBrand && (
                      <span className="text-[11px] font-semibold text-surface-500 truncate max-w-[130px]">
                        {camp.brand.name}
                      </span>
                    )}
                  </div>

                  <Link to={`/campaigns/${camp._id}`}>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1 mb-1.5">
                      {camp.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed mb-3">
                    {camp.brief}
                  </p>

                  {/* Deliverables snippet */}
                  {camp.deliverables && camp.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {camp.deliverables.slice(0, 2).map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-medium text-surface-600 dark:text-surface-300"
                        >
                          {d.count}x {d.type}
                        </span>
                      ))}
                      {camp.deliverables.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] text-surface-400 font-medium">
                          +{camp.deliverables.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-100 dark:border-surface-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">
                        Budget
                      </span>
                      <span className="font-extrabold text-surface-900 dark:text-surface-100">
                        ${camp.budget.toLocaleString()} {camp.currency}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">
                        Deadline
                      </span>
                      <span className="font-medium text-surface-700 dark:text-surface-300">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      to={`/campaigns/${camp._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>View Brief</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {isBrand && (
                      <Link
                        to={`/campaigns/${camp._id}/edit`}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        title="Edit campaign"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-800 text-xs">
          <span className="text-surface-500">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} campaigns total)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
