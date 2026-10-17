import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck2,
  Users2,
  Briefcase,
  Layers,
  Check,
  CheckCircle2,
  Lock,
  Workflow,
  Search,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Tabs, TabsList, TabTrigger, TabContent } from '../components/ui/Tabs';

export const LandingPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('creator');

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-brand-500 selection:text-white transition-colors">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 w-full border-b border-surface-200/80 dark:border-surface-800/80 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-surface-900 dark:text-surface-50">
                Creator<span className="text-brand-600 dark:text-brand-400">OS</span>
              </span>
              <span className="text-[9px] font-semibold text-accent-500 uppercase tracking-widest leading-none">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600 dark:text-surface-300">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Platform
            </a>
            <a href="#workflow" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Workflow
            </a>
            <a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Solutions
            </a>
            <a href="#ai-intelligence" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
              <span>AI Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Next-Generation Creator & Brand Collaboration Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 leading-[1.1] max-w-4xl mx-auto">
            Where Modern Creators and Brands{' '}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
              Align, Deliver, and Scale.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate fragmented DMs, ambiguous scopes, and delayed payouts. CreatorOS AI provides
            structured campaign briefs, verified deliverables, automated milestone protection, and
            actionable workflow intelligence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base px-7" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Free Workspace
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6">
                Explore Live Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Milestone Protection
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-500" /> Real-Time Asset Reviews
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-accent-500" /> Enterprise-Grade Privacy
            </span>
          </div>

          {/* Interactive Visual Dashboard Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-100/60 dark:bg-surface-900/60 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl border border-surface-200/90 dark:border-surface-800 bg-white dark:bg-surface-950 overflow-hidden shadow-inner text-left">
              {/* Window bar */}
              <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50 dark:bg-surface-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs text-surface-400 dark:text-surface-500 font-mono ml-2">
                    creatoros.ai/app/campaigns/active
                  </span>
                </div>
                <Badge variant="brand" size="sm">
                  Active Collaboration
                </Badge>
              </div>

              {/* Mockup content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-850 bg-surface-50/50 dark:bg-surface-900/40">
                  <span className="text-xs font-semibold text-surface-500">Active Campaign</span>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-100 mt-1">
                    Nordic Audio Fall Product Launch
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-surface-400">Deliverables</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">3 of 4 Approved</span>
                  </div>
                  <div className="w-full bg-surface-200 dark:bg-surface-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-brand-600 h-full w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-850 bg-surface-50/50 dark:bg-surface-900/40">
                  <span className="text-xs font-semibold text-surface-500">Escrow Milestone</span>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-100 mt-1">
                    $4,500.00 USD
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Locked in Milestone Escrow
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/30 dark:bg-brand-950/20">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Contract Review
                  </span>
                  <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 mt-1">
                    Standard Usage Rights Verified
                  </p>
                  <p className="text-[11px] text-surface-500 mt-1">
                    No perpetual rights detected. 60-day digital distribution window approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section id="features" className="py-20 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Platform Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl">
              Engineered for Real-World Creator Operations
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Replace disorganized email threads, PDF contracts, and spreadsheet trackers with an
              integrated system built specifically for brand partnerships.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Structured Briefs & Contracts
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Turn vague messages into explicit campaign agreements with defined deliverables,
                  licensing periods, revision limits, and exact deadlines.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950/80 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Milestone Escrow Protection
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Brands fund milestones upfront to confirm budget commitment, while creators
                  receive guaranteed prompt payouts upon deliverable sign-off.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                  <Users2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Deliverables Review Hub
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Submit video cuts, copy drafts, and social assets directly into dedicated revision
                  threads with timestamped review markers.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  AI Workflow Assistant
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Analyze legal clauses for predatory terms, generate standard creative briefs, and
                  predict timeline bottlenecks before they happen.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                  <Workflow className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Multi-Channel Pipeline
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Track YouTube integrations, Instagram Reels, TikTok packages, and newsletter
                  features across every stage of production in a single view.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Role-Tailored Workspaces
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Distinct interfaces and permissions whether you are an individual solo creator,
                  in-house brand marketer, talent manager, or agency team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section id="workflow" className="py-20 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-accent-500">
              Clear Process
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl">
              How CreatorOS Works
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              From the initial outreach to final deliverable sign-off, every step has dedicated structure.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Match & Scope',
                desc: 'Define campaign objectives, required formats, target demographics, and delivery milestones.',
              },
              {
                step: '02',
                title: 'Brief & Contract',
                desc: 'Generate clear agreements detailing usage rights, exclusivity restrictions, and payment schedules.',
              },
              {
                step: '03',
                title: 'Collaborate & Review',
                desc: 'Submit drafts and review creative assets with version tracking and consolidated feedback.',
              },
              {
                step: '04',
                title: 'Approve & Payout',
                desc: 'Sign off on finished assets to automatically release escrow funds directly to creators without delay.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl p-6 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-brand-600/30 dark:text-brand-400/20 font-mono">
                    {s.step}
                  </span>
                  <h4 className="text-base font-bold text-surface-900 dark:text-surface-100 mt-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <Check className="w-3.5 h-3.5" /> Stage Ready
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Specific Solutions Section */}
      <section id="roles" className="py-20 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Role Workspaces
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl">
              Built for Every Side of the Collaboration
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Whether you are an independent creator producing content or a brand managing fifty
              concurrent partnerships, CreatorOS provides the right toolkit.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <Tabs defaultValue="creator" value={selectedRole} onValueChange={setSelectedRole}>
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
                  <TabTrigger value="creator">Creators</TabTrigger>
                  <TabTrigger value="brand">Brands</TabTrigger>
                  <TabTrigger value="freelancer">Freelancers</TabTrigger>
                  <TabTrigger value="agency">Agencies</TabTrigger>
                </TabsList>
              </div>

              <TabContent value="creator">
                <Card className="mt-6">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="brand" size="sm" className="mb-3">
                        For Independent Creators
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        Focus on creating, not chasing unpaid invoices.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Say goodbye to vague contracts and 90-day payment delays. CreatorOS provides
                        you with verified briefs, milestone escrow, and automatic invoicing so your
                        creative business runs predictably.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Guaranteed payout release upon deliverable approval
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Contract clause scanner highlights perpetual rights risks
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unified media kit link and partnership intake portal
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Upcoming Deliverable</span>
                        <Badge variant="warning" size="sm">Due in 3 Days</Badge>
                      </div>
                      <p className="text-sm font-bold">YouTube 60s Dedicated Segment: VPN Privacy</p>
                      <p className="text-xs text-surface-500">Brief status: Script approved, rough cut submitted.</p>
                      <div className="pt-2 border-t border-surface-200 dark:border-surface-800 flex justify-between text-xs">
                        <span className="text-surface-500">Agreed Rate:</span>
                        <span className="font-bold text-surface-900 dark:text-surface-100">$3,200.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabContent>

              <TabContent value="brand">
                <Card className="mt-6">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="accent" size="sm" className="mb-3">
                        For Marketing Teams & Brands
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        Organize 100+ creator partnerships effortlessly.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Centralize creator outreach, brief generation, licensing compliance, and ROI
                        tracking. Avoid lost assets in slack channels or unreviewed deliverables.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> One-click standardized brief distribution
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated compliance check for FTC disclosure tags
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Consolidated company billing and tax documentation
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Campaign Overview</span>
                        <Badge variant="success" size="sm">Q4 Holiday Push</Badge>
                      </div>
                      <p className="text-sm font-bold">18 Creators Engaged • $42,500 Total Budget</p>
                      <p className="text-xs text-surface-500">14 briefs signed, 8 first cuts under review.</p>
                      <div className="pt-2 border-t border-surface-200 dark:border-surface-800 flex justify-between text-xs">
                        <span className="text-surface-500">Escrow Balance:</span>
                        <span className="font-bold text-surface-900 dark:text-surface-100">$42,500 Funded</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabContent>

              <TabContent value="freelancer">
                <Card className="mt-6">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="neutral" size="sm" className="mb-3">
                        For Video Editors & Strategists
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        The production layer for creator teams.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Editors, copywriters, thumbnail artists, and production managers can easily
                        plug into creator accounts to upload assets, mark revisions, and manage sub-deliverables.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Role-based permissions without sharing account credentials
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct file handover with timestamped client comments
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="text-xs font-semibold text-surface-500">Sub-Task Assigned</div>
                      <p className="text-sm font-bold">Render final 4K cut with brand bumper logo</p>
                      <p className="text-xs text-surface-500">Assigned by: Alex Morgan (Lead Creator)</p>
                      <Badge variant="brand" size="sm">Ready for Review</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabContent>

              <TabContent value="agency">
                <Card className="mt-6">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="brand" size="sm" className="mb-3">
                        For Talent Agencies & Representation
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        Manage your entire roster from one dashboard.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Oversee multiple creator rosters, negotiate contracts, automatically split
                        management commissions, and generate comprehensive brand reporting.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-creator pipeline with roster overview
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated commission splits and split-payout routing
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="text-xs font-semibold text-surface-500">Agency Roster Metrics</div>
                      <p className="text-sm font-bold">24 Active Talents • 39 Active Contracts</p>
                      <p className="text-xs text-surface-500">Commission split rate: 20% automated deduction.</p>
                      <Badge variant="success" size="sm">All Payouts In Sync</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section id="ai-intelligence" className="py-20 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-950/80 border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Specialized AI Features</span>
            </div>
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl">
              Artificial Intelligence Tailored for Creator Deals
            </h2>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Not generic text generation—purpose-built intelligence to protect terms, clarify
              expectations, and accelerate turnaround times.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-brand-200/80 dark:border-brand-900/60" hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                      AI Contract & Rights Inspector
                    </h4>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      Legal Risk Protection
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Automatically parses uploaded agreement PDFs. Identifies perpetual image rights,
                  broad indemnity liabilities, ambiguous exclusivity clauses, and suggests industry-standard
                  counter-language.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent-200/80 dark:border-accent-900/60" hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent-100 dark:bg-accent-900/60 text-accent-600 dark:text-accent-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                      Dynamic Creative Brief Generator
                    </h4>
                    <span className="text-xs text-accent-600 dark:text-accent-400 font-medium">
                      Scope Standardization
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Converts marketing campaign talking points into structured creator briefs complete
                  with dos-and-don&apos;ts, CTA mandates, FTC disclosure rules, and recommended asset formats.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                      Deliverable Asset Compliance Check
                    </h4>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Automated Pre-flight
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Scans uploaded video captions and descriptions for required brand links, discount
                  codes, and proper sponsorship disclosures before submitting to brand review.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                      Rate Intelligence & Scope Benchmarks
                    </h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Pricing Guidance
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Provides data-backed baseline quotes based on content format, licensing duration,
                  usage scope, and engagement thresholds so negotiations start on fair ground.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-tr from-brand-900 via-brand-800 to-surface-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade how you manage brand partnerships?
          </h2>
          <p className="mt-4 text-base text-brand-200 max-w-xl mx-auto">
            Get started with CreatorOS AI today. Scaffolded with modern TypeScript, accessible design
            tokens, and structured collaboration workflows.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Collaborating
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 py-12 text-surface-500 dark:text-surface-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-surface-900 dark:text-surface-100">
                  Creator<span className="text-brand-600 dark:text-brand-400">OS</span> AI
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed max-w-sm">
                The modern operating system connecting creators and brands through structured
                briefs, milestone escrow, and AI workflow intelligence.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="success" size="sm" dot>
                  Phase 0 Foundation Live
                </Badge>
              </div>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-3">
                Product
              </p>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">Features</a></li>
                <li><a href="#workflow" className="hover:text-brand-600 dark:hover:text-brand-400">Workflow</a></li>
                <li><a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">Solutions</a></li>
                <li><a href="#ai-intelligence" className="hover:text-brand-600 dark:hover:text-brand-400">AI Tools</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-3">
                Solutions
              </p>
              <ul className="space-y-2">
                <li><a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">For Creators</a></li>
                <li><a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">For Brands</a></li>
                <li><a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">For Freelancers</a></li>
                <li><a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">For Agencies</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-3">
                Platform
              </p>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Dashboard</Link></li>
                <li><Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400">Register</Link></li>
                <li>
                  <a
                    href="http://localhost:5000/api/health"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
                  >
                    <span>Health API</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-850 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} CreatorOS AI Technologies. All rights reserved.</p>
            <p className="text-surface-400">
              Built with React, Vite, TypeScript, Tailwind CSS, Express, and Mongoose.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
