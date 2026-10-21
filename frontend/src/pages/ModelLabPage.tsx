import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  Cpu,
  Download,
  RefreshCw,
  Code2
} from 'lucide-react';
import { fetchModelStatus, fetchElbowData } from '../services/api';
import { ModelMetadata, ElbowResponse } from '../types';
import { ElbowCurveChart } from '../components/ElbowCurveChart';
import { useToast } from '../components/ToastContext';

export const ModelLabPage: React.FC = () => {
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [elbow, setElbow] = useState<ElbowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, el] = await Promise.all([
        fetchModelStatus(),
        fetchElbowData({ min_k: 2, max_k: 10 })
      ]);
      setModel(m);
      setElbow(el);
    } catch (err: any) {
      addToast('error', 'Failed to load Model Lab data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecomputeElbow = async () => {
    setEvaluating(true);
    try {
      const el = await fetchElbowData({ min_k: 2, max_k: 10, features: model?.features });
      setElbow(el);
      addToast('success', 'Evaluation Complete', 'Elbow & Silhouette curves re-computed across K=2..10.');
    } catch (err: any) {
      addToast('error', 'Evaluation Failed', err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleDownloadModelJSON = () => {
    if (!model) return;
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CustomerLens_KMeans_Model_K${model.n_clusters}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Model Config Exported', 'Downloaded active fitted model metadata.');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Initializing Machine Learning Evaluation Lab...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            Machine Learning Evaluation Lab
          </h2>
          <p className="text-xs text-lavender mt-0.5">
            Empirical validation with Inertia (Sum of Squared Errors) and Silhouette score curves
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecomputeElbow}
            disabled={evaluating}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-button-secondary text-white flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>Re-evaluate K=2..10</span>
          </button>

          <button
            onClick={handleDownloadModelJSON}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-button-primary text-white flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Metadata JSON</span>
          </button>
        </div>
      </div>

      {/* Current Model Architecture Status */}
      {model && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs text-lavender font-medium">Active Architecture</p>
            <h4 className="text-lg font-bold text-white mt-1">Scikit-learn KMeans</h4>
            <p className="text-[11px] text-purple-300 mt-1 font-mono">
              n_init={model.n_init} • seed={model.random_state}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs text-lavender font-medium">Selected Features</p>
            <h4 className="text-lg font-bold text-white mt-1">{model.features.length} Features</h4>
            <p className="text-[11px] text-lavender mt-1 truncate" title={model.features.join(', ')}>
              {model.features.join(', ')}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs text-lavender font-medium">Model Inertia (SSE)</p>
            <h4 className="text-lg font-bold text-white mt-1">{model.inertia.toLocaleString()}</h4>
            <p className="text-[11px] text-emerald-400 mt-1">Standardized sum of squares</p>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs text-lavender font-medium">Silhouette Coefficient</p>
            <h4 className="text-lg font-bold text-white mt-1">{model.silhouette_score ?? 'N/A'}</h4>
            <p className="text-[11px] text-cyan-300 mt-1">Scale: -1.0 to +1.0</p>
          </div>
        </div>
      )}

      {/* Elbow Method & Silhouette Curve Chart */}
      {elbow && (
        <ElbowCurveChart
          points={elbow.points}
          recommendedK={elbow.recommended_k}
          silhouetteBestK={elbow.silhouette_best_k}
          explanation={elbow.explanation}
        />
      )}

      {/* Centroid Coordinate Matrix */}
      {model && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Cluster Centroid Coordinates (Original Space)
              </h3>
              <p className="text-xs text-lavender mt-0.5">
                The multidimensional centroid vector $\mu_k$ for each partition
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-lavender">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] bg-white/[0.04]">
                <tr>
                  <th className="py-3 px-4">Cluster</th>
                  <th className="py-3 px-4">Segment Name</th>
                  <th className="py-3 px-4">Customer Size</th>
                  {model.features.map(f => (
                    <th key={f} className="py-3 px-4">&mu; ({f})</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {model.clusters.map((c) => (
                  <tr key={c.cluster_id} className="hover:bg-white/[0.04] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      #{c.cluster_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {c.label}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white">{c.count}</span> ({c.percentage}%)
                    </td>
                    {model.features.map(f => (
                      <td key={f} className="py-3.5 px-4 font-mono text-purple-300 font-semibold">
                        {c.centroid_coordinates[f] !== undefined
                          ? c.centroid_coordinates[f].toFixed(2)
                          : (c.feature_means[f]?.toFixed(2) || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mathematical Principles Box */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          K-Means Mathematical Foundations & Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-purple-300">Inertia / Within-Cluster Sum of Squares (WCSS)</h4>
            <p>
              WCSS = &Sigma; (i=1..k) &Sigma; (x &isin; S_i) ||x - &mu;_i||&sup2;.
              Inertia quantifies internal cluster compactness. As K increases toward N, inertia naturally drops to zero.
              The Elbow Method searches for the point of diminishing returns where the rate of decrease abruptly slows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2">
            <h4 className="font-semibold text-cyan-300">Silhouette Coefficient</h4>
            <p>
              s(i) = (b(i) - a(i)) / max(a(i), b(i)), where a(i) is mean intra-cluster distance and b(i) is mean nearest-cluster distance.
              Values close to +1.0 indicate excellent cluster cohesion and separation; values near 0 imply overlapping clusters; negative values indicate misassigned points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
