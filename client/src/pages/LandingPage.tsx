import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  FileCheck2,
  Users2,
  Briefcase,
  Layers,
  Check,
  CheckCircle2,
  Workflow,
  Search,
  Bot,
  GitPullRequest,
  Clock,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Tabs, TabsList, TabTrigger, TabContent } from '../components/ui/Tabs';

export const LandingPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('creator');

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-brand-500 selection:text-white transition-colors">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 w-full border-b border-surface-200/80 dark:border-surface-800/80 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
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
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-surface-600 dark:text-surface-300">
            <a
              href="#features"
              className="px-2 py-1 rounded-md hover:text-brand-600 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            >
              Platform
            </a>
            <a
              href="#workflow"
              className="px-2 py-1 rounded-md hover:text-brand-600 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            >
              Workflow
            </a>
            <a
              href="#roles"
              className="px-2 py-1 rounded-md hover:text-brand-600 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#ai-intelligence"
              className="px-2 py-1 rounded-md hover:text-brand-600 dark:hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors flex items-center gap-1.5"
            >
              <span>AI Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
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
      <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-brand-500/10 dark:bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Concrete Short Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Creator & Brand Collaboration Platform</span>
          </div>

          {/* Hero Heading: font-size clamp, looser letter-spacing, text-wrap balance, final period attached */}
          <h1
            className="font-extrabold tracking-normal text-surface-900 dark:text-surface-50 leading-[1.12] max-w-4xl mx-auto"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              letterSpacing: '0.015em',
              textWrap: 'balance',
            }}
          >
            Where creators and brands align, deliver, and collaborate seamlessly.
          </h1>

          {/* Plain language subtext */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto leading-relaxed">
            One workspace for campaigns, collaboration requests, contracts, tasks, content approval, and AI help.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base px-7" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Free Workspace
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6">
                View Demo Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-brand-500" /> Standardized Briefs
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" /> Real-Time Asset Feedback
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-500" /> Invoice Status Tracking
            </span>
          </div>

          {/* Product Preview Browser Frame */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="text-left mb-2 flex items-center justify-between px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Product preview
              </span>
              <span className="text-[11px] text-surface-400 font-mono">
                Interactive preview
              </span>
            </div>

            <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-100/60 dark:bg-surface-900/60 p-2 sm:p-4 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 overflow-hidden text-left shadow-inner">
                {/* Browser window chrome */}
                <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50 dark:bg-surface-900/60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <span className="text-xs text-surface-400 dark:text-surface-500 font-mono ml-2">
                      app.creatoros.ai/campaigns/active
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Campaign Workspace
                  </Badge>
                </div>

                {/* Browser preview contents: Campaign Card, Collaboration-Request Card, AI Match Card */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Active Campaign Card */}
                  <div className="rounded-xl border border-surface-200 dark:border-surface-800 p-4 bg-surface-50/50 dark:bg-surface-900/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-surface-500 font-medium">Campaign</span>
                        <Badge variant="warning" size="sm">
                          In Review
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 mt-2">
                        Nordic Audio Fall Launch
                      </h4>
                      <p className="text-xs text-surface-500 mt-1">
                        YouTube 60s Integration + X Post
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-surface-400">Deliverables</span>
                          <span className="font-semibold text-surface-700 dark:text-surface-300">3 of 4 Submitted</span>
                        </div>
                        <div className="w-full bg-surface-200 dark:bg-surface-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-600 h-full w-3/4 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between text-xs">
                      <span className="text-surface-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due Oct 24
                      </span>
                      <span className="font-bold text-surface-900 dark:text-surface-100">$3,200 Budget</span>
                    </div>
                  </div>

                  {/* Card 2: Collaboration Request Card */}
                  <div className="rounded-xl border border-surface-200 dark:border-surface-800 p-4 bg-surface-50/50 dark:bg-surface-900/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-surface-500 font-medium flex items-center gap-1.5">
                          <GitPullRequest className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                          Collaboration Request
                        </span>
                        <Badge variant="brand" size="sm">
                          New Request
                        </Badge>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Avatar name="Prism Keyboards" size="sm" />
                        <div>
                          <p className="text-xs font-bold text-surface-900 dark:text-surface-100">
                            Prism Keyboards
                          </p>
                          <span className="text-[10px] text-surface-400">Brand Partner</span>
                        </div>
                      </div>

                      <p className="text-xs text-surface-600 dark:text-surface-400 mt-2.5 leading-relaxed">
                        &quot;We loved your desk setup series. Would you be open to showcasing our wireless mechanical keyboard in November?&quot;
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-800 flex items-center gap-2">
                      <Button variant="primary" size="sm" className="w-full text-xs py-1.5">
                        Accept Request
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-xs py-1.5">
                        View Terms
                      </Button>
                    </div>
                  </div>

                  {/* Card 3: AI Match & Contract Card */}
                  <div className="rounded-xl border border-brand-200 dark:border-brand-900/70 p-4 bg-brand-50/30 dark:bg-brand-950/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> AI Match & Scope
                        </span>
                        <Badge variant="neutral" size="sm">
                          AI Suggestion
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100 mt-2.5">
                        Agreement Terms Analysis
                      </h4>

                      <ul className="mt-2 space-y-1.5 text-[11px] text-surface-600 dark:text-surface-400 leading-tight">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                          <span>AI suggestion: review these terms before accepting</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>60-day digital distribution window</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>Maximum 2 revision cycles specified</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-100 dark:border-brand-900/50 flex items-center justify-between text-xs text-surface-500">
                      <span>Rate benchmark:</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">Within typical range</span>
                    </div>
                  </div>
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
              Platform Modules
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl tracking-tight">
              A Complete Workspace for Creator Partnerships
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Organize campaigns, collaboration requests, contracts, revisions, and invoices without
              relying on disconnected chat apps or messy spreadsheets.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Standardized Briefs & Contracts
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Turn informal conversations into structured agreements specifying exact deliverables,
                  licensing periods, revision limits, and deadlines.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950/80 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-5">
                  <Users2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Collaboration Requests & Pipeline
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Receive inbound brand requests, negotiate terms in one central feed, and transition
                  accepted proposals straight into active campaign workflows.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                  <Workflow className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Deliverables Review Hub
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Submit video cuts, copy drafts, and social assets directly to brand reviewers with
                  clear version history and structured feedback threads.
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
                  Review contract clauses for common pitfalls, generate comprehensive creative briefs,
                  and ensure deliverables meet compliance standards.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Invoice & Payment Status Tracking
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">
                  Track invoices from draft to sent, review, and settled. Keep an accurate record of
                  completed work and outstanding balances across all partners.
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
                  Dedicated interfaces tailored for Creators, In-House Brands, Freelancers, and Talent
                  Managers to collaborate with clarity.
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
              Clear Workflow
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl tracking-tight">
              How Collaborations Move Forward
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              From the initial proposal to final deliverable sign-off and invoice tracking.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Request & Scope',
                desc: 'Send or receive collaboration proposals with required formats, key dates, and target audiences.',
              },
              {
                step: '02',
                title: 'Brief & Contract',
                desc: 'Establish clear agreements outlining creative guidelines, usage rights, and milestone deadlines.',
              },
              {
                step: '03',
                title: 'Submit & Review',
                desc: 'Upload drafts and review deliverables with timestamped revision requests and version control.',
              },
              {
                step: '04',
                title: 'Approve & Track Invoices',
                desc: 'Sign off on finished assets and update invoice statuses to keep accounting transparent and timely.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl p-6 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex flex-col justify-between shadow-subtle"
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
                  <Check className="w-3.5 h-3.5" /> Structured Milestone
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
              Role Solutions
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl tracking-tight">
              Tailored for Every Collaboration Partner
            </p>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Whether you are an independent creator producing content or a brand managing multiple
              concurrent campaigns, CreatorOS organizes the full workflow.
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
                        Spend more time creating, less time managing admin.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Keep all brand briefs, deadlines, content approvals, and invoice records in
                        one organized dashboard.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Structured campaign briefs with clear revision boundaries</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>AI contract scanner flags perpetual rights and ambiguity</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Clear invoice tracking from sent to paid</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Upcoming Deliverable</span>
                        <Badge variant="warning" size="sm">Due in 3 Days</Badge>
                      </div>
                      <p className="text-sm font-bold">YouTube 60s Integration: VPN Privacy</p>
                      <p className="text-xs text-surface-500">Brief status: Script approved, rough cut under review.</p>
                      <div className="pt-2 border-t border-surface-200 dark:border-surface-800 flex justify-between text-xs">
                        <span className="text-surface-500">Campaign Budget:</span>
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
                        Run multiple creator partnerships with confidence.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Centralize creator proposals, standardized briefs, asset reviews, and invoice
                        status in one collaborative dashboard.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Standardized brief templates for consistent campaign output</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Consolidated asset feedback and revision logs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Centralized invoice and campaign budget tracking</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Campaign Overview</span>
                        <Badge variant="success" size="sm">Q4 Holiday Push</Badge>
                      </div>
                      <p className="text-sm font-bold">18 Creators Engaged • $42,500 Budget</p>
                      <p className="text-xs text-surface-500">14 briefs signed, 8 rough cuts under review.</p>
                      <div className="pt-2 border-t border-surface-200 dark:border-surface-800 flex justify-between text-xs">
                        <span className="text-surface-500">Invoice Status:</span>
                        <span className="font-bold text-surface-900 dark:text-surface-100">6 Settled, 12 Pending</span>
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
                        For Editors & Strategists
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        The production layer for creator teams.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Editors, copywriters, and thumbnail artists can plug into creator workspaces
                        to upload assets, mark revisions, and manage sub-deliverables.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Task delegation and asset handover workflows</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Consolidated client comments on video revisions</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="text-xs font-semibold text-surface-500">Sub-Task Assigned</div>
                      <p className="text-sm font-bold">Render final 4K cut with brand bumper logo</p>
                      <p className="text-xs text-surface-500">Assigned by: Alex Morgan (Creator)</p>
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
                        For Talent Managers & Agencies
                      </Badge>
                      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                        Manage your entire roster in one place.
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-3 leading-relaxed">
                        Oversee multiple creator schedules, review inbound requests, track contract
                        obligations, and monitor campaign invoicing across brands.
                      </p>
                      <ul className="mt-5 space-y-2 text-xs text-surface-700 dark:text-surface-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Multi-creator pipeline with consolidated calendar</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Standardized contract review and approval flow</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6 space-y-3">
                      <div className="text-xs font-semibold text-surface-500">Agency Roster Metrics</div>
                      <p className="text-sm font-bold">24 Active Talents • 39 Active Contracts</p>
                      <p className="text-xs text-surface-500">All deliverables and invoices on schedule.</p>
                      <Badge variant="success" size="sm">Roster In Sync</Badge>
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
              <span>AI Intelligence</span>
            </div>
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 sm:text-4xl tracking-tight">
              AI Tools Purpose-Built for Creator Deals
            </h2>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-400">
              Not generic chatbots—specialized tools to clarify terms, draft briefs, and review compliance.
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
                      Contract & Rights Inspector
                    </h4>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      Terms Analysis
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Scans agreement terms for perpetual image rights, broad indemnity clauses, and
                  unclear exclusivity windows so negotiations proceed on fair grounds.
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
                      Creative Brief Generator
                    </h4>
                    <span className="text-xs text-accent-600 dark:text-accent-400 font-medium">
                      Scope Clarification
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Converts campaign objectives into clear creator briefs with required talking points,
                  disclaimer requirements, and asset specifications.
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
                      Deliverable Compliance Scanner
                    </h4>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Pre-Submission Checks
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Checks descriptions and captions for required sponsorship disclosure hashtags,
                  tracking URLs, and discount codes before sending for review.
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
                      Campaign Scope Benchmarks
                    </h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Format & Timeline Guidance
                    </span>
                  </div>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Provides reasonable timeline recommendations and deliverable checklist templates
                  based on content format and distribution platforms.
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
            Ready to organize your creator partnerships?
          </h2>
          <p className="mt-4 text-base text-brand-200 max-w-xl mx-auto">
            Experience a clear, collaborative workspace for campaigns, briefs, content reviews, and invoices.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Workspace
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
                The collaboration operating system connecting creators and brands through structured
                briefs, asset reviews, and invoice status tracking.
              </p>
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
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-850 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} CreatorOS AI. All rights reserved.</p>
            <p className="text-surface-400">
              Creator-brand collaboration and business management platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
