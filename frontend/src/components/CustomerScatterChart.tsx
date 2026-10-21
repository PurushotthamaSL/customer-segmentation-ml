import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ScatterPoint, ScatterCentroid } from '../types';
import { Target, Layers, Sparkles } from 'lucide-react';

interface Props {
  points: ScatterPoint[];
  centroids: ScatterCentroid[];
  xFeature: string;
  yFeature: string;
  title?: string;
  subtitle?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isCentroid = data.isCentroid;

    if (isCentroid) {
      return (
        <div className="glass-dropdown p-3.5 rounded-xl border border-purple-500/40 text-xs shadow-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold mb-1">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>{data.label}</span>
          </div>
          <div className="space-y-0.5 text-lavender font-mono text-[11px]">
            <p>X Centroid: <span className="text-white font-semibold">{data.x.toFixed(1)}</span></p>
            <p>Y Centroid: <span className="text-white font-semibold">{data.y.toFixed(1)}</span></p>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-dropdown p-3.5 rounded-xl border border-white/15 text-xs shadow-2xl space-y-1.5">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5">
          <span className="font-bold text-white">Customer #{data.id}</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: data.color + '44', border: `1px solid ${data.color}` }}
          >
            {data.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-lavender pt-0.5">
          <span>Income: <strong className="text-white">${data.x}k</strong></span>
          <span>Spending: <strong className="text-white">{data.y}/100</strong></span>
          {data.age && <span>Age: <strong className="text-white">{data.age} yrs</strong></span>}
          <span>Gender: <strong className="text-white">{data.gender}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

export const CustomerScatterChart: React.FC<Props> = ({
  points,
  centroids,
  xFeature,
  yFeature,
  title = "Customer Segmentation Scatter Plot",
  subtitle = "Color-coded customer clusters with calculated centroids"
}) => {
  const [showCentroids, setShowCentroids] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  const filteredPoints = selectedCluster !== null
    ? points.filter(p => p.cluster === selectedCluster)
    : points;

  const centroidPoints = centroids.map(c => ({
    ...c,
    id: `centroid-${c.cluster}`,
    isCentroid: true
  }));

  const uniqueClusters = Array.from(
    new Map(points.map(p => [p.cluster, { id: p.cluster, label: p.label, color: p.color }])).values()
  ).sort((a, b) => a.id - b.id);

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col h-full space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            {title}
          </h3>
          <p className="text-xs text-lavender mt-0.5">{subtitle}</p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCentroids(!showCentroids)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              showCentroids
                ? 'bg-purple-600/30 text-purple-200 border border-purple-400/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'glass-button-secondary'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Centroids</span>
          </button>

          <button
            onClick={() => setSelectedCluster(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedCluster === null
                ? 'bg-white/[0.12] text-white border border-white/20'
                : 'glass-button-secondary'
            }`}
          >
            All Clusters
          </button>
        </div>
      </div>

      {/* Cluster Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {uniqueClusters.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCluster(selectedCluster === c.id ? null : c.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCluster === c.id
                ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#080B18] text-white bg-white/10'
                : 'bg-white/[0.04] text-lavender hover:text-white hover:bg-white/[0.08]'
            }`}
            style={{ border: `1px solid ${c.color}66` }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Scatter Canvas */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              type="number"
              dataKey="x"
              name={xFeature}
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#A3A8CC', fontSize: 11 }}
              unit={xFeature.includes('Income') ? 'k$' : ''}
              label={{
                value: xFeature,
                position: 'insideBottom',
                offset: -15,
                fill: '#A3A8CC',
                fontSize: 12
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yFeature}
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#A3A8CC', fontSize: 11 }}
              label={{
                value: yFeature,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#A3A8CC',
                fontSize: 12
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Customer Points */}
            <Scatter name="Customers" data={filteredPoints}>
              {filteredPoints.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.8}
                  stroke={entry.color}
                  strokeWidth={1.5}
                />
              ))}
            </Scatter>

            {/* Cluster Centroids */}
            {showCentroids && (
              <Scatter name="Centroids" data={centroidPoints} shape="cross">
                {centroidPoints.map((entry, index) => (
                  <Cell
                    key={`centroid-${index}`}
                    fill="#FFFFFF"
                    stroke={entry.color}
                    strokeWidth={3}
                  />
                ))}
              </Scatter>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-lavender pt-2 border-t border-white/[0.08]">
        <span>Showing {filteredPoints.length} of {points.length} customers</span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Cross markers indicate computed cluster centroids</span>
        </span>
      </div>
    </div>
  );
};
