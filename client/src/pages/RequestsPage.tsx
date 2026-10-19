import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GitPullRequest,
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  CollaborationRequestData,
  RequestStatus,
  PaginationMeta,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

const STATUS_VARIANTS: Record<RequestStatus, 'default' | 'success' | 'warning' | 'danger' | 'accent'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'default',
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending Response',
  accepted: 'Accepted',
  rejected: 'Declined',
  withdrawn: 'Withdrawn',
};

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requests, setRequests] = useState<CollaborationRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | undefined> = {
        type: activeTab,
        page,
        limit: 12,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await api.getRequests(params);
      setRequests(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collaboration requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      setActionLoadingId(id);
      await api.respondToRequest(id, action);
      toast.success(
        action === 'accept'
          ? 'Collaboration request accepted!'
          : 'Collaboration request declined.'
      );
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      setActionLoadingId(id);
      await api.withdrawRequest(id);
      toast.success('Collaboration request withdrawn.');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw request');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight flex items-center gap-2.5">
            <GitPullRequest className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Collaboration Requests</span>
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Review incoming partnership proposals and track applications you have submitted.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('inbox');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inbox'
                ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox (Received)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('outbox');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'outbox'
                ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Outbox (Sent)</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-48">
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Requests', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Accepted', value: 'accepted' },
              { label: 'Declined', value: 'rejected' },
              { label: 'Withdrawn', value: 'withdrawn' },
            ]}
          />
        </div>

        <span className="text-xs text-surface-400 self-end pb-2">
          {pagination.total} {pagination.total === 1 ? 'request' : 'requests'} found
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="w-48 h-5 bg-surface-200 dark:bg-surface-800 rounded" />
                <div className="w-24 h-5 bg-surface-200 dark:bg-surface-800 rounded" />
              </div>
              <div className="w-full h-4 bg-surface-100 dark:bg-surface-850 rounded" />
              <div className="w-1/3 h-4 bg-surface-100 dark:bg-surface-850 rounded" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            {activeTab === 'inbox'
              ? 'No requests in your inbox'
              : 'You have not sent any requests yet'}
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed">
            {activeTab === 'inbox'
              ? 'When brands or creators send collaboration requests, they will appear here for review.'
              : 'Explore open campaigns or creator profiles to send your first partnership proposal.'}
          </p>
          <Link to="/discover">
            <Button variant="outline" size="sm" className="mt-4">
              Explore Creator Discovery
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isRecipient =
              req.recipient &&
              (req.recipient._id === user?._id || (req.recipient as any) === user?._id);
            const isSender =
              req.sender &&
              (req.sender._id === user?._id || (req.sender as any) === user?._id);

            const isBusy = actionLoadingId === req._id;

            const otherParty = isRecipient ? req.sender : req.recipient;

            const dateStr = new Date(req.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={req._id}
                className="p-5 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm hover:border-surface-300 dark:hover:border-surface-700 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[req.status]} size="sm">
                      {STATUS_LABELS[req.status]}
                    </Badge>

                    {req.campaign && (
                      <Link
                        to={`/campaigns/${req.campaign._id}`}
                        className="text-xs font-bold text-surface-900 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{req.campaign.title}</span>
                        <ExternalLink className="w-3 h-3 text-surface-400" />
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
                    <span>
                      {activeTab === 'inbox' ? 'From:' : 'To:'}{' '}
                      <strong className="text-surface-800 dark:text-surface-200">
                        {otherParty?.name || 'User'}
                      </strong>{' '}
                      {otherParty?.orgName && `(${otherParty.orgName})`}
                    </span>

                    {req.proposedRate !== undefined && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Proposed Rate: ${req.proposedRate.toLocaleString()} {req.currency}
                      </span>
                    )}

                    <span>Sent on {dateStr}</span>
                  </div>

                  {req.pitch && (
                    <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed bg-surface-50 dark:bg-surface-850 p-3 rounded-xl border border-surface-100 dark:border-surface-800 mt-2">
                      &quot;{req.pitch}&quot;
                    </p>
                  )}
                </div>

                {/* Response / Action Controls */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  {req.status === 'pending' && isRecipient && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isBusy}
                        onClick={() => handleRespond(req._id, 'accept')}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={isBusy}
                        onClick={() => handleRespond(req._id, 'reject')}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {req.status === 'pending' && isSender && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isBusy}
                      onClick={() => handleWithdraw(req._id)}
                    >
                      Withdraw Request
                    </Button>
                  )}
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
            Showing Page {pagination.page} of {pagination.pages}
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
