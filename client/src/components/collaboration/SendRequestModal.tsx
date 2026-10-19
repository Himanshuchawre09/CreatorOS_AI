import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { api, CampaignData } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

interface SendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: { _id: string; name: string; role?: string } | null;
  targetCampaign?: CampaignData | null;
  onSuccess?: () => void;
}

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  targetCampaign,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const isBrand = user?.role === 'brand';

  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [pitch, setPitch] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPitch('');
      setProposedRate('');
      setError(null);
      return;
    }

    if (targetCampaign) {
      setSelectedCampaignId(targetCampaign._id);
      if (targetCampaign.budget) {
        setProposedRate(String(targetCampaign.budget));
      }
    } else if (isBrand) {
      // Load brand's campaigns
      const loadBrandCampaigns = async () => {
        try {
          setLoadingCampaigns(true);
          const res = await api.getCampaigns({ limit: 24 });
          const items = res.data || [];
          setCampaigns(items);
          if (items.length > 0) {
            setSelectedCampaignId(items[0]._id);
            if (items[0].budget) {
              setProposedRate(String(items[0].budget));
            }
          }
        } catch (err: any) {
          setError('Failed to load campaigns list');
        } finally {
          setLoadingCampaigns(false);
        }
      };
      loadBrandCampaigns();
    }
  }, [isOpen, isBrand, targetCampaign]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const campaignId = targetCampaign?._id || selectedCampaignId;
    if (!campaignId) {
      setError('Please select or specify a campaign for this request');
      return;
    }

    const recipientId = isBrand
      ? targetUser?._id
      : targetCampaign?.brand?._id || (targetCampaign?.brand as any);

    if (!recipientId) {
      setError('Recipient could not be identified');
      return;
    }

    const numRate = proposedRate ? Number(proposedRate) : undefined;
    if (numRate !== undefined && (isNaN(numRate) || numRate < 0)) {
      setError('Proposed rate must be 0 or more');
      return;
    }

    try {
      setSubmitting(true);
      await api.createRequest({
        campaignId,
        recipientId,
        pitch: pitch.trim() || undefined,
        proposedRate: numRate,
      });

      toast.success('Collaboration request sent successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send collaboration request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
          <div>
            <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
              {isBrand ? 'Send Collaboration Request' : 'Apply to Campaign'}
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              {isBrand && targetUser
                ? `Invite ${targetUser.name} to collaborate on a campaign`
                : targetCampaign
                ? `Submit your collaboration pitch for "${targetCampaign.title}"`
                : 'Propose a campaign collaboration'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campaign Selection for Brand */}
          {isBrand && !targetCampaign && (
            <div>
              {loadingCampaigns ? (
                <div className="text-xs text-surface-400 py-2">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
                  You have not created any campaigns yet. Please create a campaign first before inviting creators.
                </div>
              ) : (
                <Select
                  label="Select Campaign"
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                    const selected = campaigns.find((c) => c._id === e.target.value);
                    if (selected && selected.budget) {
                      setProposedRate(String(selected.budget));
                    }
                  }}
                  options={campaigns.map((c) => ({
                    label: `${c.title} (${c.status.toUpperCase()} - $${c.budget.toLocaleString()})`,
                    value: c._id,
                  }))}
                  required
                />
              )}
            </div>
          )}

          {/* Fixed Campaign Title for Creator applying */}
          {targetCampaign && (
            <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-surface-400 block">
                Target Campaign
              </span>
              <span className="font-bold text-surface-900 dark:text-surface-100">
                {targetCampaign.title}
              </span>
              <span className="text-surface-500 block mt-0.5">
                Budget: ${targetCampaign.budget.toLocaleString()} {targetCampaign.currency}
              </span>
            </div>
          )}

          {/* Pitch / Message */}
          <Textarea
            label="Collaboration Pitch / Note"
            placeholder={
              isBrand
                ? 'Introduce the partnership opportunity, key deliverables, and why you selected this creator...'
                : 'Explain your content vision, audience demographic match, and past relevant portfolio highlights...'
            }
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            maxLength={1000}
            rows={4}
          />

          {/* Proposed Rate */}
          <Input
            label="Proposed Rate ($ USD)"
            type="number"
            min="0"
            placeholder="e.g. 1500"
            value={proposedRate}
            onChange={(e) => setProposedRate(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              disabled={isBrand && !targetCampaign && campaigns.length === 0}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
