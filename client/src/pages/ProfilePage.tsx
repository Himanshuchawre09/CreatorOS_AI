import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Building,
  Briefcase,
  Users2,
  Save,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, PlatformItem } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { PortfolioManager } from '../components/profile/PortfolioManager';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Creator state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('');
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState('');
  const [contentTypes, setContentTypes] = useState('');
  const [rateNotes, setRateNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Brand state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Freelancer state
  const [headline, setHeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [availability, setAvailability] = useState<'available' | 'busy'>('available');
  const [hourlyRate, setHourlyRate] = useState<string>('');

  // Talent manager state
  const [agencyName, setAgencyName] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.getMyProfile();
        if (!isMounted) return;

        const p = res.profile;
        if (p) {
          setIsPublic(p.isPublic !== undefined ? p.isPublic : true);
          if (user?.role === 'creator') {
            setDisplayName(p.displayName || user.name || '');
            setBio(p.bio || '');
            setNiche(p.niche || '');
            setPlatforms(p.platforms || []);
            setLocation(p.location || '');
            setLanguages(Array.isArray(p.languages) ? p.languages.join(', ') : '');
            setContentTypes(Array.isArray(p.contentTypes) ? p.contentTypes.join(', ') : '');
            setRateNotes(p.rateNotes || '');
            setAvatarUrl(p.avatarUrl || '');
          } else if (user?.role === 'brand') {
            setCompanyName(p.companyName || user.orgName || user.name || '');
            setIndustry(p.industry || '');
            setWebsite(p.website || '');
            setAbout(p.about || '');
            setTargetAudience(p.targetAudience || '');
            setLogoUrl(p.logoUrl || '');
          } else if (user?.role === 'freelancer') {
            setHeadline(p.headline || '');
            setSkills(Array.isArray(p.skills) ? p.skills.join(', ') : '');
            setBio(p.bio || '');
            setPortfolioLinks(Array.isArray(p.portfolioLinks) ? p.portfolioLinks.join(', ') : '');
            setAvailability(p.availability || 'available');
            setHourlyRate(p.hourlyRate !== undefined ? String(p.hourlyRate) : '');
          } else if (user?.role === 'talentManager') {
            setAgencyName(p.agencyName || user.orgName || '');
            setAbout(p.about || '');
            setWebsite(p.website || '');
          }
        } else {
          // Defaults for new profile
          if (user?.role === 'creator') {
            setDisplayName(user.name || '');
            setNiche('General');
          } else if (user?.role === 'brand') {
            setCompanyName(user.orgName || user.name || '');
            setIndustry('Media & Technology');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err.message || 'Failed to load profile data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  // Completeness indicator calculation
  const completeness = useMemo(() => {
    let filled = 0;
    let total = 1;

    if (user?.role === 'creator') {
      const checks = [
        displayName.trim().length > 0,
        bio.trim().length > 0,
        niche.trim().length > 0,
        platforms.length > 0,
        location.trim().length > 0,
        languages.trim().length > 0,
        contentTypes.trim().length > 0,
      ];
      total = checks.length;
      filled = checks.filter(Boolean).length;
    } else if (user?.role === 'brand') {
      const checks = [
        companyName.trim().length > 0,
        industry.trim().length > 0,
        website.trim().length > 0,
        about.trim().length > 0,
        targetAudience.trim().length > 0,
      ];
      total = checks.length;
      filled = checks.filter(Boolean).length;
    } else if (user?.role === 'freelancer') {
      const checks = [
        headline.trim().length > 0,
        skills.trim().length > 0,
        bio.trim().length > 0,
        portfolioLinks.trim().length > 0,
        hourlyRate.trim().length > 0,
      ];
      total = checks.length;
      filled = checks.filter(Boolean).length;
    } else if (user?.role === 'talentManager') {
      const checks = [
        agencyName.trim().length > 0,
        about.trim().length > 0,
        website.trim().length > 0,
      ];
      total = checks.length;
      filled = checks.filter(Boolean).length;
    }

    return Math.round((filled / total) * 100);
  }, [
    user?.role,
    displayName,
    bio,
    niche,
    platforms,
    location,
    languages,
    contentTypes,
    companyName,
    industry,
    website,
    about,
    targetAudience,
    headline,
    skills,
    portfolioLinks,
    hourlyRate,
    agencyName,
  ]);

  const handleAddPlatform = () => {
    setPlatforms((prev) => [
      ...prev,
      {
        platform: 'youtube',
        handle: '@',
        url: 'https://youtube.com/@',
        followers: 1000,
        engagementRate: 3.5,
      },
    ]);
  };

  const handleRemovePlatform = (idx: number) => {
    setPlatforms((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePlatformChange = (idx: number, field: keyof PlatformItem, value: any) => {
    setPlatforms((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    let payload: any = { isPublic };

    if (user?.role === 'creator') {
      if (!displayName.trim()) {
        setServerError('Display name is required');
        return;
      }
      if (!niche.trim()) {
        setServerError('Niche is required');
        return;
      }

      payload = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        niche: niche.trim(),
        platforms,
        location: location.trim(),
        languages: languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        contentTypes: contentTypes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        rateNotes: rateNotes.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        isPublic,
      };
    } else if (user?.role === 'brand') {
      if (!companyName.trim()) {
        setServerError('Company name is required');
        return;
      }
      if (!industry.trim()) {
        setServerError('Industry is required');
        return;
      }

      payload = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        website: website.trim() || undefined,
        about: about.trim(),
        targetAudience: targetAudience.trim(),
        logoUrl: logoUrl.trim() || undefined,
        isPublic,
      };
    } else if (user?.role === 'freelancer') {
      if (!headline.trim()) {
        setServerError('Headline is required');
        return;
      }

      payload = {
        headline: headline.trim(),
        skills: skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        bio: bio.trim(),
        portfolioLinks: portfolioLinks
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        availability,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        isPublic,
      };
    } else if (user?.role === 'talentManager') {
      if (!agencyName.trim()) {
        setServerError('Agency name is required');
        return;
      }

      payload = {
        agencyName: agencyName.trim(),
        about: about.trim(),
        website: website.trim() || undefined,
        isPublic,
      };
    }

    try {
      setSaving(true);
      await api.updateMyProfile(payload);
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      setServerError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-surface-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Completeness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
            {user?.role === 'brand' ? (
              <Building className="w-6 h-6" />
            ) : user?.role === 'freelancer' ? (
              <Briefcase className="w-6 h-6" />
            ) : user?.role === 'talentManager' ? (
              <Users2 className="w-6 h-6" />
            ) : (
              <UserCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-surface-900 dark:text-surface-100 capitalize">
              {user?.role} Profile Settings
            </h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Manage your public information, visibility, and discovery presentation.
            </p>
          </div>
        </div>

        {/* Completeness Gauge */}
        <div className="flex items-center gap-3 sm:border-l sm:pl-4 border-surface-100 dark:border-surface-800">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">
              Profile Score
            </span>
            <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
              {completeness}%
            </span>
          </div>
          <div className="w-24 bg-surface-100 dark:bg-surface-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-600 to-accent-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
            <CardDescription>
              Basic identity information displayed across discovery searches.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Creator Specific Form */}
            {user?.role === 'creator' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Public Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivers Tech"
                    required
                  />
                  <Input
                    label="Primary Niche / Category"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Technology, Gaming, Fitness"
                    required
                  />
                </div>

                <Textarea
                  label="Biography (Max 500 characters)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce your content style, key focus areas, and milestone accomplishments..."
                  maxLength={500}
                  rows={3}
                />
                <div className="text-right -mt-2">
                  <span className="text-[10px] text-surface-400">{bio.length}/500</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location (City, Country)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX, USA"
                  />
                  <Input
                    label="Languages (comma separated)"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. English, Spanish"
                  />
                </div>

                <Input
                  label="Content Formats / Deliverables (comma separated)"
                  value={contentTypes}
                  onChange={(e) => setContentTypes(e.target.value)}
                  placeholder="e.g. YouTube Dedicated Video, Shorts, TikTok Review"
                />

                <Textarea
                  label="Rate & Collaboration Notes (Optional)"
                  value={rateNotes}
                  onChange={(e) => setRateNotes(e.target.value)}
                  placeholder="e.g. Base packages start at $1,500. Open to creative integration segments..."
                  rows={2}
                />
              </>
            )}

            {/* Brand Specific Form */}
            {user?.role === 'brand' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Dynamics Corp"
                    required
                  />
                  <Input
                    label="Industry Sector"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Consumer Electronics, Health"
                    required
                  />
                </div>

                <Input
                  label="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.example.com"
                />

                <Textarea
                  label="About Company (Max 800 characters)"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Describe your company mission and what partnerships you look for..."
                  maxLength={800}
                  rows={3}
                />

                <Input
                  label="Target Audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Tech professionals and remote workers aged 20-40"
                />
              </>
            )}

            {/* Freelancer Specific Form */}
            {user?.role === 'freelancer' && (
              <>
                <Input
                  label="Professional Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior YouTube Video Editor & Thumbnail Designer"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Core Skills (comma separated)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Premiere Pro, DaVinci, Sound Design"
                  />
                  <Input
                    label="Hourly Rate ($ USD)"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>

                <Select
                  label="Current Availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  options={[
                    { label: 'Available for work', value: 'available' },
                    { label: 'Busy / Booked out', value: 'busy' },
                  ]}
                />

                <Textarea
                  label="About / Experience"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your creative background, previous creator collaborations..."
                  rows={3}
                />

                <Input
                  label="Portfolio Links (comma separated URLs)"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="https://youtube.com/showcase, https://behance.net/you"
                />
              </>
            )}

            {/* Talent Manager Specific Form */}
            {user?.role === 'talentManager' && (
              <>
                <Input
                  label="Agency / Management Firm Name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Apex Talent Group"
                  required
                />

                <Input
                  label="Agency Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://agency.example.com"
                />

                <Textarea
                  label="About Agency & Creator Roster"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Describe your represented niches and collaboration standards..."
                  rows={3}
                />
              </>
            )}

            {/* Public Visibility Toggle */}
            <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-surface-900 dark:text-surface-100 block">
                  Public Profile Visibility
                </span>
                <span className="text-[11px] text-surface-500">
                  When enabled, your profile appears in discovery searches and public detail views.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-surface-200 peer-focus:outline-none rounded-full peer dark:bg-surface-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-surface-600 peer-checked:bg-brand-600" />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Creator Platforms Section */}
        {user?.role === 'creator' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Connected Platforms & Metrics</CardTitle>
                <CardDescription>
                  List your channel handles, links, and audience counts.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPlatform}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Platform
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {platforms.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 text-center text-xs text-surface-500">
                  No platforms configured. Click &quot;Add Platform&quot; to link your YouTube, Instagram, or TikTok channels.
                </div>
              ) : (
                platforms.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                  >
                    <div>
                      <Select
                        label="Platform"
                        value={p.platform}
                        onChange={(e) => handlePlatformChange(idx, 'platform', e.target.value)}
                        options={[
                          { label: 'YouTube', value: 'youtube' },
                          { label: 'Instagram', value: 'instagram' },
                          { label: 'TikTok', value: 'tiktok' },
                          { label: 'Twitch', value: 'twitch' },
                          { label: 'Blog / Web', value: 'blog' },
                          { label: 'Other', value: 'other' },
                        ]}
                      />
                    </div>
                    <div>
                      <Input
                        label="Handle"
                        value={p.handle}
                        onChange={(e) => handlePlatformChange(idx, 'handle', e.target.value)}
                        placeholder="@username"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Channel URL"
                        value={p.url}
                        onChange={(e) => handlePlatformChange(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Followers"
                        type="number"
                        value={p.followers}
                        onChange={(e) => handlePlatformChange(idx, 'followers', Number(e.target.value))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePlatform(idx)}
                        title="Remove platform"
                        className="p-2 mb-0.5 rounded-lg text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio Section for Creators */}
        {user?.role === 'creator' && (
          <Card>
            <CardContent className="pt-6">
              <PortfolioManager />
            </CardContent>
          </Card>
        )}

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
