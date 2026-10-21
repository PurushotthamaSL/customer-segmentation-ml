import React, { useEffect, useState } from 'react';
import {
  TableProperties,
  Search,
  Download,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { fetchCustomers, fetchModelStatus, getExportCustomersUrl } from '../services/api';
import { CustomerListResponse, ModelMetadata } from '../types';
import { CustomerDetailModal } from '../components/CustomerDetailModal';
import { useToast } from '../components/ToastContext';

export const ExplorerPage: React.FC = () => {
  const [data, setData] = useState<CustomerListResponse | null>(null);
  const [model, setModel] = useState<ModelMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [cluster, setCluster] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>('All');
  const [minAge, setMinAge] = useState<number | undefined>(undefined);
  const [maxAge, setMaxAge] = useState<number | undefined>(undefined);
  const [minIncome, setMinIncome] = useState<number | undefined>(undefined);
  const [maxIncome, setMaxIncome] = useState<number | undefined>(undefined);
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [maxScore, setMaxScore] = useState<number | undefined>(undefined);
  
  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('CustomerID');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, m] = await Promise.all([
        fetchCustomers({
          search: search || undefined,
          cluster: cluster !== undefined ? cluster : undefined,
          gender: gender !== 'All' ? gender : undefined,
          min_age: minAge,
          max_age: maxAge,
          min_income: minIncome,
          max_income: maxIncome,
          min_score: minScore,
          max_score: maxScore,
          sort_by: sortBy,
          sort_dir: sortDir,
          page,
          page_size: pageSize
        }),
        model ? Promise.resolve(model) : fetchModelStatus()
      ]);
      setData(res);
      if (!model) setModel(m);
    } catch (err: any) {
      addToast('error', 'Failed to load customers', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, cluster, gender, minAge, maxAge, minIncome, maxIncome, minScore, maxScore, sortBy, sortDir, page, pageSize]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCluster(undefined);
    setGender('All');
    setMinAge(undefined);
    setMaxAge(undefined);
    setMinIncome(undefined);
    setMaxIncome(undefined);
    setMinScore(undefined);
    setMaxScore(undefined);
    setSortBy('CustomerID');
    setSortDir('asc');
    setPage(1);
    addToast('info', 'Filters Cleared');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Action & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-purple-400" />
            Customer Matrix & Explorer
          </h2>
          <p className="text-xs text-lavender mt-0.5">
            Filter, search individual customers, inspect centroid distances, and export records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getExportCustomersUrl(cluster)}
            download
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-500/90 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] border border-emerald-400/30 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lavender absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, Gender, or Segment Label..."
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder:text-muted"
            />
          </div>

          {/* Quick Gender Pills */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
            {['All', 'Female', 'Male'].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGender(g);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  gender === g ? 'bg-purple-600/35 text-white shadow-sm' : 'text-lavender hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Cluster Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-lavender font-medium">Cluster:</span>
            <select
              value={cluster !== undefined ? cluster : ''}
              onChange={(e) => {
                setCluster(e.target.value !== '' ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-dropdown px-3.5 py-2.5 rounded-xl text-xs text-white border border-white/10"
            >
              <option value="" className="bg-slate-900">All Clusters</option>
              {model?.clusters.map((c) => (
                <option key={c.cluster_id} value={c.cluster_id} className="bg-slate-900">
                  Cluster {c.cluster_id}: {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="p-2.5 rounded-xl glass-button-secondary text-lavender hover:text-white transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Range Numerical Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08] text-xs">
          {/* Age Range */}
          <div className="flex items-center gap-2">
            <span className="text-lavender shrink-0 font-medium">Age:</span>
            <input
              type="number"
              placeholder="Min"
              value={minAge ?? ''}
              onChange={(e) => {
                setMinAge(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxAge ?? ''}
              onChange={(e) => {
                setMaxAge(e.target.value ? parseInt(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
          </div>

          {/* Income Range */}
          <div className="flex items-center gap-2">
            <span className="text-lavender shrink-0 font-medium">Income ($k):</span>
            <input
              type="number"
              placeholder="Min"
              value={minIncome ?? ''}
              onChange={(e) => {
                setMinIncome(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxIncome ?? ''}
              onChange={(e) => {
                setMaxIncome(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
          </div>

          {/* Spending Score Range */}
          <div className="flex items-center gap-2">
            <span className="text-lavender shrink-0 font-medium">Score (1-100):</span>
            <input
              type="number"
              placeholder="Min"
              value={minScore ?? ''}
              onChange={(e) => {
                setMinScore(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxScore ?? ''}
              onChange={(e) => {
                setMaxScore(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="glass-input w-20 px-2 py-1.5 rounded-lg text-center font-mono"
            />
          </div>
        </div>
      </div>

      {/* Frosted Customer Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-lavender">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.08] bg-white/[0.04]">
              <tr>
                <th
                  onClick={() => handleSort('CustomerID')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Gender')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Gender</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Age')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Annual Income (k$)')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Annual Income</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Spending Score (1-100)')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Spending Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cluster')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Segment Label</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-lavender">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Filtering customer records...</span>
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((c) => {
                  const clusterObj = model?.clusters.find(cl => cl.cluster_id === c.cluster);
                  return (
                    <tr
                      key={c.CustomerID}
                      onClick={() => setSelectedCustomerId(c.CustomerID)}
                      className="hover:bg-purple-600/10 cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        #{c.CustomerID}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        {c.Gender || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white">
                        {c.Age} yrs
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                        ${c['Annual Income (k$)']}k
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300">
                        {c['Spending Score (1-100)']}/100
                      </td>
                      <td className="py-3.5 px-4">
                        {clusterObj ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap shadow-sm"
                            style={{
                              backgroundColor: clusterObj.color + '33',
                              border: `1px solid ${clusterObj.color}88`
                            }}
                          >
                            {clusterObj.label}
                          </span>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(c.CustomerID);
                          }}
                          className="p-1.5 rounded-lg glass-button-secondary text-lavender group-hover:text-white transition"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-lavender">
                    No customer records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/[0.08] text-xs text-lavender">
            <div>
              Showing {data.items.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, data.total)} of {data.total} customers
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="glass-dropdown px-2.5 py-1 rounded-lg text-xs text-white border border-white/10"
                >
                  <option value={10} className="bg-slate-900">10</option>
                  <option value={15} className="bg-slate-900">15</option>
                  <option value={25} className="bg-slate-900">25</option>
                  <option value={50} className="bg-slate-900">50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg glass-button-secondary disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-white px-2">
                  Page {page} of {data.total_pages}
                </span>
                <button
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg glass-button-secondary disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
};
