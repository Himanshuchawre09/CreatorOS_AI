import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Eye,
  Upload,
  Download,
  FileCheck,
  AlertCircle,
  FileText,
  Video,
  Image as ImageIcon,
  MessageSquare,
  History,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  SubmissionData,
  SubmissionStatus,
  CollaborationRequestData,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';

const STATUS_VARIANTS: Record<
  SubmissionStatus,
  'default' | 'success' | 'warning' | 'danger' | 'accent'
> = {
  pending: 'warning',
  approved: 'success',
  changesRequested: 'danger',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Under Review',
  approved: 'Approved',
  changesRequested: 'Changes Requested',
};

export const ContentReviewPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [collaborations, setCollaborations] = useState<CollaborationRequestData[]>([]);
  const [selectedCollabId, setSelectedCollabId] = useState<string>('');
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);

  const [loadingCollabs, setLoadingCollabs] = useState<boolean>(true);
  const [loadingSubs, setLoadingSubs] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Revision modal state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [revisionTargetId, setRevisionTargetId] = useState<string>('');
  const [revisionTitle, setRevisionTitle] = useState<string>('');
  const [revisionDescription, setRevisionDescription] = useState<string>('');
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);

  // Review modal state (Brand)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewTargetId, setReviewTargetId] = useState<string>('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'requestChanges'>('approve');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // History expanded state
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  // Fetch accepted collaborations
  const fetchCollaborations = useCallback(async () => {
    try {
      setLoadingCollabs(true);
      setError(null);
      const res = await api.getRequests({ status: 'accepted' });
      if (res.success && res.data) {
        setCollaborations(res.data);
        const queryCollab = searchParams.get('collaboration');
        if (queryCollab && res.data.some((c) => c._id === queryCollab)) {
          setSelectedCollabId(queryCollab);
        } else if (res.data.length > 0 && res.data[0]) {
          setSelectedCollabId(res.data[0]._id);
        }
      } else {
        setError(res.message || 'Failed to load collaborations');
      }
    } catch {
      setError('An error occurred while loading collaborations');
    } finally {
      setLoadingCollabs(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  // Selected collaboration object
  const activeCollaboration = useMemo(() => {
    return collaborations.find((c) => c._id === selectedCollabId) || null;
  }, [collaborations, selectedCollabId]);

  // User role relative to active collaboration
  const isBrand = useMemo(() => {
    if (!activeCollaboration || !user) return false;
    return activeCollaboration.brand?._id === user._id || user.role === 'brand';
  }, [activeCollaboration, user]);

  const isCreator = useMemo(() => {
    if (!activeCollaboration || !user) return false;
    return activeCollaboration.creator?._id === user._id || user.role === 'creator';
  }, [activeCollaboration, user]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    if (!selectedCollabId) {
      setSubmissions([]);
      return;
    }
    try {
      setLoadingSubs(true);
      const res = await api.getSubmissions({ collaborationId: selectedCollabId });
      if (res.success && res.data) {
        setSubmissions(res.data);
      } else {
        toast.error(res.message || 'Failed to load submissions', 'Error');
      }
    } catch {
      toast.error('An error occurred while loading submissions', 'Error');
    } finally {
      setLoadingSubs(false);
    }
  }, [selectedCollabId, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSelectCollaboration = (collabId: string) => {
    setSelectedCollabId(collabId);
    setSearchParams({ collaboration: collabId });
  };

  const toggleHistory = (subId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  // Upload initial deliverable
  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !uploadTitle.trim() || !selectedFile) {
      toast.warning('Please enter a title and select a valid deliverable file', 'Missing fields');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('collaborationId', selectedCollabId);
      formData.append('title', uploadTitle.trim());
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription.trim());
      }
      formData.append('file', selectedFile);

      const res = await api.createSubmission(formData);
      if (res.success && res.data) {
        setSubmissions((prev) => [res.data!, ...prev]);
        setIsUploadModalOpen(false);
        setUploadTitle('');
        setUploadDescription('');
        setSelectedFile(null);
        toast.success('Deliverable uploaded for review', 'Submitted');
      } else {
        toast.error(res.message || 'Failed to submit deliverable', 'Upload Error');
      }
    } catch {
      toast.error('File signature verification failed or file exceeds 25MB', 'Upload Error');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTargetId || !revisionFile) {
      toast.warning('Please select a replacement file for this revision', 'Missing file');
      return;
    }

    try {
      setIsSubmittingRevision(true);
      const formData = new FormData();
      if (revisionTitle.trim()) {
        formData.append('title', revisionTitle.trim());
      }
      if (revisionDescription.trim()) {
        formData.append('description', revisionDescription.trim());
      }
      formData.append('file', revisionFile);

      const res = await api.submitRevision(revisionTargetId, formData);
      if (res.success && res.data) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === revisionTargetId ? res.data! : s))
        );
        setIsRevisionModalOpen(false);
        setRevisionTargetId('');
        setRevisionTitle('');
        setRevisionDescription('');
        setRevisionFile(null);
        toast.success('New revision uploaded and submitted for review', 'Revision Submitted');
      } else {
        toast.error(res.message || 'Failed to submit revision', 'Error');
      }
    } catch {
      toast.error('File signature verification failed or file exceeds 25MB', 'Revision Error');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Review submission (Brand)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetId) return;

    try {
      setIsSubmittingReview(true);
      const res = await api.reviewSubmission(reviewTargetId, {
        action: reviewAction,
        comment: reviewComment.trim() || undefined,
      });

      if (res.success && res.data) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === reviewTargetId ? res.data! : s))
        );
        setIsReviewModalOpen(false);
        setReviewTargetId('');
        setReviewComment('');
        toast.success(
          reviewAction === 'approve'
            ? 'Deliverable approved successfully'
            : 'Changes requested on deliverable',
          'Review Submitted'
        );
      } else {
        toast.error(res.message || 'Failed to submit review', 'Error');
      }
    } catch {
      toast.error('Failed to submit review decision', 'Error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="w-6 h-6 text-brand-500" />
            Content Review & Approvals
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review draft content, request revisions with feedback, and give final sign-offs.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          {collaborations.length > 0 && (
            <>
              <div className="w-64">
                <Select
                  value={selectedCollabId}
                  onChange={(e) => handleSelectCollaboration(e.target.value)}
                  options={collaborations.map((c) => ({
                    value: c._id,
                    label: `${c.campaign?.title || 'Collaboration'} (${
                      c.sender._id === user?._id
                        ? c.recipient.name
                        : c.sender.name
                    })`,
                  }))}
                />
              </div>

              {isCreator && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  Upload Deliverable
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loadingCollabs ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 rounded-xl">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCollaborations}>
            Retry
          </Button>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
          <FileCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No active collaborations yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Once a collaboration request is accepted by both parties, content deliverables can be submitted and reviewed here.
          </p>
        </div>
      ) : loadingSubs ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
          <Upload className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No deliverables submitted yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {isCreator
              ? 'Click "Upload Deliverable" above to submit your draft video, photo, or PDF for brand review.'
              : 'Waiting for the creator to upload draft deliverables for your review.'}
          </p>
        </div>
      ) : (
        /* Submissions list */
        <div className="space-y-5">
          {submissions.map((sub) => {
            const hasHistory = sub.revisions && sub.revisions.length > 0;
            const isExpanded = !!expandedHistory[sub._id];

            return (
              <div
                key={sub._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(sub.file.mimeType)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.title}
                        </h3>
                        <Badge variant="neutral" className="text-xs px-2 py-0.5">
                          v{sub.version}
                        </Badge>
                        <Badge variant={STATUS_VARIANTS[sub.status]}>
                          {STATUS_LABELS[sub.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Submitted by {sub.creator?.name || 'Creator'} •{' '}
                        {new Date(sub.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={api.getDownloadFileUrl(sub._id)}
                      download={sub.file.originalName}
                      className="inline-flex items-center"
                    >
                      <Button variant="outline" size="sm">
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download ({formatFileSize(sub.file.size)})
                      </Button>
                    </a>

                    {isBrand && sub.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setReviewTargetId(sub._id);
                          setReviewAction('approve');
                          setReviewComment('');
                          setIsReviewModalOpen(true);
                        }}
                      >
                        <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                        Review Deliverable
                      </Button>
                    )}

                    {isCreator && sub.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRevisionTargetId(sub._id);
                          setRevisionTitle(sub.title);
                          setRevisionDescription(sub.description || '');
                          setRevisionFile(null);
                          setIsRevisionModalOpen(true);
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Upload Revision
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {sub.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg">
                    {sub.description}
                  </p>
                )}

                {/* Feedback box if feedback exists */}
                {sub.feedback && (
                  <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
                      Brand Feedback:
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                      {sub.feedback}
                    </p>
                  </div>
                )}

                {/* Revision history toggle */}
                {hasHistory && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => toggleHistory(sub._id)}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition"
                    >
                      <History className="w-3.5 h-3.5 text-neutral-400" />
                      {isExpanded ? 'Hide' : 'View'} Revision History ({sub.revisions.length} previous)
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2.5 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                        {sub.revisions.map((rev, revIdx) => (
                          <div
                            key={revIdx}
                            className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs space-y-1.5 bg-neutral-50/50 dark:bg-neutral-900/50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                Version {rev.version}
                              </span>
                              <Badge variant={STATUS_VARIANTS[rev.status]} className="text-[10px]">
                                {STATUS_LABELS[rev.status]}
                              </Badge>
                            </div>
                            <p className="text-neutral-400">
                              {rev.file.originalName} ({formatFileSize(rev.file.size)}) •{' '}
                              {new Date(rev.submittedAt).toLocaleDateString()}
                            </p>
                            {rev.feedback && (
                              <p className="text-neutral-500 italic">
                                &ldquo;{rev.feedback}&rdquo;
                              </p>
                            )}
                            <div className="pt-1">
                              <a
                                href={api.getDownloadFileUrl(sub._id, rev.version)}
                                download={rev.file.originalName}
                                className="text-brand-500 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download v{rev.version}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Initial Deliverable Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Upload Deliverable
            </h3>
            <p className="text-xs text-neutral-500">
              Supported file types: PNG, JPEG, PDF, MP4 (Max 25MB). Files are securely stored and verified.
            </p>

            <form onSubmit={handleUploadDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Deliverable Title *
                </label>
                <Input
                  required
                  placeholder="e.g. YouTube Video Draft Cut"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Notes
                </label>
                <Textarea
                  placeholder="Provide context or instructions for the reviewer..."
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Select File *
                </label>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,application/pdf,video/mp4"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-200 hover:file:bg-neutral-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUploading}
                >
                  Upload & Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Upload Revision
            </h3>
            <p className="text-xs text-neutral-500">
              Uploading a new revision preserves the previous version in history and resets the review status to Pending.
            </p>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Deliverable Title
                </label>
                <Input
                  value={revisionTitle}
                  onChange={(e) => setRevisionTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Revision Notes
                </label>
                <Textarea
                  placeholder="Describe what changes were made in this revision..."
                  rows={3}
                  value={revisionDescription}
                  onChange={(e) => setRevisionDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Select New File *
                </label>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,application/pdf,video/mp4"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRevisionFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-200 hover:file:bg-neutral-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRevisionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingRevision}
                >
                  Submit Revision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Review Deliverable
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Decision *
                </label>
                <Select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value as 'approve' | 'requestChanges')}
                  options={[
                    { value: 'approve', label: 'Approve Deliverable' },
                    { value: 'requestChanges', label: 'Request Changes' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Feedback Comment {reviewAction === 'requestChanges' && '*'}
                </label>
                <Textarea
                  required={reviewAction === 'requestChanges'}
                  placeholder={
                    reviewAction === 'approve'
                      ? 'Add any final praise or sign-off notes (optional)...'
                      : 'Specify the required revisions and timestamps...'
                  }
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={reviewAction === 'approve' ? 'primary' : 'danger'}
                  size="sm"
                  isLoading={isSubmittingReview}
                >
                  {reviewAction === 'approve' ? 'Confirm Approval' : 'Send Change Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
