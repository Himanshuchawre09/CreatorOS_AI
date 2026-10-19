import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { api, DeliverableData, CampaignStatus } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export const CampaignFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('');
  const [goals, setGoals] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [deliverables, setDeliverables] = useState<DeliverableData[]>([
    { type: 'YouTube Dedicated Video', count: 1, details: '60-90s integration segment' },
  ]);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const res = await api.getCampaignById(id);
        const c = res.data;
        if (c) {
          setTitle(c.title);
          setBrief(c.brief);
          setAudience(c.audience);
          setGoals(c.goals ? c.goals.join(', ') : '');
          setBudget(String(c.budget));
          setCurrency(c.currency || 'USD');
          setDeadline(c.deadline ? c.deadline.split('T')[0] : '');
          setStatus(c.status);
          if (c.deliverables && c.deliverables.length > 0) {
            setDeliverables(c.deliverables);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, isEdit]);

  const handleAddDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      { type: 'Instagram Reel', count: 1, details: '' },
    ]);
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (
    index: number,
    field: keyof DeliverableData,
    value: string | number
  ) => {
    setDeliverables((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Campaign title is required');
      return;
    }
    if (!brief.trim()) {
      setError('Campaign brief is required');
      return;
    }
    if (!audience.trim()) {
      setError('Target audience description is required');
      return;
    }
    if (deliverables.length === 0) {
      setError('At least one deliverable is required');
      return;
    }
    const numBudget = Number(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      setError('Budget must be a valid number of 0 or more');
      return;
    }
    if (!deadline) {
      setError('Deadline date is required');
      return;
    }

    const payload = {
      title: title.trim(),
      brief: brief.trim(),
      audience: audience.trim(),
      goals: goals
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      deliverables,
      budget: numBudget,
      currency: currency.trim() || 'USD',
      deadline: new Date(deadline).toISOString(),
      status,
    };

    try {
      setSaving(true);
      if (isEdit && id) {
        await api.updateCampaign(id, payload);
        toast.success('Campaign updated successfully!');
        navigate(`/campaigns/${id}`);
      } else {
        const created = await api.createCampaign(payload);
        toast.success('Campaign created successfully!');
        if (created.data?._id) {
          navigate(`/campaigns/${created.data._id}`);
        } else {
          navigate('/campaigns');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-surface-500">Loading campaign details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Campaigns</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-surface-900 dark:text-surface-50 tracking-tight">
            {isEdit ? 'Edit Campaign Brief' : 'Create New Campaign'}
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Specify requirements, deliverables, budget guidelines, and target timelines.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Brief Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Overview</CardTitle>
            <CardDescription>
              Basic parameters that creators evaluate when considering this sponsorship.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall Product Launch & Creator Reviews"
              required
            />

            <Textarea
              label="Campaign Brief & Objectives"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Explain the background, product details, creative requirements, and key talking points..."
              rows={4}
              maxLength={2000}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Tech enthusiasts, gamers aged 18-34"
                required
              />

              <Input
                label="Campaign Goals (comma-separated)"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Brand Awareness, Signups, Reach"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deliverables Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Required Deliverables</CardTitle>
              <CardDescription>
                Define the specific content items the creator is expected to produce.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDeliverable}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Item
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {deliverables.map((d, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-5">
                  <Input
                    label="Format / Type"
                    value={d.type}
                    onChange={(e) => handleDeliverableChange(index, 'type', e.target.value)}
                    placeholder="e.g. YouTube Video, Reel, Post"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={d.count}
                    onChange={(e) =>
                      handleDeliverableChange(index, 'count', Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <Input
                    label="Details / Notes"
                    value={d.details || ''}
                    onChange={(e) => handleDeliverableChange(index, 'details', e.target.value)}
                    placeholder="e.g. 60s integration, link in bio"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(index)}
                    disabled={deliverables.length <= 1}
                    title="Remove deliverable"
                    className="p-2 mb-0.5 rounded-lg text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Budget, Timeline & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Publishing Status</CardTitle>
            <CardDescription>
              Set financial parameters and control when this campaign is open for discovery.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Campaign Budget ($ USD)"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 2500"
                  required
                />
              </div>

              <div>
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' },
                    { label: 'GBP (£)', value: 'GBP' },
                    { label: 'CAD ($)', value: 'CAD' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Completion Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />

              <Select
                label="Campaign Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                options={[
                  { label: 'Draft (Private planning)', value: 'draft' },
                  { label: 'Open (Visible to creators in discovery)', value: 'open' },
                  ...(isEdit
                    ? [
                        { label: 'In Progress (Active collaborations)', value: 'inProgress' },
                        { label: 'Completed', value: 'completed' },
                        { label: 'Cancelled', value: 'cancelled' },
                      ]
                    : []),
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/campaigns">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEdit ? 'Save Changes' : 'Publish Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
};
