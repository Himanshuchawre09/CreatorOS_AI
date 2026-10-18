import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Globe,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Users,
} from 'lucide-react';
import { api, BrandProfileData } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const BrandDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBrand = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getBrandById(id);
        if (!isMounted) return;
        setBrand((res as any).brand || res.data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Brand profile not found or is currently private.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchBrand();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-surface-500">Loading brand profile...</span>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
          Brand Unavailable
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          {error || 'This brand profile is either private or does not exist.'}
        </p>
        <Link to="/discover">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Discovery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Discover</span>
      </Link>

      {/* Brand Hero */}
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-700 dark:text-surface-200 text-xl font-bold flex-shrink-0">
            <Building className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">
                {brand.companyName}
              </h1>
              <Badge variant="neutral" size="sm" className="text-xs">
                {brand.industry}
              </Badge>
            </div>

            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mb-2"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{brand.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {brand.about && (
              <p className="text-xs text-surface-600 dark:text-surface-300 max-w-xl leading-relaxed mt-1">
                {brand.about}
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Disabled "Send collaboration request" (Coming soon) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800 flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            disabled
            className="opacity-75 cursor-not-allowed"
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            <span>Send collaboration request</span>
            <span className="ml-1 text-[10px] uppercase tracking-wider py-0.5 px-1.5 rounded bg-black/20 text-white font-bold">
              Coming soon
            </span>
          </Button>
        </div>
      </div>

      {/* Target Audience & Partnership Focus */}
      {brand.targetAudience && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50/60 dark:bg-surface-900/40 border border-surface-100 dark:border-surface-800 text-xs text-surface-700 dark:text-surface-300 leading-relaxed">
              <Users className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <span>{brand.targetAudience}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

