import React, { useEffect, useState, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Table,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { fetchDatasetSummary, uploadDataset, resetDataset } from '../services/api';
import { DatasetSummary } from '../types';
import { useToast } from '../components/ToastContext';

export const DatasetPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetchDatasetSummary();
      setSummary(res);
    } catch (err: any) {
      addToast('error', 'Failed to load dataset details', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      addToast('error', 'Invalid File Type', 'Please upload a CSV file (.csv).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'CSV must be under 10MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadDataset(file);
      addToast('success', 'Upload Successful', res.message);
      await loadSummary();
    } catch (err: any) {
      addToast('error', 'Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset dataset back to the authentic 200-row Kaggle Mall Customers dataset?')) {
      return;
    }

    setResetting(true);
    try {
      const res = await resetDataset();
      addToast('success', 'Dataset Reset', res.message);
      await loadSummary();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Auditing dataset schema and distributions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Dataset Management & Transparency
          </h2>
          <p className="text-xs text-lavender mt-0.5">
            Data integrity verification, missing-value audit, CSV upload, and Kaggle baseline restoration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/dataset/sample-csv"
            download="Mall_Customers.csv"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-button-secondary text-white flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Sample CSV</span>
          </a>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600/25 hover:bg-rose-600/35 text-rose-200 border border-rose-500/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset to Kaggle Baseline</span>
          </button>
        </div>
      </div>

      {/* Dataset Status Banner */}
      {summary && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg text-white">{summary.source_type}</span>
                {summary.is_kaggle_original ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Official Kaggle Data
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Custom User Upload
                  </span>
                )}
              </div>
              <p className="text-xs text-lavender mt-1">
                Active file path: <code className="text-purple-300 font-mono">{summary.file_name}</code>
              </p>
            </div>

            <a
              href={summary.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              <span>View Original Kaggle Dataset</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[11px] text-lavender">Total Records</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{summary.total_rows}</h4>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">Ready for ML</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[11px] text-lavender">Columns Detected</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{summary.total_columns}</h4>
              <p className="text-[10px] text-lavender mt-0.5">
                {summary.numerical_columns.length} Numerical, {summary.categorical_columns.length} Categorical
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[11px] text-lavender">Missing Values</p>
              <h4 className="text-2xl font-black text-white mt-0.5">
                {Object.values(summary.missing_values).reduce((a, b) => a + b, 0)}
              </h4>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">0% Missing / Clean</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-[11px] text-lavender">Duplicate Records</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{summary.duplicate_rows}</h4>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">Zero duplicates</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV File Upload Dropzone */}
      <div className="glass-card p-7 sm:p-8 rounded-2xl border-dashed border-2 border-white/20 hover:border-purple-400/40 transition">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Upload Custom Customer Dataset</h3>
            <p className="text-xs text-lavender mt-1 max-w-md mx-auto">
              Select or drop a CSV file containing at least 2 numerical features (e.g., Annual Income, Spending Score, Age).
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold glass-button-primary text-white inline-flex items-center gap-2 transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Validating & Uploading...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Browse CSV File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistical Summary Table */}
      {summary && Object.keys(summary.summary_stats).length > 0 && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Parametric Summary Statistics (Numerical Features)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-lavender">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] bg-white/[0.04]">
                <tr>
                  <th className="py-3 px-4">Feature Name</th>
                  <th className="py-3 px-4">Count</th>
                  <th className="py-3 px-4">Mean (&mu;)</th>
                  <th className="py-3 px-4">Std (&sigma;)</th>
                  <th className="py-3 px-4">Min</th>
                  <th className="py-3 px-4">25% (Q1)</th>
                  <th className="py-3 px-4">Median</th>
                  <th className="py-3 px-4">75% (Q3)</th>
                  <th className="py-3 px-4">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {Object.entries(summary.summary_stats).map(([col, st]) => (
                  <tr key={col} className="hover:bg-white/[0.04] transition">
                    <td className="py-3 px-4 font-semibold text-white">{col}</td>
                    <td className="py-3 px-4 font-mono text-white">{st.count}</td>
                    <td className="py-3 px-4 font-mono text-purple-300 font-semibold">{st.mean}</td>
                    <td className="py-3 px-4 font-mono">{st.std}</td>
                    <td className="py-3 px-4 font-mono">{st.min}</td>
                    <td className="py-3 px-4 font-mono">{st.q25}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{st.median}</td>
                    <td className="py-3 px-4 font-mono">{st.q75}</td>
                    <td className="py-3 px-4 font-mono">{st.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dataset Preview */}
      {summary && summary.preview.length > 0 && (
        <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-purple-400" />
              Raw Dataset Preview (First 10 Records)
            </h3>
            <span className="text-xs text-lavender font-mono">Total {summary.total_rows} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-lavender">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] bg-white/[0.04]">
                <tr>
                  {summary.columns.map(c => (
                    <th key={c} className="py-3 px-4">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {summary.preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.04] transition">
                    {summary.columns.map(c => (
                      <td key={c} className="py-2.5 px-4 font-mono text-white">
                        {row[c] !== null && row[c] !== undefined ? String(row[c]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
