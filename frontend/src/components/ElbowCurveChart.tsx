import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { ElbowPoint } from '../types';
import { TrendingDown, Sparkles } from 'lucide-react';

interface Props {
  points: ElbowPoint[];
  recommendedK: number;
  silhouetteBestK?: number | null;
  explanation: string;
}

export const ElbowCurveChart: React.FC<Props> = ({
  points,
  recommendedK,
  explanation
}) => {
  const [metric, setMetric] = useState<'both' | 'inertia' | 'silhouette'>('both');
  const recPoint = points.find(p => p.k === recommendedK);

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-purple-400" />
            Elbow Method & Silhouette Evaluation
          </h3>
          <p className="text-xs text-lavender mt-0.5">Evaluating cluster compactness & separation across K values</p>
        </div>

        {/* Metric Toggles */}
        <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setMetric('both')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              metric === 'both' ? 'bg-purple-600/40 text-white shadow-sm' : 'text-lavender hover:text-white'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setMetric('inertia')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              metric === 'inertia' ? 'bg-purple-600/40 text-white shadow-sm' : 'text-lavender hover:text-white'
            }`}
          >
            Inertia (SSE)
          </button>
          <button
            onClick={() => setMetric('silhouette')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              metric === 'silhouette' ? 'bg-cyan-600/40 text-white shadow-sm' : 'text-lavender hover:text-white'
            }`}
          >
            Silhouette
          </button>
        </div>
      </div>

      {/* Line Chart */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 15, right: 25, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="k"
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#A3A8CC', fontSize: 11 }}
              label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -10, fill: '#A3A8CC', fontSize: 11 }}
            />
            
            {/* Left Axis: Inertia */}
            {(metric === 'both' || metric === 'inertia') && (
              <YAxis
                yAxisId="left"
                stroke="#8b5cf6"
                tick={{ fill: '#a78bfa', fontSize: 11 }}
                label={{ value: 'Inertia (SSE)', angle: -90, position: 'insideLeft', offset: 0, fill: '#a78bfa', fontSize: 11 }}
              />
            )}

            {/* Right Axis: Silhouette */}
            {(metric === 'both' || metric === 'silhouette') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#06b6d4"
                tick={{ fill: '#67e8f9', fontSize: 11 }}
                domain={[0, 1]}
                label={{ value: 'Silhouette Score', angle: 90, position: 'insideRight', offset: 0, fill: '#67e8f9', fontSize: 11 }}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="glass-dropdown p-3.5 rounded-xl border border-white/20 text-xs shadow-2xl space-y-1">
                      <p className="font-bold text-white">Clusters: K = {d.k}</p>
                      <p className="text-purple-300">Inertia: <strong className="text-white font-mono">{d.inertia.toLocaleString()}</strong></p>
                      {d.silhouette_score !== null && (
                        <p className="text-cyan-300">Silhouette Score: <strong className="text-white font-mono">{d.silhouette_score}</strong></p>
                      )}
                      {d.k === recommendedK && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50">
                          Recommended Elbow Point
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {(metric === 'both' || metric === 'inertia') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="inertia"
                name="Inertia"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4.5, strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 7 }}
              />
            )}

            {(metric === 'both' || metric === 'silhouette') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="silhouette_score"
                name="Silhouette Score"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4.5, strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 7 }}
              />
            )}

            {recPoint && (metric === 'both' || metric === 'inertia') && (
              <ReferenceDot
                yAxisId="left"
                x={recommendedK}
                y={recPoint.inertia}
                r={8}
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heuristic Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-lavender flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold">Automated Heuristic: </strong>
          <span>{explanation}</span>
        </div>
      </div>
    </div>
  );
};
