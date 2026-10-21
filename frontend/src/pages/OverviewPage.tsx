import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { fetchDatasetSummary, fetchModelStatus, fetchScatterData, fetchInsights } from '../services/api';
import { DatasetSummary, ModelMetadata, ScatterDataResponse, BusinessInsightsResponse } from '../types';
import { CustomerScatterChart } from '../components/CustomerScatterChart';
import { ClusterDonutChart } from '../components/ClusterDonutChart';
import { ClusterComparisonBarChart } from '../components/ClusterComparisonBarChart';
import { useToast } from '../components/ToastContext';

export const OverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [scatter, setScatter] = useState<ScatterDataResponse | null>(null);
  const [insights, setInsights] = useState<BusinessInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, modelRes, scatterRes, insightsRes] = await Promise.all([
        fetchDatasetSummary(),
        fetchModelStatus(),
        fetchScatterData(),
        fetchInsights()
      ]);
      setSummary(sumRes);
      setModel(modelRes);
      setScatter(scatterRes);
      setInsights(insightsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      addToast('error', 'Dashboard Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Aggregating intelligent customer segmentation data...</p>
      </div>
    );
  }

  if (error || !summary || !model) {
    return (
      <div className="glass-card p-8 rounded-2xl max-w-xl mx-auto my-12 text-center border-rose-500/30">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Unable to load dashboard</h2>
        <p className="text-sm text-lavender mb-5">{error || 'Dataset or ML model not initialized.'}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={loadAllData}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-primary text-white flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading
          </button>
          <Link
            to="/dataset"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-secondary"
          >
            Manage Dataset
          </Link>
        </div>
      </div>
    );
  }

  const avgIncome = summary.summary_stats['Annual Income (k$)']?.mean || 0;
  const avgSpending = summary.summary_stats['Spending Score (1-100)']?.mean || 0;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* 4 Premium Frosted-Glass KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Customers */}
        <div className="glass-card-interactive p-5 sm:p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-lavender">Total Customers</p>
            <h3 className="text-3xl font-black text-white tracking-tight">{summary.total_rows}</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium pt-0.5">
              <span>●</span> {summary.is_kaggle_original ? 'Authentic Kaggle Dataset' : 'Custom Dataset'}
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)]">
            <Users className="w-6 h-6 text-purple-300" />
          </div>
        </div>

        {/* Number of Segments */}
        <div className="glass-card-interactive p-5 sm:p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-lavender">Number of Segments</p>
            <h3 className="text-3xl font-black text-white tracking-tight">{model.n_clusters}</h3>
            <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium pt-0.5">
              <span>●</span> K-Means (StandardScaler)
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Layers className="w-6 h-6 text-cyan-300" />
          </div>
        </div>

        {/* Average Annual Income */}
        <div className="glass-card-interactive p-5 sm:p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-lavender">Average Annual Income</p>
            <h3 className="text-3xl font-black text-white tracking-tight">${avgIncome.toFixed(1)}k</h3>
            <p className="text-[11px] text-lavender flex items-center gap-1 font-mono pt-0.5">
              Range: $15k - $137k
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <DollarSign className="w-6 h-6 text-indigo-300" />
          </div>
        </div>

        {/* Average Spending Score */}
        <div className="glass-card-interactive p-5 sm:p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-lavender">Average Spending Score</p>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {avgSpending.toFixed(1)}
              <span className="text-sm font-normal text-lavender">/100</span>
            </h3>
            <p className="text-[11px] text-purple-300 flex items-center gap-1 font-mono pt-0.5">
              Silhouette: <strong>{model.silhouette_score ?? 'N/A'}</strong>
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <TrendingUp className="w-6 h-6 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Row 2: Customer Segmentation Scatter Plot (Large) + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {scatter && (
            <CustomerScatterChart
              points={scatter.points}
              centroids={scatter.centroids}
              xFeature={scatter.x_feature}
              yFeature={scatter.y_feature}
              title="Customer Segmentation Spatial Matrix"
              subtitle="Partitioning customers by Annual Income and Spending Score with centroids"
            />
          )}
        </div>
        <div className="lg:col-span-1">
          <ClusterDonutChart
            clusters={model.clusters}
            totalCustomers={summary.total_rows}
          />
        </div>
      </div>

      {/* Row 3: Spending Comparison Chart + Customer Segment Profiles Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClusterComparisonBarChart clusters={model.clusters} />
        </div>

        {/* Customer Segment Profiles Quick Panel */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Segment Archetypes
              </h3>
              <Link to="/profiles" className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-0.5">
                <span>Profiles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 mt-3">
              {model.clusters.map((c) => (
                <div
                  key={c.cluster_id}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-purple-400/30 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{c.label}</p>
                      <p className="text-[10px] text-lavender">
                        Income: ${c.feature_means['Annual Income (k$)']}k • Spend: {c.feature_means['Spending Score (1-100)']}/100
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-white px-2 py-0.5 rounded bg-white/[0.06]">
                    {c.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.08]">
            <p className="text-[11px] text-lavender">
              Dynamic segment labels derived from multidimensional centroid distances.
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Business Insights Section with Concise Data-Driven Recommendations */}
      {insights?.executive_summary && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Data-Driven Business Intelligence Recommendations
              </h3>
              <p className="text-xs text-lavender mt-0.5">
                Rule-based tactical strategies derived transparently from cluster statistics
              </p>
            </div>
            <Link
              to="/insights"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-button-secondary text-purple-300 hover:text-white flex items-center gap-1"
            >
              <span>Explore Playbooks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High-Value Segment Card */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                Highest-Yield Cohort
              </span>
              <h4 className="font-bold text-sm text-white">
                {insights.executive_summary.highest_value_segment.label}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Customers with both high earning capacity (${insights.executive_summary.highest_value_segment.avg_income}k) and elevated purchase velocity. Enroll in VIP concierge services and exclusive early-access runway drops.
              </p>
            </div>

            {/* Dominant Segment Card */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                Dominant Customer Share
              </span>
              <h4 className="font-bold text-sm text-white">
                {insights.executive_summary.dominant_segment.label}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Represents {insights.executive_summary.dominant_segment.count} customers ({insights.executive_summary.dominant_segment.percentage}% of userbase). Deploy tiered milestone loyalty points to accelerate conversion frequency.
              </p>
            </div>

            {/* Methodology & Integrity Card */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                AI Transparency
              </span>
              <h4 className="font-bold text-sm text-white">
                Deterministic Rule Logic
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recommendations are calculated mathematically from standardized cluster centroids. No black-box or hallucinated generative text is utilized.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
