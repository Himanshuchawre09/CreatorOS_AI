import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Eye,
  Users,
  MousePointerClick,
  Activity,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  UserAnalyticsSummary,
  CollaborationRequestData,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Record metrics modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collabs, setCollabs] = useState<CollaborationRequestData[]>([]);

  const [formData, setFormData] = useState({
    collaborationId: '',
    views: '',
    reach: '',
    clicks: '',
    engagement: '',
    notes: '',
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getUserAnalytics();
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchAcceptedCollabs = async () => {
    try {
      const res = await api.getRequests({ status: 'accepted' });
      if (res.success && res.data) {
        const list = res.data as CollaborationRequestData[];
        setCollabs(list);
        if (list.length > 0 && !formData.collaborationId) {
          setFormData((prev) => ({ ...prev, collaborationId: list[0]._id }));
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenModal = () => {
    fetchAcceptedCollabs();
    setIsModalOpen(true);
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collaborationId) {
      toast.error('Please select a collaboration');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.upsertCollaborationAnalytics({
        collaborationId: formData.collaborationId,
        views: parseInt(formData.views, 10) || 0,
        reach: parseInt(formData.reach, 10) || 0,
        clicks: parseInt(formData.clicks, 10) || 0,
        engagement: parseInt(formData.engagement, 10) || 0,
        notes: formData.notes.trim() || undefined,
      });

      if (res.success) {
        toast.success('Campaign metrics saved successfully');
        setIsModalOpen(false);
        setFormData({
          collaborationId: '',
          views: '',
          reach: '',
          clicks: '',
          engagement: '',
          notes: '',
        });
        fetchAnalytics();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save metrics');
    } finally {
      setSubmitting(false);
    }
  };

  const summary = analyticsData?.summary || {
    totalViews: 0,
    totalReach: 0,
    totalClicks: 0,
    totalEngagement: 0,
  };

  const records = analyticsData?.records || [];
  const hasData = records.length > 0;

  // Chart data formatting
  const chartData = records.map((r: any) => ({
    name:
      r.collaborationRequest?.campaign?.title?.substring(0, 15) || 'Collaboration',
    Views: r.views || 0,
    Reach: r.reach || 0,
    Clicks: r.clicks || 0,
    Engagement: r.engagement || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Campaign Analytics
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            Track performance outcomes across deliverables and brand partnerships.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Record Metrics
          </Button>
        </div>
      </div>

      {/* Self-reported metrics disclaimer */}
      <div className="p-4 bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-2xl flex items-start gap-3.5">
        <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs text-surface-700 dark:text-surface-300 space-y-1">
          <p className="font-bold text-surface-900 dark:text-surface-100">
            Self-Reported Campaign Metrics
          </p>
          <p className="leading-relaxed">
            All reach, view, click, and engagement figures shown below are entered by collaboration participants.
            Charts and totals are computed strictly from stored metrics and never fabricated or simulated.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Total Views</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-100">
            {summary.totalViews.toLocaleString()}
          </div>
          <span className="text-[10px] text-surface-400 block">Self-reported views</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Total Reach</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-100">
            {summary.totalReach.toLocaleString()}
          </div>
          <span className="text-[10px] text-surface-400 block">Total audience reached</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Total Clicks</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-100">
            {summary.totalClicks.toLocaleString()}
          </div>
          <span className="text-[10px] text-surface-400 block">Tracked referral clicks</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500">Engagements</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-surface-900 dark:text-surface-100">
            {summary.totalEngagement.toLocaleString()}
          </div>
          <span className="text-[10px] text-surface-400 block">Likes, comments & shares</span>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
          Campaign Performance Breakdown
        </h3>

        {!hasData ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <BarChart3 className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
              No campaign analytics recorded yet
            </p>
            <p className="text-[11px] text-surface-400 mt-1 mb-4">
              Click &quot;Record Metrics&quot; to enter self-reported impressions and engagement for your collaborations.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenModal}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Record First Metrics
            </Button>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    borderColor: '#e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reach" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Record Metrics Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Record Campaign Metrics
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-surface-400 hover:text-surface-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Collaboration / Campaign *
                </label>
                {collabs.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No accepted collaborations found. You must be part of an accepted collaboration to record metrics.
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Views
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25000"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Reach
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="18000"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Clicks
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="450"
                    value={formData.clicks}
                    onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Engagements (Likes/Comments)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1200"
                    value={formData.engagement}
                    onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Notes about algorithm spikes, best performing timestamps..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl p-3 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting || collabs.length === 0}>
                  {submitting ? 'Saving...' : 'Save Metrics'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
