import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  FileText,
  Clock,
  Send,
  Plus,
  Receipt,
  FileCheck2,
} from 'lucide-react';
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
import { useToast } from '../context/ToastContext';

type PartnershipStatus = 'Brief Drafting' | 'In Review' | 'Approved' | 'Invoice Sent' | 'Paid';

interface CampaignItem {
  id: string;
  brand: string;
  deliverable: string;
  budget: string;
  status: PartnershipStatus;
  badgeVariant: 'neutral' | 'warning' | 'brand' | 'accent' | 'success';
  dueDate: string;
}

export const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('partnerships');

  // Form state for Demo Modal
  const [campaignTitle, setCampaignTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [scopeType, setScopeType] = useState('video');
  const [briefSummary, setBriefSummary] = useState('');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    toast.success(
      `Campaign brief "${campaignTitle || 'New Campaign'}" initialized in workspace.`,
      'Campaign Created'
    );
    setCampaignTitle('');
    setBudget('');
    setBriefSummary('');
  };

  const partnerships: CampaignItem[] = [
    {
      id: 'CMP-1042',
      brand: 'Nordic Audio Systems',
      deliverable: 'YouTube 60s Integration + X Post',
      budget: '$3,200.00',
      status: 'In Review',
      badgeVariant: 'warning',
      dueDate: 'Oct 24, 2026',
    },
    {
      id: 'CMP-1039',
      brand: 'Prism Keyboards',
      deliverable: 'TikTok 30s Desk Setup Reel',
      budget: '$1,800.00',
      status: 'Invoice Sent',
      badgeVariant: 'brand',
      dueDate: 'Oct 28, 2026',
    },
    {
      id: 'CMP-1031',
      brand: 'Apex Cloud Hosting',
      deliverable: 'Dedicated Sponsored Video (10m)',
      budget: '$5,500.00',
      status: 'Paid',
      badgeVariant: 'success',
      dueDate: 'Oct 15, 2026',
    },
    {
      id: 'CMP-1027',
      brand: 'Flow Productivity App',
      deliverable: 'Newsletter Sponsor Placement',
      budget: '$950.00',
      status: 'Brief Drafting',
      badgeVariant: 'neutral',
      dueDate: 'Nov 02, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50">
              Workspace Dashboard
            </h1>
            <Badge variant="neutral" size="sm" className="bg-surface-200/80 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
              Sample data
            </Badge>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Manage campaign deliverables, collaboration requests, and invoice tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <span>Invoices Outstanding</span>
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
              $1,800.00
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" /> 1 invoice pending client settlement
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
              <span>Deliverables Pending</span>
              <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
              2 Assets
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-500 font-medium">
              Next review deadline: 3 days
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-surface-500 text-xs font-semibold">
              <span>Total Contracted</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 mt-2">
              $11,450.00
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Across current active projects
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="partnerships" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabTrigger value="partnerships">Active Partnerships</TabTrigger>
          <TabTrigger value="deliverables">Deliverables & Review</TabTrigger>
        </TabsList>

        {/* Tab 1: Active Partnerships */}
        <TabContent value="partnerships">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campaign Collaboration Roster</CardTitle>
                <CardDescription>
                  Current creator and brand partnership agreements with budget status.
                </CardDescription>
              </div>
              <Badge variant="neutral" size="sm">
                4 Active
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand / Partner</TableHead>
                    <TableHead>Deliverable Scope</TableHead>
                    <TableHead>Budget</TableHead>
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
                      <TableCell className="text-xs font-semibold">{item.budget}</TableCell>
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
                            toast.info(`Viewing details for ${item.brand}`)
                          }
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabContent>

        {/* Tab 2: Deliverables */}
        <TabContent value="deliverables">
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Asset Feedback Hub</CardTitle>
              <CardDescription>
                Submitted drafts, video cuts, and client feedback cycles.
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
                    onClick={() => toast.info('Launching preview modal')}
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
                    Brand approved without revisions. Scheduled for publishing.
                  </p>
                </div>
                <Badge variant="brand" size="sm">
                  Ready for Publishing
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabContent>
      </Tabs>

      {/* New Campaign Brief Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Campaign Brief"
        description="Establish partnership scope, deliverables, and budget tracking."
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateCampaign}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Brief
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <Input
            label="Campaign / Project Name"
            placeholder="e.g. Q4 Wireless Headphone Review"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Agreed Budget ($ USD)"
              placeholder="e.g. 2500"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
            <Select
              label="Collaboration Scope"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value)}
              options={[
                { value: 'video', label: 'YouTube Video Integration' },
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

          <div className="p-3 rounded-xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-xs text-surface-600 dark:text-surface-300 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <span>Invoice payment status is tracked through milestones in the Invoices & Payments module.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
};
