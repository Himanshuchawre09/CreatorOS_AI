import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, User } from '../services/api';
import {
  ShieldAlert,
  Users,
  Search,
  Loader2,
  FileCheck2,
  Megaphone,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [platformStats, setPlatformStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.getAdminPlatformStats();
      if (res.data) {
        setPlatformStats(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load platform stats');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAdminUsers({
        q: searchQuery.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });

      if (res.data) {
        setUsers(res.data);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || res.pagination.pages || 1);
        setTotalUsers(res.pagination.total);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user: User) => {
    const userId = user._id || user.id;
    if (!userId) return;

    if (userId === (currentUser?._id || currentUser?.id)) {
      toast.error('Cannot suspend your own admin account');
      return;
    }

    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setActionLoadingId(userId);
    try {
      await api.updateAdminUserStatus(userId, nextStatus);
      toast.success(`User ${user.name} set to ${nextStatus}.`);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Admin Console
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                Staff Only
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Platform administration, account security, and user moderation controls.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            fetchStats();
            fetchUsers();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh Stats
        </Button>
      </div>

      {/* Platform Aggregates KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Platform Users
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {platformStats?.users?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platformStats?.users?.active || 0} active • {platformStats?.users?.suspended || 0} suspended
              </p>
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
                Campaigns
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {platformStats?.campaigns?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platformStats?.campaigns?.open || 0} open • {platformStats?.campaigns?.inProgress || 0} active
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contracts Recorded
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {platformStats?.contracts?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platformStats?.contracts?.signed || 0} signed & executed
              </p>
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
                Deliverables Submitted
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {platformStats?.submissions?.total || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platformStats?.submissions?.pendingReview || 0} pending review
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown Pills */}
      {platformStats?.users?.byRole && (
        <div className="flex flex-wrap items-center gap-2 bg-card p-3 rounded-xl border border-border text-xs">
          <span className="font-semibold text-foreground uppercase tracking-wider mr-1">
            Accounts by Role:
          </span>
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            Creators: {platformStats.users.byRole.creator || 0}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            Brands: {platformStats.users.byRole.brand || 0}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            Freelancers: {platformStats.users.byRole.freelancer || 0}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            Talent Managers: {platformStats.users.byRole.talentManager || 0}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            Admins: {platformStats.users.byRole.admin || 0}
          </span>
        </div>
      )}

      {/* Users Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">User Directory & Security Moderation</CardTitle>
              <CardDescription>
                Search registered accounts, inspect roles, and suspend/reactivate access.
              </CardDescription>
            </div>

            {/* Filters Form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-60"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Roles</option>
                <option value="creator">Creator</option>
                <option value="brand">Brand</option>
                <option value="freelancer">Freelancer</option>
                <option value="talentManager">Talent Manager</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <Button type="submit" size="sm" variant="outline">
                Filter
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading accounts...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const userId = u._id || u.id || '';
                    const isSelf = userId === (currentUser?._id || currentUser?.id);
                    const isSuspended = u.status === 'suspended';

                    return (
                      <TableRow key={userId}>
                        <TableCell className="font-semibold text-foreground">
                          {u.name}
                          {u.orgName && (
                            <span className="block text-xs font-normal text-muted-foreground">
                              {u.orgName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isSuspended ? 'danger' : 'success'}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground italic">Current Admin</span>
                          ) : (
                            <Button
                              size="sm"
                              variant={isSuspended ? 'outline' : 'danger'}
                              disabled={actionLoadingId === userId}
                              onClick={() => handleToggleStatus(u)}
                            >
                              {actionLoadingId === userId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isSuspended ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 mr-1" />
                                  Suspend
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>
                  Showing {users.length} of {totalUsers} total accounts
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Users className="w-8 h-8 mx-auto" />
              <p className="text-sm font-medium">No users match your filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
