import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building,
  Edit2,
  AlertCircle,
  Send,
  Users,
  Target,
} from 'lucide-react';
import { api, CampaignData, CampaignStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SendRequestModal } from '../components/collaboration/SendRequestModal';

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

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getCampaignById(id);
        setCampaign(res.data || null);
      } catch (err: any) {
        setError(err.message || 'Campaign not found or you do not have permission to view it');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const isOwner = Boolean(
    user &&
      campaign &&
      campaign.brand &&
      (campaign.brand._id === user._id || (campaign.brand as any) === user._id)
  );

  const isCreator = user?.role === 'creator' || user?.role === 'freelancer';

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!id || !campaign) return;
    try {
      setTransitioning(true);
      const res = await api.updateCampaign(id, { status: newStatus });
      if (res.data) {
        setCampaign(res.data);
      }
      toast.success(`Campaign status updated to ${STATUS_LABELS[newStatus]}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update campaign status');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-surface-500">Loading campaign details...</span>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
          Campaign Unavailable
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          {error || 'This campaign does not exist or is currently private.'}
        </p>
        <Link to="/campaigns">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(campaign.deadline).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Campaigns</span>
      </Link>

      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANTS[campaign.status]} size="sm">
              {STATUS_LABELS[campaign.status]}
            </Badge>

            {campaign.brand && typeof campaign.brand === 'object' && campaign.brand.name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-surface-600 dark:text-surface-300">
                <Building className="w-3.5 h-3.5 text-surface-400" />
                {campaign.brand.name}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight">
            {campaign.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <strong className="text-surface-900 dark:text-surface-100 font-extrabold">
                ${campaign.budget.toLocaleString()} {campaign.currency}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-surface-400" />
              <span>Target Deadline: {formattedDate}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800 flex-shrink-0">
          {isOwner ? (
            <div className="flex items-center gap-2">
              <Link to={`/campaigns/${campaign._id}/edit`}>
                <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                  Edit Brief
                </Button>
              </Link>

              {campaign.status === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={transitioning}
                  onClick={() => handleStatusChange('open')}
                >
                  Publish to Open
                </Button>
              )}

              {campaign.status === 'open' && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={transitioning}
                  onClick={() => handleStatusChange('inProgress')}
                >
                  Mark In Progress
                </Button>
              )}

              {campaign.status === 'inProgress' && (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={transitioning}
                  onClick={() => handleStatusChange('completed')}
                >
                  Mark Completed
                </Button>
              )}
            </div>
          ) : isCreator && campaign.status === 'open' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsApplyModalOpen(true)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Apply to Campaign
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Brief Card */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Brief & Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
                {campaign.brief}
              </p>
            </CardContent>
          </Card>

          {/* Deliverables Card */}
          <Card>
            <CardHeader>
              <CardTitle>Required Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {campaign.deliverables.map((d, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 flex items-start justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-surface-900 dark:text-surface-100 block">
                        {d.count}x {d.type}
                      </span>
                      {d.details && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                          {d.details}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-bold text-surface-700 dark:text-surface-300">
                      Deliverable #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Target Audience Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>Target Audience</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                {campaign.audience}
              </p>
            </CardContent>
          </Card>

          {/* Goals Card */}
          {campaign.goals && campaign.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-accent-500" />
                  <span>Key Campaign Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.goals.map((g, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-700 dark:text-surface-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brand Profile Overview (if attached) */}
          {campaign.brandProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-surface-500" />
                  <span>About the Brand</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs font-bold text-surface-900 dark:text-surface-100">
                  {campaign.brandProfile.companyName}
                </p>
                <Badge variant="accent" size="sm" className="text-[10px]">
                  {campaign.brandProfile.industry}
                </Badge>
                {campaign.brandProfile.about && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-3 leading-relaxed pt-1">
                    {campaign.brandProfile.about}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Apply Modal for Creator */}
      {campaign && (
        <SendRequestModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          targetCampaign={campaign}
        />
      )}
    </div>
  );
};
