import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Send,
  AlertTriangle,
  Users,
  CheckCircle2,
  Download
} from 'lucide-react';
import { fetchInsights } from '../services/api';
import { BusinessInsightsResponse } from '../types';
import { useToast } from '../components/ToastContext';

export const InsightsPage: React.FC = () => {
  const [data, setData] = useState<BusinessInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchInsights()
      .then(setData)
      .catch((err) => addToast('error', 'Failed to load insights', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExportInsights = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CustomerLens_Business_Insights.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Insights Exported', 'Downloaded comprehensive strategy JSON report.');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Generating rule-based business intelligence playbooks...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Strategic Business Intelligence & Action Playbooks
          </h2>
          <p className="text-xs text-lavender mt-0.5">
            Omnichannel marketing recommendations derived transparently from cluster statistics and behavior
          </p>
        </div>

        <button
          onClick={handleExportInsights}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-button-secondary text-white flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Strategy Report</span>
        </button>
      </div>

      {/* AI Transparency & Methodology Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border-purple-500/30 bg-purple-950/20 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <ShieldCheck className="w-6 h-6 text-purple-300" />
        </div>
        <div className="space-y-1 text-xs">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
            AI Transparency & Academic Integrity Statement
          </span>
          <p className="text-slate-300 leading-relaxed">
            {data.ai_transparency_note}
          </p>
          <p className="text-purple-300 font-mono text-[11px] pt-1">
            Methodology: {data.methodology}
          </p>
        </div>
      </div>

      {/* Segment Playbooks Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Segment-Specific Growth & Retention Playbooks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.playbooks.map((p) => (
            <div
              key={p.cluster_id}
              className="glass-card-interactive rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider inline-block mb-1 shadow-sm"
                      style={{ backgroundColor: p.color + '44', border: `1px solid ${p.color}88` }}
                    >
                      {p.priority_tier}
                    </span>
                    <h4 className="text-lg font-bold text-white">{p.label}</h4>
                  </div>
                  <span className="text-xs font-mono text-lavender font-semibold">
                    {p.customer_count} customers ({p.percentage}%)
                  </span>
                </div>

                {/* Quantitative Context */}
                <div className="flex items-center gap-4 text-xs py-2 text-lavender border-b border-white/[0.08]">
                  <span>Income: <strong className="text-white">${p.income_avg}k</strong></span>
                  <span>Spending: <strong className="text-white">{p.spending_avg}/100</strong></span>
                  <span>Age: <strong className="text-white">{p.age_avg}y</strong></span>
                  <span className="ml-auto text-purple-300 font-bold">{p.urgency}</span>
                </div>

                {/* Tactical Actions */}
                <div className="pt-3 space-y-2">
                  <p className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Prescribed Tactical Actions
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1 pl-2">
                    {p.tactical_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">▸</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Channels */}
                <div className="pt-3">
                  <p className="text-[11px] font-semibold text-lavender mb-1.5 flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-cyan-400" />
                    Recommended Activation Channels
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.recommended_channels.map((ch, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.04] text-[11px] text-slate-300 border border-white/10"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retention Risk Factor */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs">
                <span className="font-semibold text-rose-300 flex items-center gap-1.5 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Primary Risk Factor
                </span>
                <p className="text-slate-300">{p.primary_risk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demographic Cohorts Analysis */}
      {data.demographic_insights && data.demographic_insights.length > 0 && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Demographic Age Cohorts Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.demographic_insights.map((cohort, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{cohort.cohort}</h4>
                  <span className="text-xs font-mono text-purple-300 font-semibold">{cohort.count} users</span>
                </div>
                <div className="text-xs text-lavender space-y-0.5">
                  <p>Avg Income: <strong className="text-white">${cohort.avg_income}k</strong></p>
                  <p>Avg Spending Score: <strong className="text-white">{cohort.avg_spending}/100</strong></p>
                </div>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-white/[0.06]">
                  {cohort.behavior}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
