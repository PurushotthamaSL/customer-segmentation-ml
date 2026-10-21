import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ClusterProfile } from '../types';
import { PieChart as PieIcon } from 'lucide-react';

interface Props {
  clusters: ClusterProfile[];
  totalCustomers: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-dropdown p-3 rounded-xl border border-white/20 text-xs shadow-2xl space-y-1">
        <p className="font-bold text-white mb-1" style={{ color: data.color }}>
          {data.label}
        </p>
        <p className="text-lavender">
          Customers: <strong className="text-white font-mono">{data.count}</strong>
        </p>
        <p className="text-lavender">
          Proportion: <strong className="text-white font-mono">{data.percentage}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export const ClusterDonutChart: React.FC<Props> = ({ clusters, totalCustomers }) => {
  const data = clusters.map(c => ({
    name: c.label,
    label: c.label,
    value: c.count,
    count: c.count,
    percentage: c.percentage,
    color: c.color
  }));

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            Segment Distribution
          </h3>
          <p className="text-xs text-lavender mt-0.5">Share of customers by cluster</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
          {totalCustomers} Total
        </span>
      </div>

      {/* Donut with Center Counter */}
      <div className="w-full h-56 relative my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`donut-cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(8, 11, 24, 0.8)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-white">{clusters.length}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-lavender">Segments</span>
        </div>
      </div>

      {/* Frosted Legend Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
        {clusters.map((c) => (
          <div key={c.cluster_id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate text-white text-[11px] font-medium">{c.label}</span>
            </div>
            <span className="font-mono text-lavender text-[11px] shrink-0 font-semibold">{c.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
