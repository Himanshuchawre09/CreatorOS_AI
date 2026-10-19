import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Sparkles,
  DollarSign,
  Clock,
  Plus,
  FileCheck2,
  Users,
  CheckSquare,
  Eye,
  Megaphone,
  ArrowRight,
  Loader2,
  Check,
  X,
  UserPlus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Talent Manager Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Incoming Talent Links for Creators
  const [talentLinks, setTalentLinks] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTalentLinks = async () => {
    try {
      const res = await api.getTalentLinks();
      if (res.data) {
        setTalentLinks(res.data);
      }
    } catch {
      // Ignored for roles without link access
    }
  };

  useEffect(() => {
    fetchStats();
    if (user?.role === 'creator' || user?.role === 'talentManager') {
      fetchTalentLinks();
    }
  }, [user?.role]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Creator email is required');
      return;
    }

    setSubmittingInvite(true);
    try {
      await api.inviteCreatorToRoster({
        creatorEmail: inviteEmail.trim(),
        notes: inviteNotes.trim() || undefined,
      });
      toast.success(`Representation invite sent to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteNotes('');
      fetchStats();
      fetchTalentLinks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invite');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRespondLink = async (id: string, action: 'accept' | 'decline') => {
    try {
      await api.respondToTalentLink(id, action);
      toast.success(`Representation invite ${action}ed.`);
      fetchTalentLinks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} invite`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading verified workspace data...</p>
      </div>
    );
  }

  const role = user?.role || 'creator';
  const kpis = stats?.kpis || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name || 'Partner'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Role: <span className="capitalize font-medium text-foreground">{role}</span> • Live workspace overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {role === 'brand' && (
            <Link to="/campaigns/new">
              <Button size="sm" variant="primary">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Campaign
              </Button>
            </Link>
          )}

          {role === 'talentManager' && (
            <Button size="sm" variant="primary" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              Invite Creator to Roster
            </Button>
          )}

          <Link to="/ai-assistant">
            <Button size="sm" variant="outline">
              <Sparkles className="w-4 h-4 mr-1.5 text-primary" />
              AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Incoming Representation Invites for Creators */}
      {role === 'creator' && talentLinks.some((l) => l.status === 'pending') && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Agency Representation Inquiries</h3>
          </div>
          <div className="space-y-2">
            {talentLinks
              .filter((l) => l.status === 'pending')
              .map((link) => (
                <div
                  key={link._id}
                  className="bg-card border border-border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {link.talentManager?.name}{' '}
                      {link.talentManager?.orgName && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({link.talentManager.orgName})
                        </span>
                      )}
                    </h4>
                    {link.notes && <p className="text-xs text-muted-foreground mt-0.5">"{link.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleRespondLink(link._id, 'accept')}
                    >
                      <Check className="w-4 h-4 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespondLink(link._id, 'decline')}
                    >
                      <X className="w-4 h-4 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Role-Specific KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'brand' && (
          <>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Campaigns
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.totalCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kpis.activeCampaigns || 0} active / open
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.pendingRequests || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Awaiting creator or brand action</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Contracts
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.activeContracts || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Legally signed agreements</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Submissions to Review
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {kpis.pendingSubmissionsCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Deliverables pending approval</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'creator' && (
          <>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Collaborations
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.activeContracts || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kpis.acceptedCollabs || 0} accepted requests
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.pendingRequests || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Inbox inquiries</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Deliverables
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.activeTasks || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kpis.pendingSubmissions || 0} revisions requested
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contracted Value
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ${(kpis.totalEarningsTracked || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tracking only (no escrow)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'talentManager' && (
          <>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Managed Roster
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.rosterCount || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Linked creator partners</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pending Invites
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.pendingInvites || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Awaiting creator consent</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Roster Active Deals
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {kpis.activeRosterContracts || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Signed client campaigns</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Agency Actions
                  </p>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2"
                  >
                    <Plus className="w-4 h-4" /> Expand Roster
                  </button>
                  <p className="text-xs text-muted-foreground mt-0.5">Consent-based invite link</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {(role === 'freelancer' || role === 'admin') && (
          <>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Tasks
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpis.activeTasks || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">In Todo, Doing, Review</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Completed Deliverables
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {kpis.completedTasks || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Finished work items</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Contracts
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {kpis.activeContracts || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Involved collaborations</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Workspace
                  </p>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2"
                  >
                    Go to Kanban Board <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Collaborative tasks</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Talent Manager Roster Section */}
      {role === 'talentManager' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Managed Creator Roster</CardTitle>
                <CardDescription>
                  Creators represented by your agency with verified mutual consent.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-1.5" />
                Invite Creator
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.roster && stats.roster.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.roster.map((item: any) => (
                  <div
                    key={item._id}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center overflow-hidden">
                        {item.creator?.avatarUrl ? (
                          <img
                            src={item.creator.avatarUrl}
                            alt={item.creator.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.creator?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.creator?.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{item.creator?.email}</p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground space-y-2">
                <Users className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">No creators linked to your roster yet.</p>
                <p className="text-xs">
                  Click "Invite Creator to Roster" to send a consent-based invitation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Contracts / Deals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Agreements & Partnerships</CardTitle>
              <CardDescription>
                Verified collaboration contracts recorded in your workspace.
              </CardDescription>
            </div>
            <Link to="/contracts" className="text-xs font-medium text-primary hover:underline">
              View all contracts &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentContracts && stats.recentContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Contract Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentContracts.map((contract: any) => {
                  const partner = role === 'brand' ? contract.creator : contract.brand;
                  return (
                    <TableRow key={contract._id}>
                      <TableCell className="font-medium text-foreground">
                        {partner?.name || 'Partner'}
                      </TableCell>
                      <TableCell>{contract.campaign?.title || 'Direct Partnership'}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ${contract.budget?.toLocaleString() || '0'} USD
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            contract.status === 'signed'
                              ? 'success'
                              : contract.status === 'declined'
                              ? 'neutral'
                              : 'warning'
                          }
                        >
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/contracts/${contract._id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Contract
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 space-y-2">
              <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">No contracts initiated yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {role === 'brand'
                  ? 'Create a campaign or send collaboration requests to creators in Discover.'
                  : 'Browse open campaigns or check your collaboration requests inbox to get started.'}
              </p>
              <div className="pt-2">
                <Link to={role === 'brand' ? '/campaigns/new' : '/discover'}>
                  <Button size="sm" variant="primary">
                    {role === 'brand' ? 'Launch Campaign' : 'Discover Opportunities'}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal for Talent Managers */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Creator to Agency Roster"
        description="Send a formal representation invitation. The creator must explicitly accept to link their profile."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-xs font-medium text-foreground mb-1.5">
              Creator Email Address
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="creator@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="invite-notes" className="block text-xs font-medium text-foreground mb-1.5">
              Representation Terms / Personal Note (Optional)
            </label>
            <Textarea
              id="invite-notes"
              rows={3}
              placeholder="e.g. We would love to represent you for upcoming brand deals and negotiate sponsorship rates on your behalf."
              value={inviteNotes}
              onChange={(e) => setInviteNotes(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={submittingInvite}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submittingInvite}>
              {submittingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Sending Invite...
                </>
              ) : (
                'Send Representation Invite'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
