import React, { useEffect, useState } from 'react';
import {
  Layers,
  Edit3,
  Sparkles,
  Info,
  Compass
} from 'lucide-react';
import { fetchModelStatus } from '../services/api';
import { ModelMetadata } from '../types';
import { EditLabelModal } from '../components/EditLabelModal';
import { useToast } from '../components/ToastContext';

export const SegmentProfilesPage: React.FC = () => {
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingClusterId, setEditingClusterId] = useState<number | null>(null);
  const [editingCurrentLabel, setEditingCurrentLabel] = useState<string>('');
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const m = await fetchModelStatus();
      setModel(m);
    } catch (err: any) {
      addToast('error', 'Failed to load segment profiles', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Synthesizing behavioral segment profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Methodology Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3.5 backdrop-blur-xl">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Machine Learning Transparency Note: </strong>
          K-Means outputs mathematical cluster integers ($0, 1, 2, \dots$). The descriptive labels shown below
          (e.g., <em>High-Value Champions</em>, <em>Budget-Conscious Savers</em>) are
          derived through automated statistical centroid analysis and can be freely customized to align with your brand's marketing terminology.
        </div>
      </div>

      {/* Segment Cards Grid */}
      {model && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {model.clusters.map((c) => {
            const inc = c.feature_means['Annual Income (k$)'] ?? 0;
            const spd = c.feature_means['Spending Score (1-100)'] ?? 0;
            const age = c.feature_means['Age'];

            return (
              <div
                key={c.cluster_id}
                className="glass-card-interactive rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group space-y-5"
              >
                {/* Accent Top Border Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: c.color }}
                />

                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                          style={{ backgroundColor: c.color + '44', border: `1px solid ${c.color}88` }}
                        >
                          Cluster #{c.cluster_id}
                        </span>
                        <span className="text-xs text-lavender font-mono">
                          {c.count} Customers ({c.percentage}%)
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-purple-300 transition">
                        {c.label}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        setEditingClusterId(c.cluster_id);
                        setEditingCurrentLabel(c.label);
                      }}
                      className="p-2 rounded-xl glass-button-secondary text-lavender hover:text-white transition"
                      title="Rename this segment label"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantitative Stats */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                      <p className="text-[10px] text-lavender">Avg Income</p>
                      <p className="text-base font-bold text-white mt-0.5">${inc.toFixed(1)}k</p>
                      <span className="text-[10px] text-lavender font-mono">
                        Med: ${c.feature_medians['Annual Income (k$)'] ?? inc.toFixed(1)}k
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                      <p className="text-[10px] text-lavender">Avg Spending</p>
                      <p className="text-base font-bold text-white mt-0.5">{spd.toFixed(1)}/100</p>
                      <span className="text-[10px] text-lavender font-mono">
                        Med: {c.feature_medians['Spending Score (1-100)'] ?? spd.toFixed(1)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                      <p className="text-[10px] text-lavender">Avg Age</p>
                      <p className="text-base font-bold text-white mt-0.5">
                        {age !== undefined ? `${age.toFixed(1)}y` : 'N/A'}
                      </p>
                      <span className="text-[10px] text-lavender font-mono">Years</span>
                    </div>
                  </div>

                  {/* Distinguishing Characteristics */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      Key Distinguishing Traits
                    </p>
                    <ul className="space-y-1 text-xs text-slate-300 pl-2">
                      {c.characteristics.map((char, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested Marketing Strategy */}
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                  <p className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Marketing Strategy
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    {c.marketing_strategy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Label Modal */}
      <EditLabelModal
        clusterId={editingClusterId}
        currentLabel={editingCurrentLabel}
        onClose={() => setEditingClusterId(null)}
        onSuccess={(cid, newLabel) => {
          if (model) {
            setModel({
              ...model,
              clusters: model.clusters.map(c => c.cluster_id === cid ? { ...c, label: newLabel } : c)
            });
          }
        }}
      />
    </div>
  );
};
