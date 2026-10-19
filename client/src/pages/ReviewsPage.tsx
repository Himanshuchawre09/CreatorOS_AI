import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  UserReviewsData,
  CollaborationRequestData,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviewsData, setReviewsData] = useState<UserReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Leave Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collabs, setCollabs] = useState<CollaborationRequestData[]>([]);

  const [formData, setFormData] = useState({
    collaborationId: '',
    rating: 5,
    comment: '',
  });

  const fetchReviews = useCallback(async () => {
    if (!user?._id && !user?.id) return;
    setLoading(true);
    try {
      const userId = (user._id || user.id)!;
      const res = await api.getUserReviews(userId);
      if (res.success && res.data) {
        setReviewsData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const fetchAcceptedCollabs = async () => {
    try {
      const res = await api.getRequests({ status: 'accepted' });
      if (res.success && res.data) {
        const list = res.data as CollaborationRequestData[];
        setCollabs(list);
        if (list.length > 0 && !formData.collaborationId) {
          setFormData((prev) => ({ ...prev, collaborationId: list[0]._id }));
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenModal = () => {
    fetchAcceptedCollabs();
    setIsModalOpen(true);
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collaborationId) {
      toast.error('Please select a collaboration');
      return;
    }
    if (!formData.comment.trim() || formData.comment.trim().length < 3) {
      toast.error('Review comment must be at least 3 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createReview({
        collaborationId: formData.collaborationId,
        rating: formData.rating,
        comment: formData.comment.trim(),
      });

      if (res.success) {
        toast.success('Review submitted successfully');
        setIsModalOpen(false);
        setFormData({
          collaborationId: '',
          rating: 5,
          comment: '',
        });
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100 flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Reviews & Reputation
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            Mutual feedback and ratings exchanged between brands and creators after collaboration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReviews} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Leave a Review
          </Button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="text-2xl font-black">{totalReviews > 0 ? averageRating.toFixed(1) : '-'}</span>
            <span className="text-[10px] font-bold">/ 5.0</span>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-surface-300 dark:text-surface-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">
              Overall Rating from {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
            <p className="text-[11px] text-surface-400">
              Ratings are recorded from genuine completed partnerships.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleOpenModal}>
          Rate a Collaboration
        </Button>
      </div>

      {/* Review List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
          Received Reviews ({totalReviews})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-surface-400 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <Star className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-surface-800 dark:text-surface-200">
              No reviews received yet
            </h4>
            <p className="text-[11px] text-surface-400 mt-1 mb-4">
              When brand partnerships reach completion, both parties can leave mutual ratings and testimonials.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenModal}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Leave First Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.reviewer?.name || 'Reviewer'} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-surface-900 dark:text-surface-100 block">
                          {r.reviewer?.name || 'Partner'}
                        </span>
                        <span className="text-[10px] text-surface-400 capitalize block">
                          {r.reviewer?.role || 'Partner'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= r.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-surface-300 dark:text-surface-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-surface-700 dark:text-surface-300 leading-relaxed italic bg-surface-50 dark:bg-surface-950 p-3 rounded-xl border border-surface-100 dark:border-surface-800">
                    &quot;{r.comment}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-[10px] text-surface-400">
                  <span>Verified Collaboration</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Submit Mutual Review
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-surface-400 hover:text-surface-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Collaboration *
                </label>
                {collabs.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No accepted collaborations found. You must have an accepted collaboration to leave a review.
                  </p>
                ) : (
                  <Select
                    value={formData.collaborationId}
                    onChange={(e) =>
                      setFormData({ ...formData, collaborationId: e.target.value })
                    }
                    options={collabs.map((c) => ({
                      value: c._id,
                      label: `${(c.campaign as any)?.title || 'Campaign'} - ${
                        c.recipient?._id === user?._id ? c.sender?.name : c.recipient?.name
                      }`,
                    }))}
                    className="w-full text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1.5">
                  Rating * ({formData.rating} / 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-surface-300 dark:text-surface-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 mb-1">
                  Review Comment *
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Share your experience working with this partner, professionalism, turnaround speed, quality of content..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                  className="w-full bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl p-3 text-xs text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-surface-400 mt-1 block">
                  Min 3 characters. Once submitted, reviews cannot be altered.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting || collabs.length === 0}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
