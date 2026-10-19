import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Video,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { api, CreatorProfileData, PortfolioItemData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SendRequestModal } from '../components/collaboration/SendRequestModal';

export const CreatorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [creator, setCreator] = useState<CreatorProfileData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCreator = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getCreatorById(id);
        if (!isMounted) return;
        setCreator((res as any).creator || res.data);
        setPortfolio((res as any).portfolio || []);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Creator profile not found or is currently private.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchCreator();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const getPortfolioIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-surface-500">Loading creator profile...</span>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
          Profile Unavailable
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          {error || 'This creator profile is either private or does not exist.'}
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

      {/* Header Profile Hero */}
      <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md shadow-brand-500/20">
            {creator.displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-surface-900 dark:text-surface-100">
                {creator.displayName}
              </h1>
              <Badge variant="accent" size="sm" className="capitalize text-xs">
                {creator.niche}
              </Badge>
            </div>

            {creator.location && (
              <span className="inline-flex items-center gap-1 text-xs text-surface-400 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {creator.location}
              </span>
            )}

            {creator.bio && (
              <p className="text-xs text-surface-600 dark:text-surface-300 max-w-xl leading-relaxed mt-1">
                {creator.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Disabled "Send collaboration request" (Coming soon) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800 flex-shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-surface-400 block">
              Total Audience <span className="text-[9px] font-normal lowercase text-surface-400">(self-reported)</span>
            </span>
            <span className="text-lg font-black text-surface-900 dark:text-surface-50">
              {formatFollowers(creator.totalFollowers)}
            </span>
          </div>

          {user?.role === 'brand' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Send collaboration request
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              disabled
              className="opacity-60 cursor-not-allowed"
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Brand Action
            </Button>
          )}
        </div>
      </div>

      {/* Connected Platforms Breakdown */}
      {creator.platforms && creator.platforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audience & Platform Reach <span className="text-xs font-normal text-surface-400 lowercase">(self-reported)</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {creator.platforms.map((platform, i) => (
                <a
                  key={i}
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 hover:border-surface-300 dark:hover:border-surface-700 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold capitalize text-surface-900 dark:text-surface-100">
                      {platform.platform}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-surface-400 group-hover:text-brand-600 transition-colors" />
                  </div>

                  <span className="text-xs text-surface-500 truncate block mb-1">
                    {platform.handle}
                  </span>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-100 dark:border-surface-800 text-xs">
                    <span className="font-bold text-surface-900 dark:text-surface-100">
                      {formatFollowers(platform.followers)} followers
                    </span>
                    {platform.engagementRate !== undefined && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {platform.engagementRate}% eng.
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables & Collaboration Notes */}
      {(creator.contentTypes?.length || creator.rateNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Formats & Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {creator.contentTypes && creator.contentTypes.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 block mb-2">
                  Preferred Deliverables:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {creator.contentTypes.map((type, i) => (
                    <Badge key={i} variant="neutral" size="sm">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {creator.rateNotes && (
              <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                <span className="font-semibold text-surface-900 dark:text-surface-100 block mb-1">
                  Rate Information:
                </span>
                {creator.rateNotes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Public Portfolio Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Work & Case Studies</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-500">
              This creator has not published any portfolio items yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {portfolio.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-900/30 flex flex-col justify-between hover:border-surface-300 dark:hover:border-surface-700 transition-all shadow-subtle"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-surface-900 dark:text-surface-100 truncate">
                        {getPortfolioIcon(item.type)}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                        {item.type}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2 border-t border-surface-100 dark:border-surface-850"
                  >
                    <span>Inspect Deliverable</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for sending request */}
      {creator && (
        <SendRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetUser={{ _id: creator.user || id || '', name: creator.displayName }}
        />
      )}
    </div>
  );
};
