import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  RefreshCw,
  FolderOpen,
  Server,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabTrigger, TabContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('partnerships');

  // Form state for Demo Modal
  const [campaignTitle, setCampaignTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [roleType, setRoleType] = useState('creator');
  const [briefSummary, setBriefSummary] = useState('');

  // Live Backend Query with TanStack Query
  const {
    data: healthResponse,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: api.getHealth,
  });

  const handleCreateMockCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.success(
      `Campaign brief "${campaignTitle || 'New Partnership'}" created in workspace!`,
      'Milestone Scope Initialized'
    );
    setCampaignTitle('');
    setBudget('');
    setBriefSummary('');
  };

  const partnerships = [
    {
      id: 'CMP-1042',
      brand: 'Nordic Audio Systems',
      avatar: 'NA',
      deliverable: 'YouTube 60s Integration + X Post',
      payout: '$3,200.00',
      status: 'In Review',
      badgeVariant: 'warning' as const,
      dueDate: 'Oct 24, 2026',
    },
    {
      id: 'CMP-1039',
      brand: 'Prism Keyboards',
      avatar: 'PK',
      deliverable: 'TikTok 30s Desk Setup Reel',
      payout: '$1,800.00',
      status: 'Escrow Funded',
      badgeVariant: 'brand' as const,
      dueDate: 'Oct 28, 2026',
    },
    {
      id: 'CMP-1031',
      brand: 'Apex Cloud Hosting',
      avatar: 'AC',
      deliverable: 'Dedicated Sponsored Video (10m)',
      payout: '$5,500.00',
      status: 'Approved & Paid',
      badgeVariant: 'success' as const,
      dueDate: 'Oct 15, 2026',
    },
    {
      id: 'CMP-1027',
      brand: 'Flow Productivity App',
      avatar: 'FP',
      deliverable: 'Newsletter Sponsor Placement',
      payout: '$950.00',
      status: 'Brief Drafting',
      badgeVariant: 'neutral' as const,
      dueDate: 'Nov 02, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">
              Workspace Dashboard
            </h1>
            <Badge variant="brand" size="sm">
              Phase 0 Foundation
            </Badge>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Creator-Brand operations, active campaign milestones, and live API status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkeletonDemo((prev) => !prev)}
          >
            {showSkeletonDemo ? 'Show Real Data' : 'Preview Skeleton States'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            New Campaign Brief
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      {showSkeletonDemo ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton variant="text" width="40%" height={14} className="mb-3" />
              <Skeleton variant="text" width="70%" height={28} className="mb-2" />
              <Skeleton variant="text" width="55%" height={12} />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
                <span>Active Partnerships</span>
                <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
                4 Campaigns
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> 2 briefs awaiting sign-off
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
                <span>Escrow Funded</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
                $5,000.00
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Protected in milestone escrow
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
                <span>Deliverables Pending</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
                2 Assets
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Next deadline: 3 days
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
                <span>API Health</span>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Server className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
                {isHealthLoading ? 'Pinging...' : healthResponse?.data?.status === 'ok' ? 'Online' : 'Degraded'}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-surface-500">
                <span>Uptime: {healthResponse?.data?.uptime ?? 0}s</span>
                <button
                  onClick={() => refetchHealth()}
                  className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isHealthFetching ? 'animate-spin' : ''}`} />
                  Sync
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="partnerships" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabTrigger value="partnerships">Active Partnerships</TabTrigger>
          <TabTrigger value="deliverables">Deliverables & Review</TabTrigger>
          <TabTrigger value="system">Backend Diagnostics</TabTrigger>
          <TabTrigger value="empty">Empty State Demo</TabTrigger>
        </TabsList>

        {/* Tab 1: Active Partnerships */}
        <TabContent value="partnerships">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campaign Collaboration Roster</CardTitle>
                <CardDescription>
                  Current creator and brand partnership agreements underway.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                4 Active
              </Badge>
            </CardHeader>
            <CardContent>
              {showSkeletonDemo ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((s) => (
                    <Skeleton key={s} height={48} />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand / Partner</TableHead>
                      <TableHead>Deliverable Scope</TableHead>
                      <TableHead>Milestone Escrow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerships.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar name={item.brand} size="sm" />
                            <div>
                              <p className="font-bold text-surface-900 dark:text-surface-100 text-xs">
                                {item.brand}
                              </p>
                              <span className="text-[10px] text-surface-400 font-mono">
                                {item.id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.deliverable}</TableCell>
                        <TableCell className="text-xs font-semibold">{item.payout}</TableCell>
                        <TableCell>
                          <Badge variant={item.badgeVariant} size="sm" dot>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-surface-500">{item.dueDate}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toast.info(`Viewing contract details for ${item.brand}`)
                            }
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabContent>

        {/* Tab 2: Deliverables */}
        <TabContent value="deliverables">
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Asset Feedback Hub</CardTitle>
              <CardDescription>
                Submitted video cuts, audio integration drafts, and copy reviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">Revision Requested</Badge>
                    <span className="text-xs font-mono text-surface-400">#DEL-302</span>
                  </div>
                  <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                    Nordic Audio Fall Campaign: 60s YouTube Integration Cut v2
                  </h4>
                  <p className="text-xs text-surface-600 dark:text-surface-400">
                    Brand feedback: &quot;Please highlight the battery life benchmark in the on-screen lower third graphics.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Launching in-browser asset review player')}
                  >
                    View Cut
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => toast.success('Revision v3 submitted to brand reviewer')}
                  >
                    Upload Revision
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">Approved</Badge>
                    <span className="text-xs font-mono text-surface-400">#DEL-298</span>
                  </div>
                  <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                    Prism Keyboards Desk Setup Reel: Final 4K Render
                  </h4>
                  <p className="text-xs text-surface-600 dark:text-surface-400">
                    Brand approved without revisions. Scheduled for release on Oct 28.
                  </p>
                </div>
                <Badge variant="brand" size="sm">
                  Ready for Publishing
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* Tab 3: Backend Diagnostics */}
        <TabContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System & API Diagnostics</CardTitle>
              <CardDescription>
                Live connectivity report from the Node.js Express server (`GET /api/health`).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isHealthLoading ? (
                <div className="space-y-3">
                  <Skeleton height={32} />
                  <Skeleton height={90} />
                </div>
              ) : healthResponse?.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                      <span className="text-[11px] font-semibold text-surface-400">API Status</span>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {healthResponse.data.status.toUpperCase()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                      <span className="text-[11px] font-semibold text-surface-400">Server Uptime</span>
                      <p className="text-base font-bold text-surface-900 dark:text-surface-100 mt-0.5">
                        {healthResponse.data.uptime} seconds
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                      <span className="text-[11px] font-semibold text-surface-400">Database State</span>
                      <p className="text-base font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                        {healthResponse.data.database?.state || 'disconnected'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-900 text-surface-100 font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(healthResponse.data, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold">Server connection standby</p>
                  <p className="mt-1">
                    Start the server with `npm --prefix server run dev` to see real-time health diagnostics.
                  </p>
                </div>
              )}

              {/* Toast component test palette */}
              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                  Interactive Toast Triggers
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success('Milestone funds of $3,200 released to creator wallet.')}
                  >
                    Success Toast
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.error('Deliverable file size exceeds 2GB maximum limit.')}
                  >
                    Error Toast
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.warning('Contract revision deadline expires in 24 hours.')}
                  >
                    Warning Toast
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('AI Contract Review is analyzing PDF terms.')}
                  >
                    Info Toast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabContent>

        {/* Tab 4: Empty State Demo */}
        <TabContent value="empty">
          <Card>
            <CardContent className="p-8">
              <EmptyState
                icon={<FolderOpen className="w-6 h-6" />}
                title="No Archived Campaigns Found"
                description="Completed brand collaborations and historic contract records will be cataloged here once closed."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActiveTab('partnerships');
                      toast.info('Returned to Active Partnerships');
                    }}
                  >
                    Return to Active Roster
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </TabContent>
      </Tabs>

      {/* New Campaign Brief Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Campaign Brief"
        description="Establish partnership milestones, deliverables, and escrow commitments."
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateMockCampaign}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Brief
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateMockCampaign} className="space-y-4">
          <Input
            label="Campaign / Project Name"
            placeholder="e.g. Q4 Wireless Headphone Review"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Agreed Compensation ($ USD)"
              placeholder="e.g. 2500"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
            <Select
              label="Collaboration Scope"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              options={[
                { value: 'creator', label: 'YouTube Video Integration' },
                { value: 'short', label: 'TikTok / Instagram Reels Bundle' },
                { value: 'newsletter', label: 'Dedicated Newsletter Sponsor' },
                { value: 'multi', label: 'Multi-Channel Package' },
              ]}
            />
          </div>

          <Textarea
            label="Key Talking Points & Requirements"
            placeholder="Outline product features to highlight, discount codes, FTC compliance tags, and rough cut delivery target..."
            rows={3}
            value={briefSummary}
            onChange={(e) => setBriefSummary(e.target.value)}
          />

          <div className="p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 text-xs text-brand-800 dark:text-brand-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <span>Escrow milestone will be held securely until deliverable sign-off.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
