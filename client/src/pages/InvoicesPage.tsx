import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  InvoiceItem,
  InvoiceStatus,
  PaginationMeta,
  CollaborationRequestData,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

const STATUS_VARIANTS: Record<
  InvoiceStatus,
  'default' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  draft: 'neutral',
  sent: 'warning',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'default',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent / Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Collaborations for dropdown in Create Modal
  const [collabs, setCollabs] = useState<CollaborationRequestData[]>([]);
  const [loadingCollabs, setLoadingCollabs] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    collaborationId: '',
    amount: '',
    currency: 'USD',
    description: '',
    dueDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getInvoices({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setInvoices(res.data);
        if (res.pagination) {
          setPagination({
            ...res.pagination,
            pages: res.pagination.pages || res.pagination.totalPages || 1,
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const fetchAcceptedCollabs = async () => {
    setLoadingCollabs(true);
    try {
      const res = await api.getRequests({
        tab: 'inbox',
        status: 'accepted',
      });
      const inboxList = (res.data as CollaborationRequestData[]) || [];

      const resOut = await api.getRequests({
        tab: 'outbox',
        status: 'accepted',
      });
      const outboxList = (resOut.data as CollaborationRequestData[]) || [];

      // Combine unique
      const combined = [...inboxList, ...outboxList];
      const unique = combined.filter(
        (c, idx, arr) => arr.findIndex((x) => x._id === c._id) === idx
      );
      setCollabs(unique);
      if (unique.length > 0 && !formData.collaborationId) {
        setFormData((prev) => ({ ...prev, collaborationId: unique[0]._id }));
      }
    } catch {
      // Ignore
    } finally {
      setLoadingCollabs(false);
    }
  };

  const handleOpenCreateModal = () => {
    fetchAcceptedCollabs();
    setIsCreateOpen(true);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collaborationId) {
      toast.error('Please select a collaboration');
      return;
    }
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createInvoice({
        collaborationId: formData.collaborationId,
        amount: numAmount,
        currency: formData.currency,
        description: formData.description.trim(),
        dueDate: formData.dueDate,
        notes: formData.notes.trim() || undefined,
      });

      if (res.success) {
        toast.success('Invoice created successfully as draft');
        setIsCreateOpen(false);
        setFormData({
          collaborationId: '',
          amount: '',
          currency: 'USD',
          description: '',
          dueDate: '',
          notes: '',
        });
        fetchInvoices();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: 'sent' | 'paid' | 'cancelled'
  ) => {
    setActionLoadingId(invoiceId);
    try {
      const res = await api.updateInvoiceStatus(invoiceId, newStatus);
      if (res.success) {
        toast.success(`Invoice marked as ${newStatus}`);
        fetchInvoices();
        if (selectedInvoice && selectedInvoice._id === invoiceId) {
          setSelectedInvoice(res.data!);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update invoice status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Invoices & Payment Tracking
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            Track deliverable billing and payment completion status for brand partnerships.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="self-start sm:self-auto text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Invoice
        </Button>
      </div>

      {/* Honest Tracking Notice Banner */}
      <div className="p-4 bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-2xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs text-surface-700 dark:text-surface-300 space-y-1">
          <p className="font-bold text-surface-900 dark:text-surface-100">
            Payment Status Tracking Only
          </p>
          <p className="leading-relaxed">
            CreatorOS tracks invoices and payment milestones for record-keeping and workflow transparency.
            <strong className="font-semibold text-brand-700 dark:text-brand-300"> No actual payments or escrow transactions are processed on this platform. </strong>
            Mark invoices as paid once off-platform settlement (bank transfer, PayPal, Stripe, etc.) is confirmed by both parties.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-surface-900 p-3.5 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          <span className="text-xs font-semibold text-surface-600 dark:text-surface-300">
            Filter Status:
          </span>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Invoices' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent (Pending)' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="text-xs py-1"
          />
        </div>

        <span className="text-xs text-surface-400">
          Showing {invoices.length} of {pagination.total} invoices
        </span>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 bg-surface-100 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800"
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            No invoices tracked yet
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-4">
            {statusFilter === 'all'
              ? 'Create an invoice for an accepted collaboration to track payment status.'
              : `No invoices match the "${statusFilter}" filter.`}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create First Invoice
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => {
            const isIssuer =
              inv.issuer?._id?.toString() === user?._id?.toString() ||
              inv.issuer?._id?.toString() === user?.id?.toString();

            return (
              <div
                key={inv._id}
                className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-surface-500">
                        {inv.invoiceNumber}
                      </span>
                      <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 line-clamp-1 mt-0.5">
                        {inv.description}
                      </h3>
                    </div>
                    <Badge variant={STATUS_VARIANTS[inv.status]}>
                      {STATUS_LABELS[inv.status]}
                    </Badge>
                  </div>

                  {/* Financial figure */}
                  <div className="my-3 p-3 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-100 dark:border-surface-800/80 flex items-center justify-between">
                    <span className="text-xs text-surface-500">Amount</span>
                    <span className="text-base font-extrabold text-surface-900 dark:text-surface-100">
                      {inv.currency} ${inv.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Parties */}
                  <div className="space-y-1.5 text-xs text-surface-600 dark:text-surface-300">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Issuer:</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200 truncate max-w-[160px]">
                        {inv.issuer?.name || 'Issuer'} {isIssuer && '(You)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Client:</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200 truncate max-w-[160px]">
                        {inv.client?.name || 'Client'} {!isIssuer && '(You)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Due Date:</span>
                      <span className="font-medium text-surface-800 dark:text-surface-200">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInvoice(inv)}
                    className="text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Details
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {/* Issuer actions */}
                    {isIssuer && inv.status === 'draft' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(inv._id, 'sent')}
                        disabled={actionLoadingId === inv._id}
                        className="text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Send
                      </Button>
                    )}

                    {isIssuer && (inv.status === 'sent' || inv.status === 'overdue') && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleStatusChange(inv._id, 'paid')}
                        disabled={actionLoadingId === inv._id}
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-surface-500 px-3">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Create New Invoice
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Collaboration / Campaign *
                </label>
                {loadingCollabs ? (
                  <p className="text-xs text-surface-400">Loading collaborations...</p>
                ) : collabs.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No active accepted collaborations found. You must have an accepted collaboration to issue an invoice.
                  </p>
                ) : (
                  <Select
                    value={formData.collaborationId}
                    onChange={(e) =>
                      setFormData({ ...formData, collaborationId: e.target.value })
                    }
                    options={collabs.map((c) => ({
                      value: c._id,
                      label: `${(c.campaign as any)?.title || 'Campaign'} - ${
                        c.recipient?._id === user?._id ? c.sender?.name : c.recipient?.name
                      }`,
                    }))}
                    className="w-full text-xs"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="1200"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Currency *
                  </label>
                  <Select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                      { value: 'CAD', label: 'CAD ($)' },
                    ]}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Description / Deliverable *
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. YouTube Dedicated Video & 3 Instagram Reels"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Payment Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Provide payment details (e.g. Bank wire instructions, PayPal ID, payment reference)"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl p-3 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="p-3 bg-surface-50 dark:bg-surface-950 rounded-xl text-[11px] text-surface-500">
                Notice: Invoices are created as <strong>Draft</strong>. You can review and click &quot;Send&quot; whenever you are ready.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || collabs.length === 0}
                >
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-surface-400">
                  {selectedInvoice.invoiceNumber}
                </span>
                <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
                  Invoice Breakdown
                </h2>
              </div>
              <Badge variant={STATUS_VARIANTS[selectedInvoice.status]}>
                {STATUS_LABELS[selectedInvoice.status]}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-surface-50 dark:bg-surface-950 rounded-xl flex items-center justify-between">
                <span className="text-surface-500">Total Tracked Amount</span>
                <span className="text-lg font-black text-surface-900 dark:text-surface-100">
                  {selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-surface-100 dark:border-surface-800">
                <div>
                  <span className="text-surface-400 text-[11px] block">Issuer (Payee)</span>
                  <span className="font-bold text-surface-800 dark:text-surface-200">
                    {selectedInvoice.issuer?.name}
                  </span>
                  <span className="text-[10px] text-surface-400 block truncate">
                    {selectedInvoice.issuer?.email}
                  </span>
                </div>
                <div>
                  <span className="text-surface-400 text-[11px] block">Client (Payer)</span>
                  <span className="font-bold text-surface-800 dark:text-surface-200">
                    {selectedInvoice.client?.name}
                  </span>
                  <span className="text-[10px] text-surface-400 block truncate">
                    {selectedInvoice.client?.email}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-surface-400 text-[11px] block mb-0.5">Description</span>
                <p className="text-surface-800 dark:text-surface-200 bg-surface-50 dark:bg-surface-950 p-2.5 rounded-xl border border-surface-100 dark:border-surface-800">
                  {selectedInvoice.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-surface-400 block">Due Date:</span>
                  <span className="font-semibold text-surface-700 dark:text-surface-300">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedInvoice.paidAt && (
                  <div>
                    <span className="text-surface-400 block">Paid At:</span>
                    <span className="font-semibold text-accent-600 dark:text-accent-400">
                      {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedInvoice.notes && (
                <div>
                  <span className="text-surface-400 text-[11px] block mb-0.5">Payment Instructions</span>
                  <p className="text-surface-700 dark:text-surface-300 whitespace-pre-wrap bg-surface-50 dark:bg-surface-950 p-2.5 rounded-xl border border-surface-100 dark:border-surface-800">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                Tracking only; no payments are processed here.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                {selectedInvoice.issuer?._id === user?._id && selectedInvoice.status === 'draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedInvoice._id, 'sent')}
                    disabled={actionLoadingId === selectedInvoice._id}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send to Brand
                  </Button>
                )}

                {selectedInvoice.issuer?._id === user?._id &&
                  (selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleStatusChange(selectedInvoice._id, 'paid')}
                      disabled={actionLoadingId === selectedInvoice._id}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark as Paid
                    </Button>
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
