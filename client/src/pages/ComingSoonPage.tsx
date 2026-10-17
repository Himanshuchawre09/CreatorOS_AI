import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const ComingSoonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const featureName = searchParams.get('feature') || 'Module';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <Card className="p-8 sm:p-12 shadow-card">
        <CardContent className="p-0 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm border border-brand-100 dark:border-brand-900/60">
            <Clock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 mb-3">
            <Badge variant="neutral" size="sm">
              Roadmap Feature
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
            {featureName} is coming soon
          </h1>

          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 max-w-md leading-relaxed">
            The {featureName} module is currently being finalized for upcoming releases. Active campaign
            workflows and invoice status tracking are available now on your dashboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" leftIcon={<Sparkles className="w-4 h-4" />}>
                Explore Public Overview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
