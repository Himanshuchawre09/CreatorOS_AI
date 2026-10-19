import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Video,
  Instagram,
  Globe,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, CalendarPostItem, CollaborationRequestData } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Video className="w-3.5 h-3.5 text-red-500" />,
  instagram: <Instagram className="w-3.5 h-3.5 text-pink-500" />,
  tiktok: <Share2 className="w-3.5 h-3.5 text-cyan-500" />,
  twitch: <Share2 className="w-3.5 h-3.5 text-purple-500" />,
  blog: <Globe className="w-3.5 h-3.5 text-blue-500" />,
  other: <Share2 className="w-3.5 h-3.5 text-surface-400" />,
};

const STATUS_VARIANTS: Record<
  string,
  'default' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  draft: 'neutral',
  scheduled: 'warning',
  published: 'success',
  archived: 'default',
};

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collabs, setCollabs] = useState<CollaborationRequestData[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'instagram',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '12:00',
    collaborationId: '',
    status: 'scheduled',
  });

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCalendarPosts({ month, year });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load calendar posts');
    } finally {
      setLoading(false);
    }
  }, [month, year, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchCollabs = async () => {
    try {
      const res = await api.getRequests({ status: 'accepted' });
      if (res.success && res.data) {
        setCollabs(res.data as CollaborationRequestData[]);
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenModal = () => {
    fetchCollabs();
    setIsModalOpen(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const dateTimeString = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      const res = await api.createCalendarPost({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        platform: formData.platform,
        scheduledDate: new Date(dateTimeString).toISOString(),
        collaborationId: formData.collaborationId || undefined,
        status: formData.status,
      });

      if (res.success) {
        toast.success('Post added to calendar');
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          platform: 'instagram',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '12:00',
          collaborationId: '',
          status: 'scheduled',
        });
        fetchPosts();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await api.deleteCalendarPost(id);
      toast.success('Post deleted from calendar');
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  // Calendar Grid Math
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getPostsForDay = (day: number) => {
    return posts.filter((p) => {
      const d = new Date(p.scheduledDate);
      return d.getDate() === day && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Content Publishing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            Plan, organize, and track scheduled social media deliverables and campaign posts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl bg-surface-100 dark:bg-surface-800 p-1 border border-surface-200 dark:border-surface-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
              }`}
            >
              List
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="bg-white dark:bg-surface-900 p-3.5 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-100">
            {monthName} {year}
          </h2>
          <span className="text-xs text-surface-400">
            ({posts.length} {posts.length === 1 ? 'post' : 'posts'} scheduled)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} className="p-1.5">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            disabled={loading}
            className="text-xs px-2.5"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth} className="p-1.5">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'grid' ? (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-950/50 text-center py-2.5 text-xs font-bold text-surface-500">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-surface-100 dark:divide-surface-800/60">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] bg-surface-50/20 dark:bg-surface-950/20 p-2" />
            ))}

            {daysArray.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() + 1 === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-brand-50/30 dark:bg-brand-950/20' : 'hover:bg-surface-50/50 dark:hover:bg-surface-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-brand-600 text-white'
                          : 'text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-surface-400 font-semibold">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-hidden">
                    {dayPosts.map((post) => (
                      <div
                        key={post._id}
                        className="p-1.5 rounded-lg bg-surface-50 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700/60 flex items-start justify-between gap-1 shadow-2xs group"
                      >
                        <div className="flex items-start gap-1 min-w-0">
                          <span className="shrink-0 mt-0.5">
                            {PLATFORM_ICONS[post.platform] || PLATFORM_ICONS.other}
                          </span>
                          <span className="text-[11px] font-semibold text-surface-900 dark:text-surface-100 truncate block">
                            {post.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-rose-500 transition-opacity p-0.5"
                          title="Delete post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm divide-y divide-surface-100 dark:divide-surface-800/60 overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <CalendarIcon className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
                No posts scheduled for {monthName}
              </p>
              <p className="text-[11px] text-surface-400 mt-1 mb-3">
                Plan out content milestones and deliverables for your collaborations.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenModal}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Schedule a Post
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/60 dark:hover:bg-surface-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                    {PLATFORM_ICONS[post.platform] || PLATFORM_ICONS.other}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-100">
                      {post.title}
                    </h4>
                    {post.description && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-1 mt-0.5">
                        {post.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-surface-400">
                      <span className="capitalize font-medium">{post.platform}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.scheduledDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <Badge variant={STATUS_VARIANTS[post.status] || 'neutral'}>
                    {post.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post._id)}
                    className="text-surface-400 hover:text-rose-600 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Schedule New Post
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-surface-400 hover:text-surface-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Post Title *
                </label>
                <input
                  type="text"
                  maxLength={150}
                  placeholder="e.g. YouTube Video Launch: Productivity Routine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Platform *
                  </label>
                  <Select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    options={[
                      { value: 'instagram', label: 'Instagram' },
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'tiktok', label: 'TikTok' },
                      { value: 'twitch', label: 'Twitch' },
                      { value: 'blog', label: 'Blog / Article' },
                      { value: 'other', label: 'Other Platform' },
                    ]}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'scheduled', label: 'Scheduled' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'published', label: 'Published' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Link to Collaboration (Optional)
                </label>
                <Select
                  value={formData.collaborationId}
                  onChange={(e) => setFormData({ ...formData, collaborationId: e.target.value })}
                  options={[
                    { value: '', label: 'None (Standalone Post)' },
                    ...collabs.map((c) => ({
                      value: c._id,
                      label: `${(c.campaign as any)?.title || 'Campaign'} - ${
                        c.recipient?._id === user?._id ? c.sender?.name : c.recipient?.name
                      }`,
                    })),
                  ]}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Description / Caption Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Key hashtags, tags, or caption talking points..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl p-3 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Save Post'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
