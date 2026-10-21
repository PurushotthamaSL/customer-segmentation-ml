import React, { useEffect, useState } from 'react';
import { CustomerDetailResponse } from '../types';
import { fetchCustomerDetail } from '../services/api';
import { X, User, Sparkles, Compass } from 'lucide-react';

interface Props {
  customerId: number | null;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<Props> = ({ customerId, onClose }) => {
  const [data, setData] = useState<CustomerDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId !== null) {
      setLoading(true);
      setError(null);
      fetchCustomerDetail(customerId)
        .then(setData)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [customerId]);

  if (customerId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-lg rounded-2xl p-6 sm:p-7 relative border border-white/20 shadow-2xl overflow-hidden space-y-5">
        {/* Glowing Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lavender hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-16 text-center text-lavender">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Retrieving customer intelligence profile...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400">
            <p className="font-semibold mb-1">Failed to load customer profile</p>
            <p className="text-xs text-lavender">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Header info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <User className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Customer #{data.customer.CustomerID}</h3>
                  {data.segment_info && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm"
                      style={{
                        backgroundColor: data.segment_info.color + '33',
                        color: '#FFFFFF',
                        border: `1px solid ${data.segment_info.color}88`
                      }}
                    >
                      {data.segment_info.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-lavender">
                  {data.customer.Gender || 'Customer'} • {data.customer.Age} years old
                </p>
              </div>
            </div>

            {/* Core Feature Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-center">
                <p className="text-[11px] text-lavender">Annual Income</p>
                <p className="text-lg font-bold text-white mt-0.5">${data.customer['Annual Income (k$)']}k</p>
                <span className="text-[10px] text-purple-300 font-mono">
                  {data.percentiles['Annual Income (k$)']}%ile
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-center">
                <p className="text-[11px] text-lavender">Spending Score</p>
                <p className="text-lg font-bold text-white mt-0.5">{data.customer['Spending Score (1-100)']}/100</p>
                <span className="text-[10px] text-cyan-300 font-mono">
                  {data.percentiles['Spending Score (1-100)']}%ile
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-center">
                <p className="text-[11px] text-lavender">Centroid Distance</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {data.distance_to_centroid !== null ? data.distance_to_centroid : 'N/A'}
                </p>
                <span className="text-[10px] text-lavender font-mono">Euclidean</span>
              </div>
            </div>

            {/* Cluster Affiliation */}
            {data.segment_info && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Compass className="w-4 h-4" />
                  <span>Cluster Segment Characteristics</span>
                </div>
                <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                  {data.segment_info.characteristics.map((char, i) => (
                    <li key={i}>{char}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tailored Marketing Strategy */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-4 h-4" />
                <span>Tailored Marketing Recommendation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {data.key_recommendation}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold glass-button-secondary transition"
              >
                Close Profile
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
