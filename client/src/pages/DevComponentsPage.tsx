import React, { useState } from 'react';
import { RefreshCw, FolderOpen, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

export const DevComponentsPage: React.FC = () => {
  const { toast } = useToast();
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);

  const {
    data: healthResponse,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: api.getHealth,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-surface-900 dark:text-surface-50">
              Developer Diagnostics & Component Playground
            </h1>
            <Badge variant="accent" size="sm">
              Dev Only (import.meta.env.DEV)
            </Badge>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Internal diagnostics, API connectivity inspector, and UI component showcase.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSkeletonDemo((prev) => !prev)}
        >
          {showSkeletonDemo ? 'Show Normal View' : 'Toggle Skeleton Loader States'}
        </Button>
      </div>

      {/* Backend Diagnostics Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <CardTitle>Live Express Backend Diagnostics</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isHealthFetching ? 'animate-spin' : ''}`} />}
              onClick={() => refetchHealth()}
            >
              Ping Server
            </Button>
          </div>
          <CardDescription>
            Direct JSON payload response from `GET /api/health`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isHealthLoading ? (
            <div className="space-y-3">
              <Skeleton height={32} />
              <Skeleton height={120} />
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
                  <span className="text-[11px] font-semibold text-surface-400">Database Connection</span>
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
              <p className="font-semibold">Backend server standby</p>
              <p className="mt-1">
                Run `npm --prefix server run dev` to connect the Express API.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Notification Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notification Triggers</CardTitle>
          <CardDescription>
            Test alert dismissals and types across viewport angles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Campaign task marked completed successfully.')}
            >
              Trigger Success Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.error('File size exceeds 2GB maximum limit.')}
            >
              Trigger Error Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.warning('Contract review target date is tomorrow.')}
            >
              Trigger Warning Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info('AI Assistant has analyzed the brief talking points.')}
            >
              Trigger Info Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Empty State Component Demonstration</CardTitle>
          <CardDescription>
            Standard placeholder component for unpopulated lists and states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<FolderOpen className="w-6 h-6" />}
            title="No Archived Campaigns Found"
            description="Completed collaboration records will appear here once finalized."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.info('Action button clicked in EmptyState')}
              >
                Sample Action
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Skeleton Demo */}
      {showSkeletonDemo && (
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loader Demonstrations</CardTitle>
            <CardDescription>
              Animated loading skeletons for card and tabular content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton height={90} />
              <Skeleton height={90} />
              <Skeleton height={90} />
            </div>
            <div className="space-y-2">
              <Skeleton height={32} />
              <Skeleton height={32} />
              <Skeleton height={32} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
