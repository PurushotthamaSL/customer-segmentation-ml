import React, { useState } from 'react';
import { X, Tag, Save } from 'lucide-react';
import { updateSegmentLabel } from '../services/api';
import { useToast } from './ToastContext';

interface Props {
  clusterId: number | null;
  currentLabel: string;
  onClose: () => void;
  onSuccess: (clusterId: number, newLabel: string) => void;
}

export const EditLabelModal: React.FC<Props> = ({
  clusterId,
  currentLabel,
  onClose,
  onSuccess
}) => {
  const [label, setLabel] = useState(currentLabel);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (clusterId === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setLoading(true);
    try {
      await updateSegmentLabel(clusterId, label.trim());
      addToast('success', 'Segment Renamed', `Cluster ${clusterId} updated to "${label.trim()}"`);
      onSuccess(clusterId, label.trim());
      onClose();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-md rounded-2xl p-6 sm:p-7 relative border border-white/20 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lavender hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Tag className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Customize Segment Label</h3>
            <p className="text-xs text-lavender">Cluster {clusterId} Business Interpretation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
              Business Interpretation Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Affluent Champions, Budget Seekers..."
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
              required
            />
            <p className="text-[11px] text-lavender mt-1.5">
              Note: This updates the human-readable marketing label and does not alter underlying K-Means mathematical centroids.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !label.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-primary text-white flex items-center gap-1.5 disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Label'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
