import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  AIRecommendationItem,
  AIPriceEstimateResponse,
  AIEmailDraftResponse,
  AIAnalyticsSummaryResponse,
  AIContentIdea,
} from '../services/api';
import {
  Sparkles,
  Users,
  DollarSign,
  Mail,
  BarChart2,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
  Send,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type TabType = 'recommend' | 'price' | 'email' | 'analytics' | 'plan';

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('recommend');
  const [isMock, setIsMock] = useState<boolean>(true);
  const [providerName, setProviderName] = useState<string>('mock');
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Tab 1: Recommender state
  const [targetType, setTargetType] = useState<'creators' | 'campaigns' | 'brands'>(
    user?.role === 'brand' ? 'creators' : 'campaigns'
  );
  const [recNiche, setRecNiche] = useState('');
  const [recGoal, setRecGoal] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [recMessage, setRecMessage] = useState<string | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  // Tab 2: Price Estimator state
  const [pricePlatform, setPricePlatform] = useState('youtube');
  const [priceContentType, setPriceContentType] = useState('Dedicated Video');
  const [priceFollowers, setPriceFollowers] = useState<number>(25000);
  const [priceEngagement, setPriceEngagement] = useState<number>(3.5);
  const [priceDeliverables, setPriceDeliverables] = useState('');
  const [priceResult, setPriceResult] = useState<AIPriceEstimateResponse | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Tab 3: Email Drafter state
  const [emailRecipientName, setEmailRecipientName] = useState('');
  const [emailRecipientType, setEmailRecipientType] = useState<'creator' | 'brand' | 'agency'>('creator');
  const [emailGoal, setEmailGoal] = useState('');
  const [emailTone, setEmailTone] = useState<'professional' | 'casual' | 'enthusiastic'>('professional');
  const [emailNotes, setEmailNotes] = useState('');
  const [emailResult, setEmailResult] = useState<AIEmailDraftResponse | null>(null);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Tab 4: Analytics Summarizer state
  const [analyticsViews, setAnalyticsViews] = useState<number>(0);
  const [analyticsReach, setAnalyticsReach] = useState<number>(0);
  const [analyticsClicks, setAnalyticsClicks] = useState<number>(0);
  const [analyticsEngagement, setAnalyticsEngagement] = useState<number>(0);
  const [analyticsContext, setAnalyticsContext] = useState('');
  const [analyticsResult, setAnalyticsResult] = useState<AIAnalyticsSummaryResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Tab 5: Content Plan state
  const [planNiche, setPlanNiche] = useState('');
  const [planGoal, setPlanGoal] = useState('');
  const [planPlatform, setPlanPlatform] = useState('instagram');
  const [planWeeks, setPlanWeeks] = useState(2);
  const [planIdeas, setPlanIdeas] = useState<AIContentIdea[]>([]);
  const [copiedHashtagsIdx, setCopiedHashtagsIdx] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Fetch AI status on mount
  useEffect(() => {
    let mounted = true;
    api
      .getAiStatus()
      .then((res) => {
        if (mounted && res.data) {
          setIsMock(res.data.isMock);
          setProviderName(res.data.provider);
        }
      })
      .catch(() => {
        // Fallback default
        if (mounted) {
          setIsMock(true);
          setProviderName('mock');
        }
      })
      .finally(() => {
        if (mounted) setLoadingStatus(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Handle Recommendations
  const handleGenerateRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRec(true);
    setRecMessage(null);
    try {
      const res = await api.getAiRecommendations({
        target: targetType,
        niche: recNiche.trim() || undefined,
        goal: recGoal.trim() || undefined,
      });

      if (res.data) {
        setRecommendations(res.data.recommendations || []);
        if (res.data.message) {
          setRecMessage(res.data.message);
        }
        setIsMock(res.data.isMock);
        if ((res.data.recommendations || []).length > 0) {
          toast.success(`Generated ${res.data.recommendations.length} candidate recommendations.`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoadingRec(false);
    }
  };

  // Handle Price Estimation
  const handleEstimatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPrice(true);
    try {
      const res = await api.getAiPriceEstimate({
        platform: pricePlatform,
        contentType: priceContentType,
        followers: Number(priceFollowers) || 0,
        engagementRate: Number(priceEngagement) || undefined,
        deliverablesSummary: priceDeliverables.trim() || undefined,
      });

      if (res.data) {
        setPriceResult(res.data);
        setIsMock(res.data.isMock);
        toast.success('Rate estimate generated successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate price estimate');
    } finally {
      setLoadingPrice(false);
    }
  };

  // Handle Email Drafting
  const handleDraftEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipientName.trim() || !emailGoal.trim()) {
      toast.error('Recipient name and campaign objective are required.');
      return;
    }

    setLoadingEmail(true);
    try {
      const res = await api.getAiEmailDraft({
        recipientName: emailRecipientName.trim(),
        recipientType: emailRecipientType,
        campaignGoal: emailGoal.trim(),
        tone: emailTone,
        customNotes: emailNotes.trim() || undefined,
      });

      if (res.data) {
        setEmailResult(res.data);
        setEditableSubject(res.data.subject);
        setEditableBody(res.data.body);
        setIsMock(res.data.isMock);
        toast.success('Outreach draft generated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate email draft');
    } finally {
      setLoadingEmail(false);
    }
  };

  // Handle Analytics Summary
  const handleSummarizeAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAnalytics(true);
    try {
      const metricsObj: any = {};
      if (analyticsViews > 0) metricsObj.views = Number(analyticsViews);
      if (analyticsReach > 0) metricsObj.reach = Number(analyticsReach);
      if (analyticsClicks > 0) metricsObj.clicks = Number(analyticsClicks);
      if (analyticsEngagement > 0) metricsObj.engagementRate = Number(analyticsEngagement);

      const res = await api.getAiAnalyticsSummary({
        metrics: Object.keys(metricsObj).length > 0 ? metricsObj : undefined,
        campaignContext: analyticsContext.trim() || undefined,
      });

      if (res.data) {
        setAnalyticsResult(res.data);
        setIsMock(res.data.isMock);
        if (res.data.hasData) {
          toast.success('Performance analytics synthesized.');
        } else {
          toast.info('No metrics recorded. Ready when numbers are entered.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to synthesize analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Handle Content Plan
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planNiche.trim() || !planGoal.trim()) {
      toast.error('Niche and growth goal are required.');
      return;
    }

    setLoadingPlan(true);
    try {
      const res = await api.getAiContentPlan({
        niche: planNiche.trim(),
        goal: planGoal.trim(),
        platform: planPlatform,
        timeframeWeeks: Number(planWeeks) || 2,
      });

      if (res.data) {
        setPlanIdeas(res.data.ideas || []);
        setIsMock(res.data.isMock);
        toast.success(`Content strategy generated with ${res.data.ideas.length} ideas.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate content plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const copyToClipboard = (text: string, type: 'subject' | 'body' | number) => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === 'body') {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } else {
      setCopiedHashtagsIdx(type);
      setTimeout(() => setCopiedHashtagsIdx(null), 2000);
    }
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                AI Assistant
                {!loadingStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isMock
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                    title={
                      isMock
                        ? 'Running deterministic mock provider. Provide GEMINI_API_KEY in server/.env for live Google Gemini intelligence.'
                        : `Live AI active via Google Gemini (${providerName}).`
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                    {isMock ? 'Demo Mode (Mock)' : 'Gemini 1.5 Live'}
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI match recommendations, rate benchmarks, outreach copywriting, analytics synthesis, and content planning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2">
        <button
          onClick={() => setActiveTab('recommend')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'recommend'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidate Recommender
        </button>

        <button
          onClick={() => setActiveTab('price')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'price'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Rate Estimator
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'email'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <Mail className="w-4 h-4" />
          Outreach Drafter
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Analytics Summary
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'plan'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Content Strategy Plan
        </button>
      </div>

      {/* Tab 1: Candidate Recommender */}
      {activeTab === 'recommend' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Recommendation Criteria
            </h2>
            <p className="text-xs text-muted-foreground">
              Candidates are queried strictly from real database records. AI only ranks and formulates match rationale.
            </p>

            <form onSubmit={handleGenerateRecommendations} className="space-y-4">
              <div>
                <label htmlFor="rec-target" className="block text-xs font-medium text-foreground mb-1.5">
                  Target Entity
                </label>
                <select
                  id="rec-target"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="creators">Creators (For Brands & Agencies)</option>
                  <option value="campaigns">Open Campaigns (For Creators)</option>
                  <option value="brands">Brand Profiles</option>
                </select>
              </div>

              <div>
                <label htmlFor="rec-niche" className="block text-xs font-medium text-foreground mb-1.5">
                  Niche / Industry Focus
                </label>
                <input
                  id="rec-niche"
                  type="text"
                  placeholder="e.g. Technology, Fitness, Sustainable Fashion"
                  value={recNiche}
                  onChange={(e) => setRecNiche(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="rec-goal" className="block text-xs font-medium text-foreground mb-1.5">
                  Campaign Objective / Synergy Goal
                </label>
                <textarea
                  id="rec-goal"
                  rows={3}
                  placeholder="e.g. Launch product review series with creators with dedicated tech followings."
                  value={recGoal}
                  onChange={(e) => setRecGoal(e.target.value)}
                  maxLength={200}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingRec}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loadingRec ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Candidates...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recommendations
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {recMessage && recommendations.length === 0 && !loadingRec && (
              <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-medium text-foreground">No Candidates in Database</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{recMessage}</p>
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Browse Discovery Directory <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Ranked Matches ({recommendations.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">Self-reported & database metrics</span>
                </div>

                {recommendations.map((item, idx) => (
                  <div
                    key={item.candidateId || idx}
                    className="bg-card rounded-xl border border-border p-5 hover:border-primary/40 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base border border-primary/20 overflow-hidden">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            item.displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                            {item.displayName}
                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                              {item.niche}
                            </span>
                          </h4>
                          {item.budget && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Budget: ${item.budget.toLocaleString()} USD
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {item.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1.5 border border-border/50">
                      <div>
                        <span className="font-semibold text-foreground">Why this match: </span>
                        <span className="text-muted-foreground">{item.reason}</span>
                      </div>
                      {item.pitchAngle && (
                        <div>
                          <span className="font-semibold text-primary">Pitch Angle: </span>
                          <span className="text-foreground">{item.pitchAngle}</span>
                        </div>
                      )}
                    </div>

                    {item.platforms && item.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.platforms.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground"
                          >
                            {p.platform}: {p.followers?.toLocaleString() || 0} followers (self-reported)
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Link
                        to={targetType === 'creators' ? `/creators/${item.candidateId}` : targetType === 'campaigns' ? `/campaigns/${item.candidateId}` : `/brands/${item.candidateId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        View Profile & Details <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!recMessage && recommendations.length === 0 && !loadingRec && (
              <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center space-y-2">
                <Users className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-medium text-foreground">Ready to Discover Synergies</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Set your target and parameters on the left to rank relevant partners from the platform database.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Rate Estimator */}
      {activeTab === 'price' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Deliverable Rate Parameters
            </h2>
            <p className="text-xs text-muted-foreground">
              Calculates industry-standard benchmark pricing based on platform CPM tiers and engagement multiplier.
            </p>

            <form onSubmit={handleEstimatePrice} className="space-y-4">
              <div>
                <label htmlFor="price-platform" className="block text-xs font-medium text-foreground mb-1.5">
                  Platform
                </label>
                <select
                  id="price-platform"
                  value={pricePlatform}
                  onChange={(e) => setPricePlatform(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitch">Twitch</option>
                  <option value="blog">Blog / Newsletter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="price-content" className="block text-xs font-medium text-foreground mb-1.5">
                  Content Deliverable Type
                </label>
                <input
                  id="price-content"
                  type="text"
                  placeholder="e.g. Dedicated Video, 60s Reel, Carousel"
                  value={priceContentType}
                  onChange={(e) => setPriceContentType(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="price-followers" className="block text-xs font-medium text-foreground mb-1.5">
                  Follower Count (Self-reported)
                </label>
                <input
                  id="price-followers"
                  type="number"
                  min="0"
                  step="100"
                  value={priceFollowers}
                  onChange={(e) => setPriceFollowers(parseInt(e.target.value, 10) || 0)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="price-engagement" className="block text-xs font-medium text-foreground mb-1.5">
                  Engagement Rate (%)
                </label>
                <input
                  id="price-engagement"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={priceEngagement}
                  onChange={(e) => setPriceEngagement(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="price-deliverables" className="block text-xs font-medium text-foreground mb-1.5">
                  Deliverables Scope & Usage Notes
                </label>
                <textarea
                  id="price-deliverables"
                  rows={2}
                  placeholder="e.g. Includes 30-day organic digital usage rights, link in bio."
                  value={priceDeliverables}
                  onChange={(e) => setPriceDeliverables(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPrice}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loadingPrice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Estimate...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Calculate Rate Estimate
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            {priceResult ? (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider mb-2">
                      {priceResult.disclaimer}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">
                      Recommended Pricing Range
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-extrabold text-primary">
                      ${priceResult.minPrice.toLocaleString()} – ${priceResult.maxPrice.toLocaleString()}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">{priceResult.currency}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Valuation Methodology & Breakdown</h4>
                  <div className="bg-muted/40 rounded-xl p-4 border border-border text-sm text-muted-foreground leading-relaxed">
                    {priceResult.reasoning}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p>
                    <strong>Estimate Disclaimer:</strong> This figure is an automated valuation benchmark based on self-reported followers and general CPM metrics. Final contract pricing should be negotiated between parties based on deliverables, exclusivity, and turnaround timeline.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <DollarSign className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="text-base font-medium text-foreground">Fair-Rate Benchmark Calculator</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Enter your platform metrics and deliverable requirements on the left to compute realistic market ranges.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Outreach Drafter */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Outreach Specifications
            </h2>
            <p className="text-xs text-muted-foreground">
              Draft professional, high-converting partnership pitches customized to your target recipient.
            </p>

            <form onSubmit={handleDraftEmail} className="space-y-4">
              <div>
                <label htmlFor="email-recipient" className="block text-xs font-medium text-foreground mb-1.5">
                  Recipient Name / Brand
                </label>
                <input
                  id="email-recipient"
                  type="text"
                  placeholder="e.g. Sarah Jenkins or Lumina Audio"
                  value={emailRecipientName}
                  onChange={(e) => setEmailRecipientName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="email-type" className="block text-xs font-medium text-foreground mb-1.5">
                  Recipient Type
                </label>
                <select
                  id="email-type"
                  value={emailRecipientType}
                  onChange={(e) => setEmailRecipientType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="creator">Creator / Influencer</option>
                  <option value="brand">Brand Marketing Lead</option>
                  <option value="agency">Talent Agency / Manager</option>
                </select>
              </div>

              <div>
                <label htmlFor="email-goal" className="block text-xs font-medium text-foreground mb-1.5">
                  Campaign Objective / Value Proposition
                </label>
                <textarea
                  id="email-goal"
                  rows={3}
                  placeholder="e.g. Q4 Headphones launch targeting audio engineers and music producers."
                  value={emailGoal}
                  onChange={(e) => setEmailGoal(e.target.value)}
                  required
                  maxLength={300}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="email-tone" className="block text-xs font-medium text-foreground mb-1.5">
                  Desired Tone
                </label>
                <select
                  id="email-tone"
                  value={emailTone}
                  onChange={(e) => setEmailTone(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="professional">Professional & Direct</option>
                  <option value="casual">Casual & Conversational</option>
                  <option value="enthusiastic">Enthusiastic & High Energy</option>
                </select>
              </div>

              <div>
                <label htmlFor="email-notes" className="block text-xs font-medium text-foreground mb-1.5">
                  Key Deliverables or Notes (Optional)
                </label>
                <textarea
                  id="email-notes"
                  rows={2}
                  placeholder="e.g. Mention 10% affiliate kickback, review unit provided."
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loadingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Composing Pitch...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Draft Outreach Email
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            {emailResult ? (
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Editable Email Draft
                  </h3>
                  <span className="text-xs text-muted-foreground">Modify directly in the fields below</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="edit-subject" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Subject Line
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editableSubject, 'subject')}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSubject ? 'Copied' : 'Copy Subject'}
                    </button>
                  </div>
                  <input
                    id="edit-subject"
                    type="text"
                    value={editableSubject}
                    onChange={(e) => setEditableSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="edit-body" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Message Body
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editableBody, 'body')}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBody ? 'Copied' : 'Copy Body'}
                    </button>
                  </div>
                  <textarea
                    id="edit-body"
                    rows={12}
                    value={editableBody}
                    onChange={(e) => setEditableBody(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y font-mono leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${editableSubject}\n\n${editableBody}`, 'body')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 border border-border"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Entire Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <Mail className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="text-base font-medium text-foreground">Outreach Copywriter</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Provide recipient details and campaign goals on the left to draft an attention-grabbing partnership pitch.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics Summarizer */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              Recorded Campaign Metrics
            </h2>
            <p className="text-xs text-muted-foreground">
              Summarizes strictly verified recorded figures. If no metrics are provided, no numbers will ever be fabricated.
            </p>

            <form onSubmit={handleSummarizeAnalytics} className="space-y-4">
              <div>
                <label htmlFor="ana-views" className="block text-xs font-medium text-foreground mb-1.5">
                  Total Views (Self-reported)
                </label>
                <input
                  id="ana-views"
                  type="number"
                  min="0"
                  value={analyticsViews}
                  onChange={(e) => setAnalyticsViews(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="ana-reach" className="block text-xs font-medium text-foreground mb-1.5">
                  Audience Reach
                </label>
                <input
                  id="ana-reach"
                  type="number"
                  min="0"
                  value={analyticsReach}
                  onChange={(e) => setAnalyticsReach(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="ana-clicks" className="block text-xs font-medium text-foreground mb-1.5">
                  Link / Bio Clicks
                </label>
                <input
                  id="ana-clicks"
                  type="number"
                  min="0"
                  value={analyticsClicks}
                  onChange={(e) => setAnalyticsClicks(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="ana-eng" className="block text-xs font-medium text-foreground mb-1.5">
                  Engagement Rate (%)
                </label>
                <input
                  id="ana-eng"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={analyticsEngagement}
                  onChange={(e) => setAnalyticsEngagement(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="ana-context" className="block text-xs font-medium text-foreground mb-1.5">
                  Campaign Context (Optional)
                </label>
                <input
                  id="ana-context"
                  type="text"
                  placeholder="e.g. Summer Tech Launch Series"
                  value={analyticsContext}
                  onChange={(e) => setAnalyticsContext(e.target.value)}
                  maxLength={300}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loadingAnalytics}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loadingAnalytics ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Metrics...
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    Synthesize Performance
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            {analyticsResult ? (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                {!analyticsResult.hasData ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">No Metrics Recorded</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {analyticsResult.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enter positive numbers on the left to generate an authentic performance synthesis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-border pb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Performance Synthesis
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-1">
                        Executive Summary
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {analyticsResult.summary}
                      </p>
                    </div>

                    {analyticsResult.insights && analyticsResult.insights.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Key Takeaways & Next Steps
                        </h4>
                        <div className="space-y-2">
                          {analyticsResult.insights.map((insight, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-muted/30 border border-border rounded-lg p-3 text-sm text-foreground"
                            >
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <BarChart2 className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="text-base font-medium text-foreground">Factual Performance Synthesizer</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Enter your verified campaign deliverables metrics on the left. The assistant summarizes only recorded figures without hallucinations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Content Strategy Plan */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Content Strategy Inputs
            </h2>
            <p className="text-xs text-muted-foreground">
              Generate structured content topics, viral hooks, captions, and hashtag strategies tailored to your niche.
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label htmlFor="plan-niche" className="block text-xs font-medium text-foreground mb-1.5">
                  Content Niche / Vertical
                </label>
                <input
                  id="plan-niche"
                  type="text"
                  placeholder="e.g. AI Productivity, Plant-Based Fitness"
                  value={planNiche}
                  onChange={(e) => setPlanNiche(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="plan-goal" className="block text-xs font-medium text-foreground mb-1.5">
                  Growth / Campaign Goal
                </label>
                <textarea
                  id="plan-goal"
                  rows={3}
                  placeholder="e.g. Build authority, drive newsletter signups, promote webinar."
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="plan-plat" className="block text-xs font-medium text-foreground mb-1.5">
                  Primary Platform
                </label>
                <select
                  id="plan-plat"
                  value={planPlatform}
                  onChange={(e) => setPlanPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="blog">Blog / Newsletter</option>
                  <option value="twitch">Twitch</option>
                  <option value="other">Cross-Platform</option>
                </select>
              </div>

              <div>
                <label htmlFor="plan-weeks" className="block text-xs font-medium text-foreground mb-1.5">
                  Timeframe (Weeks)
                </label>
                <input
                  id="plan-weeks"
                  type="number"
                  min="1"
                  max="12"
                  value={planWeeks}
                  onChange={(e) => setPlanWeeks(parseInt(e.target.value, 10) || 2)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPlan}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loadingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Strategy...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Content Plan
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {planIdeas.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Content Action Plan ({planIdeas.length} Deliverable Concepts)
                  </h3>
                  <span className="text-xs text-muted-foreground">{planPlatform} • {planWeeks} Weeks</span>
                </div>

                {planIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="bg-card rounded-xl border border-border p-5 space-y-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          Post Concept #{idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-foreground mt-0.5">{idea.title}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {idea.format}
                      </span>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
                      <span className="font-bold text-primary">Viral Hook: </span>
                      <span className="text-foreground italic">"{idea.hook}"</span>
                    </div>

                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Suggested Caption: </span>
                      {idea.suggestedCaption}
                    </div>

                    {idea.hashtags && idea.hashtags.length > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <div className="flex flex-wrap gap-1.5">
                          {idea.hashtags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono"
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(idea.hashtags.join(' '), idx)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          {copiedHashtagsIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedHashtagsIdx === idx ? 'Copied' : 'Copy Tags'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="text-base font-medium text-foreground">Content Strategy Generator</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Provide your vertical and growth objectives to generate high-performing hooks, captions, and hashtag strategies.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AiAssistantPage;
