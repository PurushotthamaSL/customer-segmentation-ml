import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ClusterProfile } from '../types';
import { BarChart3 } from 'lucide-react';

interface Props {
  clusters: ClusterProfile[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dropdown p-3.5 rounded-xl border border-white/20 text-xs shadow-2xl space-y-1.5">
        <p className="font-bold text-white mb-1.5 border-b border-white/10 pb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5 text-lavender">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span>{item.name}:</span>
            </div>
            <strong className="text-white font-mono">
              {item.value} {item.dataKey === 'income' ? 'k$' : '/100'}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ClusterComparisonBarChart: React.FC<Props> = ({ clusters }) => {
  const data = clusters.map(c => {
    const inc = c.feature_means['Annual Income (k$)'] || 0;
    const spd = c.feature_means['Spending Score (1-100)'] || 0;
    const age = c.feature_means['Age'] || 0;

    return {
      name: c.label.length > 16 ? c.label.substring(0, 14) + '...' : c.label,
      fullName: c.label,
      income: inc,
      spending: spd,
      age: age,
      cluster_id: c.cluster_id
    };
  });

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Feature Benchmark Comparison
          </h3>
          <p className="text-xs text-lavender mt-0.5">Average Income vs Spending Score by segment</p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, bottom: 25, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#A3A8CC', fontSize: 11 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: '#A3A8CC', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
            />
            <Bar dataKey="income" name="Avg Annual Income ($k)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="spending" name="Avg Spending Score" fill="#06B6D4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
