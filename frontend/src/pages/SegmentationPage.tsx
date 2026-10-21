import React, { useEffect, useState } from 'react';
import {
  Users2,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  Target,
  Scale
} from 'lucide-react';
import { fetchModelStatus, trainModel, fetchScatterData, fetchDatasetSummary } from '../services/api';
import { ModelMetadata, ScatterDataResponse, DatasetSummary } from '../types';
import { CustomerScatterChart } from '../components/CustomerScatterChart';
import { EditLabelModal } from '../components/EditLabelModal';
import { useToast } from '../components/ToastContext';

export const SegmentationPage: React.FC = () => {
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [scatter, setScatter] = useState<ScatterDataResponse | null>(null);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);

  // Form State
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Annual Income (k$)',
    'Spending Score (1-100)'
  ]);
  const [nClusters, setNClusters] = useState<number>(5);
  const [useScaler, setUseScaler] = useState<boolean>(true);

  // Scatter plot axis selection
  const [xAxis, setXAxis] = useState<string>('Annual Income (k$)');
  const [yAxis, setYAxis] = useState<string>('Spending Score (1-100)');

  // Edit label modal
  const [editingClusterId, setEditingClusterId] = useState<number | null>(null);
  const [editingCurrentLabel, setEditingCurrentLabel] = useState<string>('');

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, sum] = await Promise.all([
        fetchModelStatus(),
        fetchDatasetSummary()
      ]);
      setModel(m);
      setSummary(sum);
      if (m.features && m.features.length >= 2) {
        setSelectedFeatures(m.features);
        setXAxis(m.features[0]);
        setYAxis(m.features[1]);
      }
      setNClusters(m.n_clusters);
      setUseScaler(m.use_scaler);

      const sc = await fetchScatterData(m.features[0], m.features[1]);
      setScatter(sc);
    } catch (err: any) {
      addToast('error', 'Failed to load model state', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFeatures.length < 2) {
      addToast('error', 'Invalid Selection', 'Please select at least 2 features for clustering.');
      return;
    }

    setTraining(true);
    try {
      const updatedModel = await trainModel({
        features: selectedFeatures,
        n_clusters: nClusters,
        use_scaler: useScaler
      });
      setModel(updatedModel);

      const sc = await fetchScatterData(xAxis, yAxis);
      setScatter(sc);

      addToast(
        'success',
        'Clustering Complete',
        `K-Means successfully trained with K=${nClusters} (Silhouette: ${updatedModel.silhouette_score ?? 'N/A'})`
      );
    } catch (err: any) {
      addToast('error', 'Training Failed', err.message);
    } finally {
      setTraining(false);
    }
  };

  const handleAxisChange = async (newX: string, newY: string) => {
    setXAxis(newX);
    setYAxis(newY);
    try {
      const sc = await fetchScatterData(newX, newY);
      setScatter(sc);
    } catch (err: any) {
      addToast('error', 'Failed to update chart axis', err.message);
    }
  };

  const availableNumericalFeatures = summary?.numerical_columns?.filter(c => !c.toLowerCase().includes('id')) || [
    'Age',
    'Annual Income (k$)',
    'Spending Score (1-100)'
  ];

  const toggleFeature = (f: string) => {
    if (selectedFeatures.includes(f)) {
      if (selectedFeatures.length <= 2) {
        addToast('error', 'Minimum Features Required', 'At least 2 features are required for clustering.');
        return;
      }
      setSelectedFeatures(selectedFeatures.filter(item => item !== f));
    } else {
      setSelectedFeatures([...selectedFeatures, f]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Configuring Customer Segmentation engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Model Configuration Form */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl">
        <form onSubmit={handleTrain} className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Clustering Hyperparameters & Feature Selection
            </h2>
            <span className="text-[11px] font-mono text-lavender">Seed: 42 • n_init: 10</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Feature Selection */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2.5">
                1. Select Numerical Features ({selectedFeatures.length} selected)
              </label>
              <div className="space-y-2">
                {availableNumericalFeatures.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
                        isChecked
                          ? 'bg-purple-600/25 border-purple-400/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                          : 'bg-white/[0.04] border-white/10 text-lavender hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      <span>{feat}</span>
                      <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-purple-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Cluster Count Slider */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-white">
                  2. Number of Clusters (K)
                </label>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  K = {nClusters}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={nClusters}
                onChange={(e) => setNClusters(parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-lavender mt-1 font-mono">
                <span>K=2</span>
                <span>K=5 (Recommended)</span>
                <span>K=10</span>
              </div>
              <p className="text-[11px] text-lavender mt-3 leading-relaxed">
                Mall Customers data typically reveals 5 distinct purchasing archetypes according to the Elbow inflection point.
              </p>
            </div>

            {/* 3. Preprocessing & Submit Button */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-white mb-2.5">
                  3. Feature Preprocessing
                </label>
                <button
                  type="button"
                  onClick={() => setUseScaler(!useScaler)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition ${
                    useScaler
                      ? 'bg-cyan-600/25 border-cyan-400/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.04] border-white/10 text-lavender'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span>StandardScaler (Z-Score)</span>
                  </div>
                  <span className={`text-[11px] font-bold ${useScaler ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {useScaler ? 'ENABLED' : 'DISABLED'}
                  </span>
                </button>
                <p className="text-[11px] text-lavender mt-2">
                  Equalizes feature variance so high-magnitude Income ($k) does not dominate Spending Score.
                </p>
              </div>

              <button
                type="submit"
                disabled={training}
                className="w-full mt-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider glass-button-primary text-white flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
              >
                {training ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Training K-Means Model...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Train K-Means Model</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Clustering Scatter Plot */}
      {scatter && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-lavender font-semibold">Plot Coordinates:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">X:</span>
                <select
                  value={xAxis}
                  onChange={(e) => handleAxisChange(e.target.value, yAxis)}
                  className="glass-dropdown px-3 py-1.5 rounded-xl text-xs text-white border border-white/10"
                >
                  {availableNumericalFeatures.map(f => (
                    <option key={f} value={f} className="bg-slate-900">{f}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Y:</span>
                <select
                  value={yAxis}
                  onChange={(e) => handleAxisChange(xAxis, e.target.value)}
                  className="glass-dropdown px-3 py-1.5 rounded-xl text-xs text-white border border-white/10"
                >
                  {availableNumericalFeatures.map(f => (
                    <option key={f} value={f} className="bg-slate-900">{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-lavender">
              Click 'Rename Label' below to customize the business interpretation for any cluster.
            </p>
          </div>

          <CustomerScatterChart
            points={scatter.points}
            centroids={scatter.centroids}
            xFeature={scatter.x_feature}
            yFeature={scatter.y_feature}
            title="Cluster Scatter Map with Dynamic Centroids"
            subtitle={`Visualizing ${scatter.points.length} customers partitioned across ${model?.n_clusters} clusters`}
          />
        </div>
      )}

      {/* Cluster Centroids & Profiles Table */}
      {model && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Cluster Centroid Vectors & Behavioral Profiles
              </h2>
              <p className="text-xs text-lavender mt-0.5">
                Computed statistical centers expressed in original unscaled data coordinates
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-lavender">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 bg-white/[0.04]">
                <tr>
                  <th className="py-3 px-4">Cluster ID</th>
                  <th className="py-3 px-4">Business Interpretation Label</th>
                  <th className="py-3 px-4">Size & Share</th>
                  {selectedFeatures.map(f => (
                    <th key={f} className="py-3 px-4">Centroid: {f}</th>
                  ))}
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {model.clusters.map((c) => (
                  <tr key={c.cluster_id} className="hover:bg-white/[0.04] transition">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[10px]"
                        style={{ backgroundColor: c.color }}
                      >
                        C-{c.cluster_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {c.label}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-white">{c.count}</span> <span className="text-lavender">({c.percentage}%)</span>
                    </td>
                    {selectedFeatures.map(f => (
                      <td key={f} className="py-3.5 px-4 font-mono text-purple-300 font-semibold">
                        {c.centroid_coordinates[f] !== undefined
                          ? c.centroid_coordinates[f].toFixed(1)
                          : (c.feature_means[f]?.toFixed(1) || '-')}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingClusterId(c.cluster_id);
                          setEditingCurrentLabel(c.label);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold glass-button-secondary text-purple-300 hover:text-white transition"
                      >
                        Rename Label
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Label Modal */}
      <EditLabelModal
        clusterId={editingClusterId}
        currentLabel={editingCurrentLabel}
        onClose={() => setEditingClusterId(null)}
        onSuccess={(cid, newLabel) => {
          if (model) {
            const updated = {
              ...model,
              clusters: model.clusters.map(c => c.cluster_id === cid ? { ...c, label: newLabel } : c)
            };
            setModel(updated);
          }
          if (scatter) {
            setScatter({
              ...scatter,
              points: scatter.points.map(p => p.cluster === cid ? { ...p, label: newLabel } : p),
              centroids: scatter.centroids.map(c => c.cluster === cid ? { ...c, label: `Centroid: ${newLabel}` } : c)
            });
          }
        }}
      />
    </div>
  );
};
