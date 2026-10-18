import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api, PortfolioItemData } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';

export const PortfolioManager: React.FC = () => {
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItemData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'image' | 'link' | 'article'>('video');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const { toast } = useToast();

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMyPortfolio();
      setItems(res.data || []);
    } catch (err: any) {
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setType('video');
    setUrl('');
    setThumbnailUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItemData) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setType(item.type);
    setUrl(item.url);
    setThumbnailUrl(item.thumbnailUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!url.trim() || !/^https?:\/\/.+/i.test(url.trim())) {
      setError('A valid URL starting with http:// or https:// is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem && editingItem._id) {
        await api.updatePortfolioItem(editingItem._id, {
          title: title.trim(),
          description: description.trim(),
          type,
          url: url.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
        });
        toast.success('Portfolio item updated successfully');
      } else {
        await api.createPortfolioItem({
          title: title.trim(),
          description: description.trim(),
          type,
          url: url.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
        });
        toast.success('Portfolio item added successfully');
      }
      setIsModalOpen(false);
      await loadPortfolio();
    } catch (err: any) {
      setError(err.message || 'Failed to save portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      await api.deletePortfolioItem(id);
      toast.success('Portfolio item deleted');
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
            Portfolio & Showcase
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Add featured videos, articles, and past campaign work for brands to discover.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Item
        </Button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center items-center text-surface-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 text-center bg-surface-50/50 dark:bg-surface-900/30">
          <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
            No portfolio items added yet
          </p>
          <p className="text-[11px] text-surface-500 mt-1 max-w-sm mx-auto">
            Upload your top performing videos, media kit links, or past deliverables so brands can evaluate your style.
          </p>
          <Button variant="primary" size="sm" className="mt-3" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex flex-col justify-between hover:border-surface-300 dark:hover:border-surface-700 transition-all shadow-subtle"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-800 dark:text-surface-200 truncate">
                    {getTypeIcon(item.type)}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 flex-shrink-0">
                    {item.type}
                  </span>
                </div>

                {item.description && (
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-surface-100 dark:border-surface-850 flex items-center justify-between text-xs">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>View Project</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit"
                    className="p-1 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Delete"
                    className="p-1 text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Item Title"
            placeholder="e.g. Mechanical Keyboard Desk Showcase"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Content Type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { label: 'Video Showcase', value: 'video' },
                { label: 'Image / Graphic', value: 'image' },
                { label: 'Article / Case Study', value: 'article' },
                { label: 'External Link', value: 'link' },
              ]}
            />
            <Input
              label="Destination URL"
              placeholder="https://youtube.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Description (Optional)"
            placeholder="Briefly describe the brief, audience reach, or metrics achieved..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Input
            label="Thumbnail URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              {editingItem ? 'Save Changes' : 'Add to Portfolio'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

