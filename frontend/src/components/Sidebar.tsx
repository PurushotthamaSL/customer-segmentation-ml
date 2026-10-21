import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  TableProperties,
  Layers,
  Sparkles,
  FlaskConical,
  Database,
  Info,
  Cpu,
  CircleDot,
  ArrowUpRight,
  ChevronRight,
  X
} from 'lucide-react';
import { fetchHealth, fetchModelStatus } from '../services/api';
import { HealthStatus, ModelMetadata } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [model, setModel] = useState<ModelMetadata | null>(null);

  const loadStatus = async () => {
    try {
      const [h, m] = await Promise.all([fetchHealth(), fetchModelStatus()]);
      setHealth(h);
      setModel(m);
    } catch {
      // silent catch for periodic refresh
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/segmentation', label: 'Customer Segments', icon: Users2 },
    { to: '/customers', label: 'Customer Explorer', icon: TableProperties },
    { to: '/profiles', label: 'Segment Profiles', icon: Layers },
    { to: '/insights', label: 'Business Insights', icon: Sparkles },
    { to: '/model-lab', label: 'Model Lab', icon: FlaskConical },
    { to: '/dataset', label: 'Dataset Management', icon: Database },
    { to: '/about', label: 'About Project', icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-sidebar flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                <div className="w-full h-full bg-[#080B18]/90 rounded-[10px] flex items-center justify-center backdrop-blur-md">
                  <Cpu className="w-5 h-5 text-purple-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    CustomerLens
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-lavender">Customer Segmentation</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-lavender hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-5 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              Analytics Suite
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/25 text-white border border-purple-400/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                        : 'text-lavender hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 transition-colors group-hover:text-purple-300" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-300" />
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Dataset Status Card */}
        <div className="p-4 m-3 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <CircleDot className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Dataset Loaded</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
              Active
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-medium text-white truncate">Mall_Customers.csv</p>
            <div className="flex items-center justify-between text-[11px] text-lavender">
              <span>200 Customer Records</span>
              <span>5 Features</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
            <span className="text-lavender">Model Status</span>
            <span className="font-mono text-purple-300 font-semibold">
              {model ? `K = ${model.n_clusters} Clusters` : 'K-Means Ready'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
