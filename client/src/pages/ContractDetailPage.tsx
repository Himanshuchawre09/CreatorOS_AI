import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Building,
  User,
  ShieldCheck,
  AlertCircle,
  Edit2,
  Save,
  Send,
  PenTool,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  ContractData,
  ContractStatus,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const STATUS_VARIANTS: Record<
  ContractStatus,
  'default' | 'success' | 'warning' | 'danger' | 'accent'
> = {
  draft: 'default',
  sent: 'warning',
  signed: 'success',
  declined: 'danger',
};

export const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Draft editing state
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notesContent, setNotesContent] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

  // Action states
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [isDeclining, setIsDeclining] = useState<boolean>(false);

  const fetchContract = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getContractById(id);
      if (res.success && res.data) {
        setContract(res.data);
        setNotesContent(res.data.notes || '');
      } else {
        setError(res.message || 'Failed to load contract');
      }
    } catch {
      setError('An error occurred while loading contract');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      setIsSavingNotes(true);
      const res = await api.updateContract(id, { notes: notesContent });
      if (res.success && res.data) {
        setContract(res.data);
        setIsEditingNotes(false);
        toast.success('Agreement notes updated successfully', 'Notes updated');
      } else {
        toast.error(res.message || 'Failed to update contract notes', 'Update failed');
      }
    } catch {
      toast.error('Failed to save changes', 'Error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSendContract = async () => {
    if (!id) return;
    try {
      setIsSending(true);
      const res = await api.sendContract(id);
      if (res.success && res.data) {
        setContract(res.data);
        toast.success('Contract is now open for review and signatures', 'Contract sent');
      } else {
        toast.error(res.message || 'Failed to send contract', 'Send failed');
      }
    } catch {
      toast.error('Failed to send contract', 'Error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSignContract = async () => {
    if (!id) return;
    try {
      setIsSigning(true);
      const res = await api.signContract(id);
      if (res.success && res.data) {
        setContract(res.data);
        toast.success(
          res.data.status === 'signed'
            ? 'Both parties have signed. This agreement is now active.'
            : 'Your signature has been recorded. Awaiting counter-party.',
          res.data.status === 'signed' ? 'Agreement Active!' : 'Signature Recorded'
        );
      } else {
        toast.error(res.message || 'Failed to sign contract', 'Signing failed');
      }
    } catch {
      toast.error('Failed to sign contract', 'Error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDeclineContract = async () => {
    if (!id) return;
    try {
      setIsDeclining(true);
      const res = await api.declineContract(id, declineReason);
      if (res.success && res.data) {
        setContract(res.data);
        setShowDeclineModal(false);
        toast.info('The contract has been marked as declined', 'Contract declined');
      } else {
        toast.error(res.message || 'Failed to decline contract', 'Action failed');
      }
    } catch {
      toast.error('Failed to decline contract', 'Error');
    } finally {
      setIsDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        <div className="h-60 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold mb-2">Contract Unavailable</h2>
        <p className="text-sm text-neutral-500 mb-4">{error || 'Contract could not be loaded.'}</p>
        <Button onClick={() => navigate('/contracts')} variant="outline">
          Back to Contracts
        </Button>
      </div>
    );
  }

  const isUserBrand =
    typeof contract.brand === 'object' && contract.brand._id === user?._id;
  const isUserCreator =
    typeof contract.creator === 'object' && contract.creator._id === user?._id;
  const hasUserSigned = isUserBrand
    ? !!contract.brandSignedAt
    : isUserCreator
    ? !!contract.creatorSignedAt
    : false;

  const canSign =
    (isUserBrand || isUserCreator) &&
    !hasUserSigned &&
    contract.status !== 'declined' &&
    contract.status !== 'signed';

  const canSend =
    (isUserBrand || isUserCreator) && contract.status === 'draft';

  const canDecline =
    (isUserBrand || isUserCreator) &&
    contract.status !== 'signed' &&
    contract.status !== 'declined';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top navigation */}
      <div>
        <Link
          to="/contracts"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Contracts
        </Link>

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {contract.campaign?.title || 'Collaboration Agreement'}
              </h1>
              <Badge variant={STATUS_VARIANTS[contract.status]}>
                {contract.status === 'signed'
                  ? 'Signed (Active)'
                  : contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Created on {new Date(contract.createdAt).toLocaleDateString()} • Ref #{contract._id.slice(-8)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canSend && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendContract}
                isLoading={isSending}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Send for Review
              </Button>
            )}

            {canSign && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSignContract}
                isLoading={isSigning}
              >
                <PenTool className="w-4 h-4 mr-1.5" />
                Sign Contract
              </Button>
            )}

            {canDecline && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => setShowDeclineModal(true)}
              >
                Decline
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Parties and Financials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand Party */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Brand Party
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {contract.brand?.orgName || contract.brand?.name}
            </p>
            {contract.brand?.orgName && contract.brand?.name && (
              <p className="text-xs text-neutral-500 mt-0.5">{contract.brand.name}</p>
            )}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className="text-neutral-400">Status: </span>
              {contract.brandSignedAt ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Signed on {new Date(contract.brandSignedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-amber-500 font-medium">Pending signature</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Creator Party */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Creator Party
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {contract.creator?.name}
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className="text-neutral-400">Status: </span>
              {contract.creatorSignedAt ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Signed on {new Date(contract.creatorSignedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-amber-500 font-medium">Pending signature</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Terms */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Financials & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-neutral-400">Agreed Compensation</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {contract.currency} {contract.budget.toLocaleString()}
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">Completion Deadline</p>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-neutral-400" />
                {new Date(contract.deadline).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Deliverables & Scope</CardTitle>
        </CardHeader>
        <CardContent>
          {contract.deliverables && contract.deliverables.length > 0 ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {contract.deliverables.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {item.type}
                    </p>
                    {item.details && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {item.details}
                      </p>
                    )}
                  </div>
                  <Badge variant="neutral">Qty: {item.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">No deliverables specified.</p>
          )}
        </CardContent>
      </Card>

      {/* Terms & Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Terms & Notes</CardTitle>
          {contract.status === 'draft' && !isEditingNotes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingNotes(true)}
              className="text-xs"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit Notes
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                rows={4}
                placeholder="Specify any additional clauses, deliverable specs, or payment terms..."
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingNotes(false);
                    setNotesContent(contract.notes || '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  isLoading={isSavingNotes}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Notes
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {contract.notes || 'Standard collaboration agreement based on campaign brief.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Execution Signatures Card */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-brand-500" />
            Execution & Counter-signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand box */}
            <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase">
                  Brand Signature
                </span>
                {contract.brandSignedAt ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {contract.brand?.orgName || contract.brand?.name}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {contract.brandSignedAt
                  ? `Signed on ${new Date(contract.brandSignedAt).toLocaleString()}`
                  : 'Awaiting signature'}
              </p>
            </div>

            {/* Creator box */}
            <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase">
                  Creator Signature
                </span>
                {contract.creatorSignedAt ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {contract.creator?.name}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {contract.creatorSignedAt
                  ? `Signed on ${new Date(contract.creatorSignedAt).toLocaleString()}`
                  : 'Awaiting signature'}
              </p>
            </div>
          </div>

          {/* User action prompt */}
          {canSign && (
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
              <p className="text-xs text-neutral-500">
                You are a party to this agreement and have not yet signed.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSignContract}
                isLoading={isSigning}
              >
                <PenTool className="w-4 h-4 mr-1.5" />
                Click to Accept & Sign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Decline Contract
            </h3>
            <p className="text-xs text-neutral-500">
              Declining will mark this agreement record as declined. You may provide a reason below.
            </p>
            <Textarea
              placeholder="Reason for declining (optional)..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeclineModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeclineContract}
                isLoading={isDeclining}
              >
                Confirm Decline
              </Button>
            </div>
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
