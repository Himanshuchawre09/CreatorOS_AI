import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  ContractData,
  ContractStatus,
  PaginationMeta,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

const STATUS_VARIANTS: Record<
  ContractStatus,
  'default' | 'success' | 'warning' | 'danger' | 'accent'
> = {
  draft: 'default',
  sent: 'warning',
  signed: 'success',
  declined: 'danger',
};

export const ContractsPage: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getContracts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success && res.data) {
        setContracts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Failed to load contracts');
      }
    } catch {
      setError('An error occurred while loading contracts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-brand-500" />
            Contracts & Agreements
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage, review, and countersign your collaboration contracts.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="status-filter" className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Status:
          </label>
          <div className="w-40">
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'In Review / Sent' },
                { value: 'signed', label: 'Signed (Active)' },
                { value: 'declined', label: 'Declined' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              <div className="h-10 bg-neutral-100 dark:bg-neutral-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 rounded-xl">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchContracts}>
            Retry
          </Button>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
          <FileCheck2 className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No contracts match your filters
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Contracts are generated automatically when a collaboration request is accepted by both parties.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contracts.map((contract) => {
            const isUserBrand =
              typeof contract.brand === 'object' && contract.brand._id === user?._id;
            const counterPartyName = isUserBrand
              ? contract.creator?.name || 'Creator'
              : contract.brand?.orgName || contract.brand?.name || 'Brand';

            const userSigned = isUserBrand
              ? !!contract.brandSignedAt
              : !!contract.creatorSignedAt;

            return (
              <div
                key={contract._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={STATUS_VARIANTS[contract.status]}>
                      {contract.status === 'signed'
                        ? 'Signed (Active)'
                        : contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-neutral-400">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-1 mb-1">
                    {contract.campaign?.title || 'Collaboration Agreement'}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    With{' '}
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {counterPartyName}
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-b border-neutral-100 dark:border-neutral-800/80 mb-4">
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-medium">
                        {contract.currency} {contract.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{new Date(contract.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Signatures status indicator */}
                  <div className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {contract.brandSignedAt ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        Brand
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {contract.brandSignedAt
                          ? new Date(contract.brandSignedAt).toLocaleDateString()
                          : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {contract.creatorSignedAt ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        Creator
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {contract.creatorSignedAt
                          ? new Date(contract.creatorSignedAt).toLocaleDateString()
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Link to={`/contracts/${contract._id}`} className="w-full">
                    <Button
                      variant={!userSigned && contract.status !== 'declined' ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      {!userSigned && contract.status !== 'declined'
                        ? 'Review & Sign'
                        : 'View Contract'}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer Footer */}
      <footer className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-neutral-400" />
        <span>Simple agreement record, not legal advice.</span>
      </footer>
    </div>
  );
};
